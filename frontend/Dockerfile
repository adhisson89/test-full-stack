# Etapa 1
FROM node:22-alpine3.21 as build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npm run build

# Etapa 2
FROM nginx:alpine3.21
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
