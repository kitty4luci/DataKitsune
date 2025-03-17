import { DataSource, Repository } from "typeorm";
import { ChatSubscription } from "../entities/chat-subscription.entity";

export class ChatSubscriptionRepository {
  private repository: Repository<ChatSubscription>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ChatSubscription);
  }

  async save(subscription: ChatSubscription): Promise<ChatSubscription> {
    return this.repository.save(subscription);
  }

  async findBySubscriber(
    messenger: string,
    contextId: string,
    actorId: string
  ): Promise<ChatSubscription | null> {
    return this.repository.findOne({
      where: {
        messenger,
        contextId,
        actorId,
      },
    });
  }

  async findAllActorsByContextId(
    messenger: string,
    contextId: string
  ): Promise<ChatSubscription[]> {
    return this.repository.find({
      where: {
        messenger,
        contextId,
        enabled: true,
      },
    });
  }

  async findAllContextIdsByActor(
    messenger: string,
    actorId: string
  ): Promise<string[]> {
    const subscriptions = await this.repository.find({
      select: ["contextId"],
      where: {
        messenger,
        actorId,
        enabled: true,
      },
    });

    return subscriptions.map((sub) => sub.contextId);
  }

  async toggleSubscription(
    messenger: string,
    contextId: string,
    actorId: string,
    enabled: boolean
  ): Promise<boolean> {
    const subscription = await this.findBySubscriber(
      messenger,
      contextId,
      actorId
    );

    if (!subscription) {
      return false;
    }

    subscription.enabled = enabled;
    await this.repository.save(subscription);
    return true;
  }
}
