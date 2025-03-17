import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";
import OpenAI from "openai";

export class LlmService {
  constructor(
    private readonly openAi: OpenAI,
    private readonly grokAi: OpenAI,
    private readonly vertexAi: VertexAI
  ) {}

  async runGrok(
    formattedPrompt: any,
    model: string = "grok-2-latest"
  ): Promise<[string | null, number, number]> {
    try {
      const response = await this.grokAi.chat.completions.create({
        model,
        messages: formattedPrompt,
      });

      return [
        response.choices[0].message.content,
        response.usage.prompt_tokens,
        response.usage.completion_tokens,
      ];
    } catch (error) {
      console.error("Failed to run OpenAI", { error });
      return [null, 0, 0];
    }
  }

  // return [response, tokensIn, tokensOut]
  async runOpenAi(
    formattedPrompt: any,
    model: string = "gpt-4o"
  ): Promise<[string | null, number, number]> {
    try {
      const response = await this.openAi.chat.completions.create({
        model,
        messages: formattedPrompt,
      });

      return [
        response.choices[0].message.content,
        response.usage.prompt_tokens,
        response.usage.completion_tokens,
      ];
    } catch (error) {
      console.error("Failed to run OpenAI", { error });
      return [null, 0, 0];
    }
  }

  async runGemini(
    formattedPrompt: [any, any],
    model: string = "gemini-1.5-pro"
  ): Promise<[string | null, number, number]> {
    try {
      const generativeModel = this.vertexAi.getGenerativeModel({
        model,
        systemInstruction: formattedPrompt[0],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const response = await generativeModel.generateContent({
        contents: formattedPrompt[1],
      });

      if (response.response.candidates[0].finishReason === "SAFETY") {
        console.error(
          "Content blocked by safety filters",
          response.response.candidates[0].safetyRatings
        );
        return [null, response.response.usageMetadata.promptTokenCount, 0];
      }

      return [
        response.response.candidates[0].content.parts[0].text,
        response.response.usageMetadata.promptTokenCount,
        response.response.usageMetadata.candidatesTokenCount,
      ];
    } catch (error) {
      console.error("Failed to run Gemini", { error });
      return [null, 0, 0];
    }
  }
}
