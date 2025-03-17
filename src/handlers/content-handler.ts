import { DescribeContentDto } from "../dtos/describe-content.dto";
import { ParseContentDto } from "../dtos/parse-content.dto";
import { IHandler } from "../interfaces/handler";
import { IQueue } from "../interfaces/queue";
import { ContentRepository } from "../repositories/content.repository";
import FirecrawlApp from "@mendable/firecrawl-js";
import { ContentEntity } from "../entities/content.entity";
import { UriService } from "../services/uri-service";
import { Logger } from "../services/system/logger";
import { OgScraperService } from "../services/og-scraper.service";
import { LlmExecutorService } from "../services/llm-executor.service";

export class ContentHandler implements IHandler<ParseContentDto> {
  private readonly logger = new Logger(ContentHandler.name);
  private readonly ogScraper: OgScraperService;

  constructor(
    private readonly firecrawl: FirecrawlApp,
    private readonly llmExecutor: LlmExecutorService,
    private readonly contentRepository: ContentRepository,
    private readonly describeContentQueue: IQueue<DescribeContentDto>
  ) {
    this.ogScraper = new OgScraperService();
  }

  async handle(data: ParseContentDto): Promise<void> {
    this.logger.info(`Handling URL: ${data.link.url}`);
    const { content, title, language } = await this.readContent(data);

    if (!content) {
      this.logger.error("Failed to read content", { url: data.link.url });
      return;
    }

    let entity: ContentEntity;
    try {
      entity = await this.contentRepository.addContent({
        linkId: data.link.id,
        title,
        content,
        language,
      });
      this.logger.info(`Content saved for URL ${data.link.url}`);
    } catch (error) {
      this.logger.error("Failed to save content", { data, error });
      return;
    }

    const describeDto = new DescribeContentDto(
      data.link,
      entity,
      data.messenger,
      {
        telegramMessage: data.telegramMessage,
      }
    );

    try {
      await this.describeContentQueue.enqueue(describeDto);
    } catch (error) {
      this.logger.error("Failed to enqueue content for description", {
        error,
        dto: describeDto,
        data,
      });
      return;
    }
  }

  private async readContent(
    data: ParseContentDto
  ): Promise<{ content: string; title: string; language: string }> {
    let title: string = null;
    let content: string = null;
    let language: string = null;

    if (UriService.isYouTubeUrl(data.link.url)) {
      this.logger.info(`Running Gemini for YouTube video: ${data.link.url}`);
      content = await this.llmExecutor.executeWithGemini(
        "read-content-youtube-prompt",
        "gemini-1.5-pro",
        {
          variables: { URL: data.link.url },
          url: data.link.url,
        },
        data.link.url
      );
    } else if (UriService.isXUrl(data.link.url)) {
      this.logger.info(`Running Grok for X.com tweet: ${data.link.url}`);
      content = await this.llmExecutor.executeWithGrok(
        "read-content-xcom-prompt",
        "grok-2-latest",
        {
          variables: { URL: data.link.url },
          url: data.link.url,
        }
      );
    } else if (UriService.isRedditUrl(data.link.url)) {
      this.logger.info(`Scraping OG data for Reddit: ${data.link.url}`);
      const ogData = await this.ogScraper.scrapeOgTags(data.link.url);

      if (ogData.title || ogData.description) {
        content = JSON.stringify(ogData);
        title = ogData.title;
        language = ogData.language || "en";
        this.logger.info(
          `Successfully extracted Reddit OG data: ${data.link.url}`,
          { ogData }
        );
      } else {
        this.logger.error(
          `Failed to extract Reddit OG data, falling back to Firecrawl: ${data.link.url}`
        );
        try {
          const response = await this.firecrawl.scrapeUrl(data.link.url, {
            formats: ["markdown"],
          });

          if (response.success) {
            content = response.markdown;
            title = response.title;
            language = response.metadata.language;
          } else {
            this.logger.error(
              `Failed to crawl Reddit; Running OpenAI gpt-4o: ${data.link.url}`
            );
            content = await this.llmExecutor.executeWithOpenAi(
              "read-content-website-prompt",
              "gpt-4o",
              {
                variables: { URL: data.link.url },
                url: data.link.url,
              }
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to crawl Reddit; Running OpenAI gpt-4o: ${data.link.url}`
          );
          content = await this.llmExecutor.executeWithOpenAi(
            "read-content-website-prompt",
            "gpt-4o",
            {
              variables: { URL: data.link.url },
              url: data.link.url,
            }
          );
        }
      }
    } else if (UriService.isTelegramUrl(data.link.url)) {
      this.logger.info(`Scraping OG data for Telegram: ${data.link.url}`);
      const ogData = await this.ogScraper.scrapeOgTags(data.link.url);

      if (ogData.title || ogData.description) {
        content = JSON.stringify(ogData);
        title = ogData.title;
        language = ogData.language || "en";
        this.logger.info(
          `Successfully extracted Telegram OG data: ${data.link.url}`,
          { ogData }
        );
      } else {
        this.logger.error(
          `Failed to extract Telegram OG data, falling back to Firecrawl: ${data.link.url}`
        );
        try {
          const response = await this.firecrawl.scrapeUrl(data.link.url, {
            formats: ["markdown"],
          });

          if (response.success) {
            content = response.markdown;
            title = response.title;
            language = response.metadata.language;
          } else {
            this.logger.error(
              `Failed to crawl Telegram; Running OpenAI gpt-4o: ${data.link.url}`
            );
            content = await this.llmExecutor.executeWithOpenAi(
              "read-content-website-prompt",
              "gpt-4o",
              {
                variables: { URL: data.link.url },
                url: data.link.url,
              }
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to crawl Telegram; Running OpenAI gpt-4o: ${data.link.url}`
          );
          content = await this.llmExecutor.executeWithOpenAi(
            "read-content-website-prompt",
            "gpt-4o",
            {
              variables: { URL: data.link.url },
              url: data.link.url,
            }
          );
        }
      }
    } else {
      this.logger.info(
        `Running Firecrawl for Website Content: ${data.link.url}`
      );
      const response = await this.firecrawl.scrapeUrl(data.link.url, {
        formats: ["markdown"],
      });

      if (response.success) {
        content = response.markdown;
        title = response.title;
        language = response.metadata.language;
      } else {
        this.logger.error(
          `Failed to crawl; Running OpenAI gpt-4o for Website Content: ${data.link.url}`
        );
        content = await this.llmExecutor.executeWithOpenAi(
          "read-content-website-prompt",
          "gpt-4o",
          {
            variables: { URL: data.link.url },
            url: data.link.url,
          }
        );
      }
    }

    return { content, title, language };
  }
}
