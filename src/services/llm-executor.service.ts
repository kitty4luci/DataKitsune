import { Logger } from "./system/logger";
import { LlmService } from "./llm-service";
import { LocalPromptService } from "./local-prompt-service";
import { PromptFormatter } from "./prompt-formatter";

export interface LlmPromptData {
  variables: Record<string, string>;
  linkId?: number | string;
  url?: string;
}

export class LlmExecutorService {
  private readonly logger: Logger = new Logger(LlmExecutorService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly localPromptService: LocalPromptService
  ) {}

  async executeWithGemini(
    promptName: string,
    model: string,
    data: LlmPromptData,
    videoUrl?: string
  ): Promise<string | null> {
    try {
      const template = await this.localPromptService.getPromptWithVars(
        promptName,
        data.variables
      );

      const prompt = videoUrl
        ? PromptFormatter.toGeminiWithVideoUrl(template, videoUrl)
        : PromptFormatter.toGemini(template);

      const [content, tokensIn, tokensOut] = await this.llmService.runGemini(
        prompt,
        model
      );

      return content;
    } catch (error) {
      this.logger.error("Error executing with Gemini", {
        error: error instanceof Error ? error.message : String(error),
        linkId: data.linkId,
        url: data.url,
        promptName,
        model,
      });
      return null;
    }
  }

  async executeWithOpenAi(
    promptName: string,
    model: string,
    data: LlmPromptData
  ): Promise<string | null> {
    try {
      const template = await this.localPromptService.getPromptWithVars(
        promptName,
        data.variables
      );
      const prompt = PromptFormatter.toOpenAi(template);
      const [content, tokensIn, tokensOut] = await this.llmService.runOpenAi(
        prompt,
        model
      );
      return content;
    } catch (error) {
      this.logger.error("Error executing with OpenAI", {
        error: error instanceof Error ? error.message : String(error),
        linkId: data.linkId,
        url: data.url,
        promptName,
        model,
      });
      return null;
    }
  }

  async executeWithGrok(
    promptName: string,
    model: string,
    data: LlmPromptData
  ): Promise<string | null> {
    try {
      const template = await this.localPromptService.getPromptWithVars(
        promptName,
        data.variables
      );
      const prompt = PromptFormatter.toOpenAi(template);
      const [content, tokensIn, tokensOut] = await this.llmService.runGrok(
        prompt,
        model
      );
      return content;
    } catch (error) {
      this.logger.error("Error executing with Grok", {
        error: error instanceof Error ? error.message : String(error),
        linkId: data.linkId,
        url: data.url,
        promptName,
        model,
      });
      return null;
    }
  }
}
