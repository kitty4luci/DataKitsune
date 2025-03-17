import { r2rClient } from "r2r-js";
import { Messenger } from "src/dtos/messenger.type";
import { R2rCollectionMapRepository } from "src/repositories/r2r-collection-map.repository";
import { SearchStatsRepository } from "src/repositories/search-stats.repository";
import { Logger } from "./system/logger";

export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly r2r: r2rClient,
    private readonly map: R2rCollectionMapRepository,
    private readonly searchStatsRepository: SearchStatsRepository
  ) {}

  async search(
    messenger: Messenger,
    contextId: string,
    searchText: string,
    userId: string,
    username: string
  ): Promise<{ url: string; messageId: string; linkId: string }[]> {
    if (!searchText || searchText.length < 3) return [];

    const startTime = Date.now();

    const collectionId = await this.map.getCollectionId(messenger, contextId);
    if (!collectionId) return [];

    const result = await this.r2r.retrieval.rag({
      query: searchText,
      searchMode: "advanced",
      searchSettings: {
        limit: 5,
        useHybridSearch: true,
        useFullTextSearch: true,
        includeMetadata: true,
        includeScores: true,
        filters: {
          collection_ids: { $overlap: [collectionId] },
        },
      },
      ragGenerationConfig: {
        model: "gpt-4o",
        temperature: 0.5,
        stream: false,
      },
    });

    this.logger.info(`Search query executed`, { query: searchText });

    if (
      result.results &&
      result.results.searchResults &&
      result.results.searchResults.chunkSearchResults
    ) {
      const formattedResults =
        result.results.searchResults.chunkSearchResults.map((r, index) => {
          this.logger.debug("Search result details", {
            index,
            score: r.score,
            metadata: r.metadata,
          });
          return {
            url: r.metadata.url,
            messageId: r.metadata.messageid,
            linkId: r.metadata.linkid,
          };
        });

      const elapsedTimeMs = Date.now() - startTime;

      try {
        await this.searchStatsRepository.saveSearchStats(
          messenger,
          contextId,
          userId || null,
          username || null,
          searchText,
          elapsedTimeMs,
          result.results.searchResults.chunkSearchResults.map((r) => ({
            url: r.metadata.url,
            linkId: r.metadata.linkid,
            messageId: r.metadata.messageid,
            score: r.score,
          }))
        );
      } catch (error) {
        this.logger.error("Failed to save search statistics", { error });
      }

      return formattedResults;
    }

    this.logger.warn("No search results found", {
      messenger,
      contextId,
      searchText,
      result,
    });

    const elapsedTimeMs = Date.now() - startTime;

    try {
      await this.searchStatsRepository.saveSearchStats(
        messenger,
        contextId,
        userId || null,
        username || null,
        searchText,
        elapsedTimeMs,
        []
      );
    } catch (error) {
      this.logger.error("Failed to save search statistics", { error });
    }

    return [];
  }
}
