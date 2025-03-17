export type Messenger = "telegram" | "discord";

export interface LinkWithDescription {
  url: string;
  description?: string;
}
