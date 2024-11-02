import { userRoleEnum } from "../constants.js";
import { User } from "../models/userModels.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const generateAccessRefresh_token = async (userId) => {
    try {
        const user = await User.findById({ userId });
        const access_token = user.generateAccess_token();
        // const refresh_token=user.generateRefresh_token();
        return { access_token };
    } catch (error) {
        return error;
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;
    const userExists = await User.findOne({
        $or: [{ username }, { email }],
    }).select("_id");

    if (userExists) {
        throw new ApiError("User already Exists", 409);
    }

    const user = await User.create({
        email,
        username,
        password,
        role: role || userRoleEnum.USER,
    });

    return res.status(200).json({
        message: "User registered successfully. A verification email has been sent to your email.",
        user: user.email + "," + user.username,
    });
});


export { registerUser };