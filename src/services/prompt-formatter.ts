import { IPrompt } from "../interfaces/prompt";

export class PromptFormatter {
  static toOpenAi(prompt: IPrompt): any {
    return prompt.blocks.map((block) => ({
      role: block.type,
      content: block.content,
    }));
  }

  static toGemini(prompt: IPrompt): [any, any] {
    const systemBlocks = prompt.blocks.filter(
      (block) => block.type === "system"
    );
    const systemInstruction = {
      role: "system",
      parts: systemBlocks.map((block) => ({
        text: block.content,
      })),
    };

    const userBlocks = prompt.blocks.filter((block) => block.type === "user");
    const contents = userBlocks.map((block) => ({
      role: "user",
      parts: [
        {
          text: block.content,
        },
      ],
    }));

    return [systemInstruction, contents];
  }

  // return [systemInstruction, contents]
  static toGeminiWithVideoUrl(prompt: IPrompt, uri?: string): [any, any] {
    const systemBlocks = prompt.blocks.filter(
      (block) => block.type === "system"
    );
    const systemInstruction = {
      role: "system",
      parts: systemBlocks.map((block) => ({
        text: block.content,
      })),
    };

    const userBlocks = prompt.blocks.filter((block) => block.type === "user");
    const contents = userBlocks.map((block, index) => {
      if (uri && index === 0) {
        return {
          role: "user",
          parts: [
            {
              text: block.content,
            },
            {
              fileData: {
                fileUri: uri,
                mimeType: "video/mp4",
              },
            },
          ],
        };
      }

      return {
        role: "user",
        parts: [
          {
            text: block.content,
          },
        ],
      };
    });

    return [systemInstruction, contents];
  }
}
