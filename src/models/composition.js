import mongoose from "mongoose";

const CompositionSchema = new mongoose.Schema(
  {
    raw_text: String,
    phonetic: String,
  },
  {
    collection: "compositions",
  }
);

const Composition = mongoose.model("compositions", CompositionSchema);

export default Composition;
