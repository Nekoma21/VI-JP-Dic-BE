import Joi from "joi";
import ValidationError from "../errors/ValidationError.js";

const auth = async (req, res, next) => {
  const user = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(7).trim().strict(),
  });

  try {
    const value = await user.validateAsync(req.body, { abortEarly: false });
    console.log("Validated Data:", value);
    next();
  } catch (error) {
    next(new ValidationError(error.message));
  }
};

export const authValidation = {
  auth,
};
