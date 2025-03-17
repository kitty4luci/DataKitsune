import { ChatSubscription } from "../entities/chat-subscription.entity";
import { ChatSubscriptionRepository } from "../repositories/chat-subscription.repository";

export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: ChatSubscriptionRepository
  ) {}

  async subscribe(
    messenger: string,
    contextId: string,
    actorId: string,
    actorUsername?: string
  ): Promise<ChatSubscription> {
    let subscription = await this.subscriptionRepository.findBySubscriber(
      messenger,
      contextId,
      actorId
    );

    if (!subscription) {
      subscription = new ChatSubscription();
      subscription.messenger = messenger;
      subscription.contextId = contextId;
      subscription.actorId = actorId;
      subscription.actorUsername = actorUsername;
    }

    subscription.enabled = true;

    return this.subscriptionRepository.save(subscription);
  }

  async unsubscribe(
    messenger: string,
    contextId: string,
    actorId: string
  ): Promise<boolean> {
    return this.subscriptionRepository.toggleSubscription(
      messenger,
      contextId,
      actorId,
      false
    );
  }

  async getSubscribedContextIds(
    messenger: string,
    actorId: string
  ): Promise<string[]> {
    return this.subscriptionRepository.findAllContextIdsByActor(
      messenger,
      actorId
    );
  }

  async getSubscribedActors(
    messenger: string,
    contextId: string
  ): Promise<ChatSubscription[]> {
    return this.subscriptionRepository.findAllActorsByContextId(
      messenger,
      contextId
    );
  }
}
