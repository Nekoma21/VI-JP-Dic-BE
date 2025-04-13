import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema({
  text: { type: String },
  hiragana: { type: String },
  meaning: { type: String },
});

const meaningSchema = new mongoose.Schema({
  type: { type: String },
  content: { type: String },
});

const WordSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    hiragana: { type: [String] },
    meaning: { type: [meaningSchema], required: true },
    examples: { type: [exampleSchema] },
    kanji: { type: [Object] },
    romanji: { type: [String] },
  },
  {
    collection: "words",
  }
);

const Word = mongoose.model("words", WordSchema);

export default Word;
