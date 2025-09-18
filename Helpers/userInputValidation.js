import Joi from "joi";
import { ApiError } from "../Helpers/ApiError.js";

const userSchema = Joi.object({
    user: {
        username: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    }
});


const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body)
  if (error) {
    return next(new ApiError(error.details[0].message, 400))
  }
  next()
}

export { validateUser };
