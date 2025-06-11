FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    poppler-utils ghostscript graphicsmagick \
    tesseract-ocr \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production || npm install --production

COPY . .

RUN chmod 644 /app/*.traineddata

# Set TESSDATA_PREFIX to /app
ENV TESSDATA_PREFIX=/app

EXPOSE 8080
CMD ["node", "src/index.js"]
