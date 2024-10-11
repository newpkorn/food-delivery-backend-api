FROM node:18-alpine

RUN mkdir -p /app

RUN chown -R node:node /app

COPY . /app

WORKDIR /app

RUN npm ci

# สร้างโฟลเดอร์ uploads
# RUN mkdir -p /var/www/myapp/uploads

# เปลี่ยนเจ้าของโฟลเดอร์ uploads เป็น node
# RUN chown -R node:node /var/www/myapp/uploads

EXPOSE 5180

CMD ["node", "server.js"]
