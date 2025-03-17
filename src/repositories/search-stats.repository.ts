import { Repository } from "typeorm";
import { SearchStatsEntity } from "../entities/search-stats.entity";

export class SearchStatsRepository {
  constructor(private readonly repository: Repository<SearchStatsEntity>) {}

  async saveSearchStats(
    messenger: string,
    contextId: string,
    userId: string | null,
    username: string | null,
    query: string,
    elapsedTimeMs: number,
    results: Array<{
      url: string;
      linkId: string;
      messageId: string;
      score: number;
    }>
  ): Promise<SearchStatsEntity> {
    const searchStats = new SearchStatsEntity();
    searchStats.messenger = messenger;
    searchStats.contextId = contextId;
    searchStats.userId = userId;
    searchStats.username = username;
    searchStats.query = query;
    searchStats.elapsedTimeMs = elapsedTimeMs;
    searchStats.results = results;

    return this.repository.save(searchStats);
  }

  async getRecentSearches(limit: number = 10): Promise<SearchStatsEntity[]> {
    return this.repository.find({
      order: {
        createdAt: "DESC",
      },
      take: limit,
    });
  }

  async getSearchStatsByUser(
    userId: string,
    limit: number = 10
  ): Promise<SearchStatsEntity[]> {
    return this.repository.find({
      where: {
        userId,
      },
      order: {
        createdAt: "DESC",
      },
      take: limit,
    });
  }

  async getSearchStatsByMessengerContext(
    messenger: string,
    contextId: string,
    limit: number = 10
  ): Promise<SearchStatsEntity[]> {
    return this.repository.find({
      where: {
        messenger,
        contextId,
      },
      order: {
        createdAt: "DESC",
      },
      take: limit,
    });
  }

  async getAverageQueryTime(timeWindowMinutes: number = 60): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("search_stats")
      .select("AVG(search_stats.elapsed_time_ms)", "avgTime")
      .where("search_stats.created_at > :timeWindow", {
        timeWindow: new Date(Date.now() - timeWindowMinutes * 60 * 1000),
      })
      .getRawOne();

    return result?.avgTime || 0;
  }
}
