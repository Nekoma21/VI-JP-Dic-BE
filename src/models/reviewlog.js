import mongoose from "mongoose";

const ReviewLogSchema = new mongoose.Schema(
  {
    difficulty: { type: Number, required: true },
    due: { type: Date, required: true },
    elapsed_days: { type: Number, required: true },
    last_elapsed_days: { type: Number, required: true },
    rating: { type: Number, required: true },
    review: { type: Date, required: true },
    scheduled_days: { type: Number, required: true },
    stability: { type: Number, required: true },
    state: { type: Number, required: true },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deck",
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
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

ReviewLogSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.createdBy;
    return ret;
  },
});

const ReviewLog = mongoose.model("reviewlog", ReviewLogSchema);

export default ReviewLog;
