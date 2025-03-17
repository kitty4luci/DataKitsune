FROM node:18.20-alpine AS base

#==============================================================================
FROM base AS development

ARG WORKDIR_PATH=/app
WORKDIR ${WORKDIR_PATH}

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

RUN npm install

#==============================================================================
FROM base AS build

ARG WORKDIR_PATH=/app
WORKDIR ${WORKDIR_PATH}

COPY --from=development ${WORKDIR_PATH}/package.json ./
COPY --from=development ${WORKDIR_PATH}/tsconfig.json ./
COPY --from=development ${WORKDIR_PATH}/node_modules ./node_modules
COPY --chown=node:node /src ./src

RUN npm run build

#==============================================================================
FROM base AS migrations

ARG WORKDIR_PATH=/app
WORKDIR ${WORKDIR_PATH}

COPY --from=build ${WORKDIR_PATH}/dist ./dist
COPY --from=build ${WORKDIR_PATH}/package.json ./
COPY --from=build ${WORKDIR_PATH}/node_modules ./node_modules
COPY --from=build ${WORKDIR_PATH}/tsconfig.json ./
COPY --chown=node:node /src ./src

USER node
CMD [ "npm", "run", "migration:run"]

#==============================================================================
FROM node:18.20-alpine AS production

ARG WORKDIR_PATH=/app
WORKDIR ${WORKDIR_PATH}

COPY --chown=node:node --from=build ${WORKDIR_PATH}/dist ./dist
COPY --chown=node:node --from=build ${WORKDIR_PATH}/node_modules ./node_modules
COPY --chown=node:node docker-entrypoint.sh ./
COPY --chown=node:node prompts.json ./
COPY --chown=node:node timezones.json ./

RUN chown -R node ${WORKDIR_PATH}/ 
RUN chmod +x docker-entrypoint.sh

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]