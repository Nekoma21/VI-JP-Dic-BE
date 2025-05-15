import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    word: { type: String, default: "" },
    sentence: { type: String, default: "" },
    reading: { type: String, default: "" },
    meaning: { type: String, default: "" },
    due: { type: Date, default: () => new Date() },
    stability: { type: Number, default: 0 },
    difficulty: { type: Number, default: 0 },
    elapsed_days: { type: Number, default: 0 },
    scheduled_days: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    lapses: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    last_review: { type: Date, default: null },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deck",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

CardSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.createdBy;
    return ret;
  },
});

const Card = mongoose.model("card", CardSchema);

export default Card;
