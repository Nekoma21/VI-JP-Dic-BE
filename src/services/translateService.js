import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createWorker } from "tesseract.js";
import pdf2pic from "pdf2pic";
import dotenv from "dotenv";
import BadRequestError from "../errors/BadRequestError.js";
import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const convertPdfToImages = async (pdfPath) => {
  const outputDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, ".pdf");

  // Cấu hình pdf2pic
  const convert = pdf2pic.fromPath(pdfPath, {
    density: 200, // DPI (tương đương scale: 1024 của pdf-poppler)
    saveFilename: baseName, // Prefix cho tên file
    savePath: outputDir, // Thư mục output
    format: "jpg", // Format ảnh
    width: 1024, // Chiều rộng tối đa
    height: 1448, // Chiều cao tối đa (tỷ lệ A4)
    quality: 100, // Chất lượng ảnh
  });

  try {
    // Convert tất cả pages (-1 = all pages)
    const results = await convert.bulk(-1, {
      responseType: "image",
    });

    // Trả về danh sách đường dẫn file ảnh
    return results.map((result) => result.path);
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw new BadRequestError("Failed to convert PDF to images");
  }
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
- Nếu không có nội dung văn bản mà chỉ có các kí tự, dấu câu,.. thì hãy trả về đúng các kí tự và dấu câu đó (Lưu ý nếu có phần chữ giữa các kí tự dấu thì vẫn sẽ dịch phần chữ đó).
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
