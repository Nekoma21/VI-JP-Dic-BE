import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createWorker } from "tesseract.js";
import pdfPoppler from "pdf-poppler";
import dotenv from "dotenv";
import BadRequestError from "../errors/BadRequestError.js";
import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const convertPdfToImages = async (pdfPath) => {
  const outputDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, ".pdf");

  const options = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: baseName,
    page: null,
    scale: 1024,
  };

  await pdfPoppler.convert(pdfPath, options);
  const files = await fs.readdir(outputDir);
  return files
    .filter((f) => f.startsWith(baseName) && f.endsWith(".jpg"))
    .map((f) => path.join(outputDir, f));
};

const ocrImage = async (imagePath) => {
  const worker = await createWorker("jpn+vie");
  const { data } = await worker.recognize(imagePath);
  await worker.terminate();
  return data.text;
};

const detectText = async (fileBuffer, originalName) => {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, uuidv4() + "-" + originalName);
  await fs.writeFile(filePath, fileBuffer);

  try {
    let imagePaths = [];
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
      imagePaths = await convertPdfToImages(filePath);
    } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      imagePaths = [filePath];
    } else {
      throw new BadRequestError("Không hỗ trợ định dạng tệp này!");
    }

    let fullText = "";
    for (const img of imagePaths) {
      const text = await ocrImage(img);
      fullText += text + "\n";
    }

    return {
      status: StatusCodes.OK,
      data: {
        text: fullText.replace(/\n+/g, " ").trim(),
      },
      message: "OCR thành công",
    };
  } catch (err) {
    throw err;
  }
};

const translate = async (text) => {
  if (!text) {
    throw new BadRequestError("Nội dung không hợp lệ!");
  }

  const prompt = `
  Bạn là một phiên dịch viên chuyên nghiệp, thông thạo tiếng Nhật và tiếng Việt. Văn bản dưới đây được lấy từ ảnh hoặc file PDF, có thể bị lỗi OCR như từ bị ngắt cách, ký tự lạ hoặc xuống dòng không hợp lý.
Hãy:
- Dịch phần nội dung chính xác, đúng ngữ cảnh
- Giữ phong cách văn viết tương ứng, rõ ràng và tự nhiên
- Không giải thích gì cả, chỉ trả về bản dịch
- Dịch nội dung từ tiếng Nhật sang tiếng Việt nếu văn bản là tiếng Nhật.
- Dịch nội dung từ tiếng Việt sang tiếng Nhật nếu văn bản là tiếng Việt.
- Bản dịch chỉ hiển thị nội dung chính, không hiển thị các kí tự, các từ không liên quan đến nội dung.

Văn bản cần dịch:
  """
  ${text}
  """`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const translated = completion.choices[0].message.content ?? "";
  return {
    status: StatusCodes.OK,
    data: {
      text: translated,
    },
    message: "Translate text thành công",
  };
};

export const translateService = {
  detectText,
  translate,
};
