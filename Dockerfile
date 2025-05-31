FROM node:20-bullseye
WORKDIR /app

# Cài đặt dependencies cho pdf2pic, tesseract và build tools cho bcrypt
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-vie \
    tesseract-ocr-jpn \
    tesseract-ocr-eng \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production || npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "src/index.js"]
