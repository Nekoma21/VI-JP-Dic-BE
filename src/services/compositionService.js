import Composition from "../models/composition.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";

const getCompositionByID = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError("Thiếu ID của bộ cần lấy!");
    }

    const composition = await Composition.findById(id);
    if (!composition) {
      throw new NotFoundError("Không tìm thấy bộ với ID đã cho!");
    }

    return composition;
  } catch (error) {
    throw error;
  }
};

export const compositionService = {
  getCompositionByID,
};
