import Word from "../models/word.js";
import Kanji from "../models/kanji.js";
import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";

const getAllWords = async (data) => {
  const page = parseInt(data.query.page);
  const limit = parseInt(data.query.limit);

  try {
    if (!page || !limit) {
      const results = await Word.find();
      return {
        totalPages: 1,
        currentPage: 1,
        data: results,
      };
    }

    const total = await Word.countDocuments();
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) {
      page = totalPages;
    }

    const results = await Word.find()
      .skip((page - 1) * limit)
      .limit(limit);

    if (results.length > 0) {
      return {
        totalPages,
        currentPage: page,
        data: results,
      };
    } else {
      throw new NotFoundError("Không tìm thấy từ vựng!");
    }
  } catch (error) {
    throw error;
  }
};

const getWordById = async (data) => {
  try {
    const { id } = data.params;

    if (!id || id.trim() === "") {
      throw new BadRequestError("ID không hợp lệ!");
    }

    const result = await Word.findById(id).lean();
    const kanjiArray =
      Array.isArray(result.kanji) && result.kanji.length > 0
        ? result.kanji
        : Array.isArray(result.kanjis)
        ? result.kanjis
        : [];

    if (kanjiArray.length === 0) {
      result.kanjis = [];
      return result;
    }

    const kanjiData = await Kanji.find({ text: { $in: kanjiArray } });

    result.kanji = kanjiData;
    return result;
  } catch (error) {
    throw error;
  }
};

const searchWord = async (data) => {
  const { text } = data.query;
  try {
    if (!text || text.trim() === "") {
      return [];
    }

    const prefixCondition = {
      $or: [
        { text: { $regex: `^${text}`, $options: "i" } },
        { hiragana: { $regex: `^${text}`, $options: "i" } },
        { romanji: { $regex: `^${text}`, $options: "i" } },
        { "meaning.content": { $regex: `^${text}`, $options: "i" } },
      ],
    };

    let results = await Word.find(prefixCondition).limit(10);

    if (results.length < 10) {
      const suffixCondition = {
        $or: [
          { text: { $regex: `${text}`, $options: "i" } }, // Tìm hậu tố trong trường 'text'
          { hiragana: { $regex: `${text}`, $options: "i" } }, // Tìm hậu tố trong trường 'hiragana'
          { romanji: { $regex: `${text}`, $options: "i" } }, // Tìm hậu tố trong 'romanji'
          { "meaning.content": { $regex: `${text}`, $options: "i" } }, // Tìm hậu tố trong 'meaning.content'
        ],
      };

      const suffixResults = await Word.find(suffixCondition).limit(
        10 - results.length
      ); // Giới hạn theo số lượng còn lại

      results = [...results, ...suffixResults];
    }

    const uniqueResults = {};
    results.forEach((kanji) => {
      uniqueResults[kanji._id] = kanji;
    });

    const formattedResults = Object.values(uniqueResults).map((word) => ({
      _id: word._id,
      text: word.text,
      hiragana: word.hiragana[0],
      meaning: word.meaning[0].content,
    }));

    // 3. Sort với custom comparator
    formattedResults.sort((a, b) => {
      const t = text; // "解"

      // 1) Exact match ưu tiên nhất
      if (a.text === t && b.text !== t) return -1;
      if (b.text === t && a.text !== t) return 1;

      // 2) Prefix match vs non-prefix
      const ia = a.text.indexOf(t);
      const ib = b.text.indexOf(t);
      if (ia !== ib) return ia - ib;

      // 3) Tại đây, cả a và b đều prefix (indexOf === 0)
      //    So sánh độ dài đọc âm (hiragana) tăng dần
      const ha = a.hiragana.length;
      const hb = b.hiragana.length;
      if (ha !== hb) return ha - hb;

      // 4) Cuối cùng fallback theo Unicode Kanji
      return a.text.localeCompare(b.text);
    });

    return formattedResults;
  } catch (error) {
    throw error;
  }
};

export const wordService = {
  getAllWords,
  getWordById,
  searchWord,
};
