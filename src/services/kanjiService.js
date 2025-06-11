import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/kanji.js";
import kanji from "kanji";
import toRomaji from "../utils/toRomaji.js";
import Composition from "../models/composition.js";

const getAllKanjis = async (data) => {
  const page = parseInt(data.query.page);
  const limit = parseInt(data.query.limit);

  try {
    if (!page || !limit) {
      const results = await Kanji.find().populate("composition");
      return {
        totalPages: 1,
        currentPage: 1,
        data: results,
      };
    }

    const total = await Kanji.countDocuments();
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) {
      page = totalPages;
    }

    const results = await Kanji.find()
      .populate("composition")
      .skip((page - 1) * limit)
      .limit(limit);

    if (results.length > 0) {
      return {
        totalPages,
        currentPage: page,
        data: results,
      };
    } else {
      throw new NotFoundError("Không tìm thấy Kanji!");
    }
  } catch (error) {
    throw error;
  }
};
const addNewKanji = async (req) => {
  try {
    const { text, phonetic, onyomi, kunyomi, strokes, jlpt_level, meaning } =
      req.body;

    if (!text || !phonetic || !onyomi || !kunyomi || !strokes) {
      throw new BadRequestError("Thiếu thông tin cần thiết để thêm Kanji mới!");
    }

    const existingKanji = await Kanji.findOne({ text });
    if (existingKanji) {
      throw new BadRequestError("Kanji đã tồn tại!");
    }

    // Chuyển đổi onyomi và kunyomi sang romaji
    const romanjiOnyomi = onyomi.map((onyomiReading) =>
      toRomaji(onyomiReading)
    );
    const romanjiKunyomi = kunyomi.map((kunyomiReading) =>
      toRomaji(kunyomiReading)
    );
    const romanji = [...romanjiOnyomi, ...romanjiKunyomi];

    // Lấy cây thành phần Kanji
    const kanjiTree = kanji.kanjiTree(text);

    // Trích xuất danh sách bộ thủ
    const extractElements = (node) => {
      let elements = [node.element];
      if (node.g) {
        node.g.forEach((child) => {
          elements = elements.concat(extractElements(child));
        });
      }
      return elements;
    };
    const radicals = extractElements(kanjiTree);

    // Tìm composition IDs
    const composition = [];
    for (const rawText of radicals) {
      const comp = await Composition.findOne({ raw_text: rawText });
      if (comp) {
        composition.push(comp._id);
      }
    }

    // Tạo Kanji mới
    const newKanji = new Kanji({
      text,
      phonetic,
      onyomi,
      kunyomi,
      strokes,
      jlpt_level,
      meaning,
      romanji,
      composition,
    });

    const savedKanji = await newKanji.save();
    return savedKanji.populate("composition");
  } catch (error) {
    throw error;
  }
};

const updateKanji = async (req) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const { text, phonetic, onyomi, kunyomi, strokes, jlpt_level, meaning } =
      req.body;

    // Kiểm tra ID
    if (!id) {
      throw new BadRequestError("Thiếu ID kanji cần cập nhật.");
    }

    // Tìm kanji cần cập nhật
    const existingKanji = await Kanji.findById(id);
    if (!existingKanji) {
      throw new NotFoundError("Không tìm thấy kanji cần cập nhật.");
    }

    // Cập nhật các trường cơ bản
    existingKanji.text = text || existingKanji.text;
    existingKanji.phonetic = phonetic || existingKanji.phonetic;
    existingKanji.strokes = strokes || existingKanji.strokes;
    existingKanji.jlpt_level = jlpt_level || existingKanji.jlpt_level;
    existingKanji.meaning = meaning || existingKanji.meaning;

    // Cập nhật onyomi và kunyomi nếu có
    if (onyomi) {
      existingKanji.onyomi = onyomi;
    }
    if (kunyomi) {
      existingKanji.kunyomi = kunyomi;
    }

    // Cập nhật romanji từ onyomi và kunyomi
    const romanjiOnyomi = existingKanji.onyomi.map((onyomiReading) =>
      toRomaji(onyomiReading)
    );
    const romanjiKunyomi = existingKanji.kunyomi.map((kunyomiReading) =>
      toRomaji(kunyomiReading)
    );
    existingKanji.romanji = [...romanjiOnyomi, ...romanjiKunyomi];

    // Nếu text thay đổi, cập nhật lại cây Kanji và danh sách composition
    if (text) {
      const kanjiTree = kanji.kanjiTree(text);

      // Trích xuất danh sách bộ thủ
      const extractElements = (node) => {
        let elements = [node.element];
        if (node.g) {
          node.g.forEach((child) => {
            elements = elements.concat(extractElements(child));
          });
        }
        return elements;
      };
      const radicals = extractElements(kanjiTree);

      // Tìm composition IDs từ radicals
      const composition = [];
      for (const rawText of radicals) {
        const comp = await Composition.findOne({ raw_text: rawText });
        if (comp) {
          composition.push(comp._id);
        }
      }

      // Cập nhật composition và radicals
      existingKanji.composition = composition;
    }

    // Lưu lại thay đổi
    const updatedKanji = await existingKanji.save();
    return updatedKanji.populate("composition");
  } catch (error) {
    throw error;
  }
};

const deleteKanji = async (req) => {
  try {
    const { id } = req.params; // Lấy ID từ URL

    // Kiểm tra ID
    if (!id) {
      throw new BadRequestError("Thiếu ID kanji cần xóa.");
    }

    // Tìm kanji cần xóa
    const existingKanji = await Kanji.findById(id);
    if (!existingKanji) {
      throw new NotFoundError("Không tìm thấy kanji cần xóa.");
    }

    // Xóa kanji khỏi cơ sở dữ liệu
    await Kanji.findByIdAndDelete(id);

    return { message: "Kanji đã được xóa thành công." };
  } catch (error) {
    throw error;
  }
};

export const kanjiService = {
  getAllKanjis,
  addNewKanji,
  updateKanji,
  deleteKanji,
};
