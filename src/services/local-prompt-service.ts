import * as fs from "fs";
import * as path from "path";
import { IPrompt } from "src/interfaces/prompt";
import { Logger } from "./system/logger";

interface PromptMessage {
  type: string;
  content: string;
}

interface PromptConfig {
  [promptName: string]: {
    prompt: PromptMessage[];
  };
}

export class LocalPromptService {
  private prompts: PromptConfig = {};
  private readonly logger: Logger = new Logger(LocalPromptService.name);

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      const promptsFilePath = path.resolve(process.cwd(), "prompts.json");
      const fileContent = fs.readFileSync(promptsFilePath, "utf8");
      this.prompts = JSON.parse(fileContent);
    } catch (error) {
      console.error("Failed to load prompts.json:", error);
      throw new Error(
        "Failed to initialize LocalPromptService: " + (error as Error).message
      );
    }
  }

  async getPromptWithVars(
    promptName: string,
    map: Record<string, string>
  ): Promise<IPrompt> {
    if (!this.prompts[promptName]) {
      throw new Error(`Prompt not found for name: ${promptName}`);
    }

    const promptMessages = this.prompts[promptName].prompt;

    return {
      blocks: promptMessages.map((message) => ({
        type: message.type,
        content: message.content.replace(
          /{{(.*?)}}/g,
          (_, key) => map[key] || ""
        ),
      })),
    };
  }
}
