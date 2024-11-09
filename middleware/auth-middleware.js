import { User } from "../models/userModels.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError("user Unauthrozed", 401)
    }
    try {
        const userValue = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const user = await User.findById(userValue._id).select("-refreshtoken");
        if (!user) {
            throw new ApiError("Invalid access token", 401)
        }
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(error?.message || "Invalid access token", 401)
    }
})