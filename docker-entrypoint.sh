#!/bin/sh

# Handle migrations if RUN_MIGRATIONS is set to "true"
if [ "$RUN_MIGRATIONS" = "true" ]; then
    npm run migration:run
fi

# Get the mode from APP_MODE environment variable
MODE=${APP_MODE:-"unknown"}
TYPE=${APP_TYPE:-""}

if [ -n "$TYPE" ]; then
    exec node dist/main.js --mode "$MODE" --type "$TYPE"
else
    exec node dist/main.js --mode "$MODE"
fi