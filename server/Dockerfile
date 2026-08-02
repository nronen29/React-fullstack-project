FROM node:20-alpine

WORKDIR /app

# Install dependencies (including Prisma CLI, needed for migrate at runtime).
COPY package*.json ./
RUN npm ci

# Generate the Prisma client against the schema.
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Normalize line endings (in case of CRLF from Windows) and make executable.
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
