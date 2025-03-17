import { UriService } from "../services/uri-service";
import { DescribeContentDto } from "../dtos/describe-content.dto";
import { IHandler } from "../interfaces/handler";
import { DescriptionRepository } from "../repositories/description.repository";
import { DescriptionEntity } from "../entities/description.entity";
import { IQueue } from "../interfaces/queue";
import { InjectR2rDto } from "../dtos/inject-r2r";
import { Logger } from "../services/system/logger";
import { LlmExecutorService } from "../services/llm-executor.service";

export class DescriptionHandler implements IHandler<DescribeContentDto> {
  private readonly logger: Logger = new Logger(DescriptionHandler.name);

  constructor(
    private readonly llmExecutor: LlmExecutorService,
    private readonly descriptionRepository: DescriptionRepository,
    private readonly r2rInjectorQueue: IQueue<InjectR2rDto>
  ) {}

  async handle(data: DescribeContentDto): Promise<void> {
    this.logger.info(`Start describing content for URL: ${data.link.url}`);
    const description = await this.describeContent(data);
    if (!description) {
      this.logger.error("Failed to describe content", { data });
      return;
    }

    let entity: DescriptionEntity;
    try {
      entity = await this.descriptionRepository.addDescription({
        linkId: data.link.id,
        description,
      });
      this.logger.info(`Saved description for URL ${data.link.url}`);
    } catch (error) {
      this.logger.error("Failed to save description", { data, error });
      return;
    }

    const dto = new InjectR2rDto(
      data.link,
      data.content,
      entity,
      data.messenger,
      {
        telegramMessage: data.telegramMessage,
      }
    );

    try {
      await this.r2rInjectorQueue.enqueue(dto);
    } catch (error) {
      this.logger.error("Failed to enqueue R2R queue", { dto, error });
      return;
    }
  }

  private async describeContent(data: DescribeContentDto): Promise<string> {
    if (UriService.isYouTubeUrl(data.link.url)) {
      this.logger.info(`Describing YouTube content: ${data.link.url}`);
      return await this.llmExecutor.executeWithOpenAi(
        "describe-youtube-prompt",
        "gpt-4o",
        {
          variables: { CONTENT: data.content.content },
          linkId: data.link.id,
          url: data.link.url,
        }
      );
    } else if (UriService.isXUrl(data.link.url)) {
      this.logger.info(`Describing X content: ${data.link.url}`);
      return await this.llmExecutor.executeWithOpenAi(
        "describe-xcom-prompt",
        "gpt-4o",
        {
          variables: { CONTENT: data.content.content },
          linkId: data.link.id,
          url: data.link.url,
        }
      );
    } else if (UriService.isTelegramUrl(data.link.url)) {
      this.logger.info(`Describing Telegram content: ${data.link.url}`);
      return await this.llmExecutor.executeWithOpenAi(
        "describe-telegram-prompt",
        "gpt-4o",
        {
          variables: { CONTENT: data.content.content },
          linkId: data.link.id,
          url: data.link.url,
        }
      );
    } else {
      this.logger.info(`Describing website content: ${data.link.url}`);
      let description = await this.llmExecutor.executeWithOpenAi(
        "describe-website-prompt",
        "gpt-4o",
        {
          variables: { CONTENT: data.content.content },
          linkId: data.link.id,
          url: data.link.url,
        }
      );

      if (!description) {
        this.logger.warn(
          `Failed to describe website content with OpenAI, run with Gemini: ${data.link.url}`
        );
        description = await this.llmExecutor.executeWithGemini(
          "describe-website-prompt",
          "gemini-1.5-pro",
          {
            variables: { CONTENT: data.content.content },
            linkId: data.link.id,
            url: data.link.url,
          }
        );
      }

      return description;
    }
  }
}
