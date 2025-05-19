FROM node:16-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production # Chỉ cài dependencies cần thiết cho production
COPY . .
RUN npm run build -- --prod # Build với profile production


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN echo "gzip on; gzip_types text/plain application/json application/javascript text/css;" > /etc/nginx/conf.d/gzip.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]