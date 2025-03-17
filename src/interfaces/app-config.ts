export type AppConfig = {
  appMode: string;
  appPort: number;
  appPrefix: string;

  telegramBotApiToken: string;
  telegramBotWebhookDomain: string;
  telegramBotWebhookPath: string;
  telegramBotUsername: string;

  firecrawlApiKey: string;

  postgresHost: string;
  postgresPort: number;
  postgresUser: string;
  postgresPassword: string;
  postgresDb: string;

  redisConnectionString: string;

  openAiKey: string;

  googleLocation: string;
  googleProjectId: string;
  googleCredentials: string;

  grokApiKey: string;

  r2rBaseUrl: string;
  r2rUser: string;
  r2rPassword: string;

  saveLinkQueue: string;
  parseContentQueue: string;
  describeContentQueue: string;
  r2rInjectorQueue: string;
  scheduledUpdatesQueue: string;
  finalizerQueue: string;
};
