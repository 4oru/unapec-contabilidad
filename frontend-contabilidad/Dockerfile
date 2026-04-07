# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./

# Instalar todas las dependencias necesarias para compilar (incluyendo TypeScript)
RUN npm install

COPY . .
RUN npm run build 

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Seguridad: No correr como root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
