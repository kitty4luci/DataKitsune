import axios from "axios";
import { Logger } from "./system/logger";

export interface OgData {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  language?: string;
}

export class OgScraperService {
  private readonly logger = new Logger(OgScraperService.name);

  constructor() {}

  async scrapeOgTags(url: string): Promise<OgData> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const html = response.data;
      const ogData: OgData = {};

      this.extractTag(html, "og:title", (value) => {
        ogData.title = value;
      });
      this.extractTag(html, "og:description", (value) => {
        ogData.description = value;
      });
      this.extractTag(html, "og:url", (value) => {
        ogData.url = value;
      });
      this.extractTag(html, "og:type", (value) => {
        ogData.type = value;
      });
      this.extractTag(html, "og:image", (value) => {
        ogData.image = value;
      });
      this.extractTag(html, "og:site_name", (value) => {
        ogData.siteName = value;
      });
      this.extractTag(html, "og:locale", (value) => {
        ogData.locale = value;
      });

      this.extractTag(
        html,
        "content-language",
        (value) => {
          ogData.language = value;
        },
        "http-equiv"
      );
      if (!ogData.language) {
        const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["'][^>]*>/i);
        if (langMatch && langMatch[1]) {
          ogData.language = langMatch[1];
        }
      }

      this.extractTag(
        html,
        "author",
        (value) => {
          ogData.author = value;
        },
        "name"
      );

      this.logger.info(`Scraped OG data for URL: ${url}`, { ogData });
      return ogData;
    } catch (error) {
      this.logger.error(`Error scraping OG tags from ${url}`, { error });
      return {};
    }
  }

  private extractTag(
    html: string,
    property: string,
    setter: (value: string) => void,
    attributeName: string = "property"
  ): void {
    const regex = new RegExp(
      `<meta\\s+${attributeName}=["']${property}["']\\s+content=["']([^"']*)["'][^>]*>|<meta\\s+content=["']([^"']*)["']\\s+${attributeName}=["']${property}["'][^>]*>`,
      "i"
    );
    const match = html.match(regex);
    if (match) {
      setter(match[1] || match[2]);
    }
  }

  formatContent(ogData: OgData): string {
    let content = "";

    if (ogData.title) {
      content += `# ${ogData.title}\n\n`;
    }

    if (ogData.author) {
      content += `Author: ${ogData.author}\n\n`;
    }

    if (ogData.description) {
      content += `${ogData.description}\n\n`;
    }

    if (ogData.image) {
      content += `![Image](${ogData.image})\n\n`;
    }

    if (ogData.siteName) {
      content += `Source: ${ogData.siteName}`;
      if (ogData.url) {
        content += ` (${ogData.url})`;
      }
      content += "\n";
    } else if (ogData.url) {
      content += `Source: ${ogData.url}\n`;
    }

    return content.trim();
  }
}
