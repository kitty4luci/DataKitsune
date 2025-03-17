import {
  CollectionResponse,
  r2rClient,
  WrappedCollectionResponse,
} from "r2r-js";
import { FinalNotificationDto } from "../dtos/final-notification.dto";
import { InjectR2rDto } from "../dtos/inject-r2r";
import { IHandler } from "../interfaces/handler";
import { IQueue } from "../interfaces/queue";
import { R2rCollectionMapRepository } from "../repositories/r2r-collection-map.repository";
import { Logger } from "../services/system/logger";

export class R2rHandler implements IHandler<InjectR2rDto> {
  private readonly logger = new Logger(R2rHandler.name);

  constructor(
    private readonly r2r: r2rClient,
    private readonly map: R2rCollectionMapRepository,
    private readonly finalizerQueue: IQueue<FinalNotificationDto>
  ) {}

  async handle(data: InjectR2rDto): Promise<void> {
    const name = this.getName(data);
    const collection = await this.getCollection(name);
    try {
      const added = await this.map.tryAddCollection(
        data.link.messenger,
        data.link.contextId,
        collection.id
      );

      if (added) {
        this.logger.info("Added mapping", {
          name,
          collectionId: collection.id,
        });
      }
    } catch (error) {
      this.logger.error("Failed to add collection", {
        name,
        collectionId: collection.id,
        error,
      });
      return;
    }
    if (!data.content || !data.content.content) {
      this.logger.error("No content to ingest", {
        collectionName: name,
        collectionId: collection.id,
        linkId: data.link.id,
        url: data.link.url,
      });
      return;
    }

    let documentId: string;

    try {
      const response = await this.r2r.documents.create({
        ingestionMode: "hi-res",
        raw_text: data.content.content,
        collectionIds: [collection.id],
        metadata: {
          url: data.link.url,
          linkId: data.link.id,
          messenger: data.link.messenger,
          contextId: data.link.contextId,
          messageId: data.link.messageId,
        },
      });

      documentId = response.results.documentId;

      this.logger.info("Ingested document", {
        collectionName: name,
        collectionId: collection.id,
        documentId: documentId,
        url: data.link.url,
      });

      await this.sendToFinalizerQueue(data, collection.id, documentId);
    } catch (error) {
      if (String(error).includes("Status 409")) {
        this.logger.warn("Document already exists", {
          collectionName: name,
          collectionId: collection.id,
          url: data.link.url,
        });

        await this.sendToFinalizerQueue(data, collection.id);
        return;
      }

      this.logger.error("Failed to ingest document", {
        collectionName: name,
        collectionId: collection.id,
        url: data.link.url,
        error,
      });
      return;
    }
  }

  private async getCollection(name: string): Promise<CollectionResponse> {
    let collection: WrappedCollectionResponse;
    try {
      collection = await this.r2r.collections.retrieveByName({ name });
    } catch (error) {
      this.logger.info("Creating new collection", {
        name,
        reason: "Collection not found",
      });
      collection = await this.r2r.collections.create({ name });
    }

    return collection.results;
  }

  private getName(data: InjectR2rDto): string {
    return `${data.link.messenger}_${data.link.contextId}`;
  }

  private async sendToFinalizerQueue(
    data: InjectR2rDto,
    collectionId: string,
    documentId?: string
  ): Promise<void> {
    try {
      const finalNotification = new FinalNotificationDto(
        "r2r-injector",
        data.messenger,
        {
          telegramMessage: data.telegramMessage,
          discordMessage: data.discordMessage,
          link: data.link,
          content: data.content,
          description: data.description,
          index: {
            collectionId: collectionId,
            documentId: documentId,
          },
        }
      );

      await this.finalizerQueue.enqueue(finalNotification);
      this.logger.info("Sent notification to finalizer queue", {
        collectionId: collectionId,
        documentId: documentId,
        messenger: data.messenger,
      });
    } catch (notificationError) {
      this.logger.error("Failed to send notification to finalizer queue", {
        collectionId: collectionId,
        documentId: documentId,
        error: notificationError,
      });
    }
  }
}
