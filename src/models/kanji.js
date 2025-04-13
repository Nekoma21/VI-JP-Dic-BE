import mongoose from "mongoose";

const KanjiSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    phonetic: [{ type: String }],
    onyomi: [{ type: String }],
    kunyomi: [{ type: String }],
    strokes: { type: Number },
    jlpt_level: { type: Number },
    composition: [
      { type: mongoose.Schema.Types.ObjectId, ref: "compositions" },
    ],
    meaning: { type: String },
    romanji: [{ type: String }],
  },
  {
    collection: "kanjis",
  }
);

const Kanji = mongoose.model("kanjis", KanjiSchema);

export default Kanji;
