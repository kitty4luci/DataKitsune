# 🦊 [Data Kitsune](https://datakitsune.com)

- **Idea** by Alexey [@darkolorin](https://github.com/darkolorin) Moiseenkov
- **Design** by Oleksandr [@alexbemore](https://github.com/alexbemore) Shatov
- **Executed** by Vladimir [@matterai](https://github.com/matterai) Vlasiuk

Data Kitsune is a microservices-based application for content extraction, processing, and delivery through Telegram. It leverages multiple AI services, including OpenAI, Gemini, Grok, and R2R for enhanced content understanding and retrieval.

## Overview

The application functions as a Telegram bot that:

1. Captures links shared in Telegram
2. Extracts content using Firecrawl
3. Uses AI to process and summarize the content
4. Stores the content in a searchable database
5. Delivers summaries and notifications to users

## Architecture

The application is built using a microservices architecture with the following components:

### Services

- **telegram-listener**: Processes incoming Telegram messages and commands
- **links-saver**: Saves shared links to the database
- **content-parser**: Extracts content from links using Firecrawl and AI
- **description-writer**: Generates summaries of extracted content
- **r2r-injector**: Stores processed content in R2R for vectorized search
- **updates-sender**: Sends notifications to subscribed users
- **finalizer**: Completes the processing pipeline and sends final notifications

### Data Stores

- **PostgreSQL**: Primary database for storing all application data
- **Redis**: Used for message queuing between services
- **R2R**: Retrieval augmented generation system for semantic search

### AI Integration

The application integrates with multiple AI providers:

- **OpenAI**: For content summarization and understanding
- **Google Vertex AI (Gemini)**: Alternative AI provider for content processing
- **Grok**: Additional AI capabilities for X.com posts analysis
- **R2R**: For RAG (Retrieval Augmented Generation) search capabilities

## Features

- **Link Processing**: Extract and summarize content from various source types (websites, YouTube, Twitter, etc.)
- **Search**: Search for content using natural language queries via R2R
- **Notifications**: Receive summaries of shared links
- **Scheduling**: Schedule regular updates for channels you're interested in
- **Subscription Management**: Subscribe to and unsubscribe from updates
- **Pagination**: Navigate through large result sets

## Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- API keys for:
  - Telegram Bot
  - OpenAI
  - Google Vertex AI
  - Grok
  - Firecrawl

### Configuration Files

#### timezones.json

This file contains a mapping of city names to their UTC time offsets. It is used by the `TimeParserService` to convert user-friendly timezone references (like "New York" or "Tokyo") into numeric UTC offsets. This enables users to schedule updates using familiar city names rather than remembering UTC time offsets.

Example:

```json
{
  "london": 0,
  "new york": -5,
  "tokyo": 9
}
```

The values represent hours offset from UTC. This file is loaded at application startup and used when users schedule updates with the `/schedule` command.

#### prompts.json

This file contains structured prompt templates for different LLM interactions. Each template has a name and consists of blocks with specific types (system/user) and content that can include variable placeholders like `{{URL}}` or `{{CONTENT}}`.

The application uses these prompts for various tasks:

- Extracting content from websites, YouTube videos, and tweets
- Generating descriptions for different content types
- Formatting messages for various AI providers (OpenAI, Gemini, Grok)

Example prompt structure:

```json
{
  "describe-website-prompt": {
    "prompt": [
      {
        "type": "system",
        "content": "System instruction here..."
      },
      {
        "type": "user",
        "content": "User instruction with {{CONTENT}} placeholder"
      }
    ]
  }
}
```

### Setup

1. Clone the repository
2. Create a `.env` file based on `default.env` and add your API keys:

   ```
   TELEGRAM_BOT_API_TOKEN=your_telegram_bot_token
   TELEGRAM_BOT_WEBHOOK_DOMAIN=your_webhook_domain
   TELEGRAM_BOT_WEBHOOK_PATH=/webhook
   TELEGRAM_BOT_USERNAME=your_bot_username
   FIRECRAWL_API_KEY=your_firecrawl_key
   OPENAI_API_KEY=your_openai_key
   GOOGLE_PROJECT_ID=your_google_project_id
   GOOGLE_LOCATION=your_google_location
   GOOGLE_CREDENTIALS=your_base64_encoded_credentials
   GROK_API_KEY=your_grok_key
   ```

3. Setup R2R service (required for search functionality):

   - Follow the instructions at [R2R Documentation](https://r2r-docs.sciphi.ai/self-hosting/installation/full)
   - Update the R2R configuration in your `.env` file:

   ```
   R2R_BASE_URL=http://r2r:7272
   R2R_EMAIL=admin@example.com
   R2R_PASSWORD=your_secure_password
   ```

4. Launch the application using Docker Compose:
   ```bash
   docker compose build && docker compose up -d
   ```

### Development

For development:

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run specific services in development mode:

   ```bash
   pnpm app -m telegram-listener
   ```

3. Run specific job:
   ```bash
   pnpm app -m schedule-updates -t job
   ```

## Database Migrations

- To add a new migration:

  ```bash
  pnpm migration:generate src/migrations/MigrationName
  ```

- To run migrations:

  ```bash
  pnpm migration:run
  ```

## Usage

### Telegram Bot Configuration

Before using the bot in groups, you must configure it properly:

1. Contact [@BotFather](https://t.me/BotFather) on Telegram
2. Select your bot and go to "Bot Settings"
3. Select "Group Privacy"
4. Choose "Disable" - this is **required** for the bot to see and process messages in groups

Without disabling Group Privacy, the bot will only be able to see commands explicitly directed to it, not regular messages containing links.

### Using the Bot

Once the bot is properly configured and running, add it to your Telegram chats or groups. You can:

- Share links in the chat for automatic processing
- Use commands like `/search`, `/help`, `/subscribe`, `/unsubscribe`
- Schedule updates with `/schedule`
- View statistics with `/stats`
- Get summaries with `/summary`

## Monitoring

The application exposes health endpoints for each service and can be monitored with Prometheus and visualized with Grafana using data from metrics endpoint.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
