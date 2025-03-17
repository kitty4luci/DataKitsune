import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { RedisQueue } from "../../services/redis-queue";
import { Worker } from "../system/worker";
import { PostgresProvider } from "../../database/postgres-provider";
import { OpenAI } from "openai";
import { ContentHandler } from "../../handlers/content-handler";
import { ContentRepository } from "../../repositories/content.repository";
import { VertexAI } from "@google-cloud/vertexai";
import { LocalPromptService } from "../../services/local-prompt-service";
import { LlmService } from "../../services/llm-service";
import { LlmExecutorService } from "../../services/llm-executor.service";
import FirecrawlApp from "@mendable/firecrawl-js";
import { IWorker } from "../../interfaces/worker";

export async function configureContentParserApp(
  server: Server,
  config: AppConfig,
  activeWorkers: IWorker<any>[]
): Promise<void> {
  const provider = await PostgresProvider.getConnection(
    config.postgresHost,
    config.postgresPort,
    config.postgresUser,
    config.postgresPassword,
    config.postgresDb
  );

  const contentRepo = new ContentRepository(provider);

  const parseContentQueue = new RedisQueue(
    config.parseContentQueue,
    config.redisConnectionString
  );

  const describeContentQueue = new RedisQueue(
    config.describeContentQueue,
    config.redisConnectionString
  );

  const localPromptService = new LocalPromptService();

  const firecrawl = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  const openAi = new OpenAI({ apiKey: config.openAiKey });
  const grokAi = new OpenAI({
    apiKey: config.grokApiKey,
    baseURL: "https://api.x.ai/v1",
  });

  const vertexAi = new VertexAI({
    project: config.googleProjectId,
    location: config.googleLocation,
    googleAuthOptions: {
      credentials: JSON.parse(
        Buffer.from(config.googleCredentials, "base64").toString()
      ),
    },
  });

  const llmService = new LlmService(openAi, grokAi, vertexAi);
  const llmExecutor = new LlmExecutorService(llmService, localPromptService);

  const worker = new Worker(
    parseContentQueue,
    new ContentHandler(
      firecrawl,
      llmExecutor,
      contentRepo,
      describeContentQueue
    )
  );

  activeWorkers.push(worker);
  worker.start();
  server.configure({ worker });
}
