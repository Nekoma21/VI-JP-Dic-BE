import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cardQuantity: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

DeckSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.createdBy;
    return ret;
  },
});

const Deck = mongoose.model("deck", DeckSchema);

export default Deck;
