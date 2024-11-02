import { userRoleEnum } from "../constants.js";
import { User } from "../models/userModels.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



class UserController {
    // Constructor to initialize User model (if necessary)
    constructor(UserModel) {
        this.UserModel = UserModel;
    }

    // Method to generate access and refresh tokens
    async generateAccessRefreshToken(userId) {
        try {
            const user = await this.UserModel.findById(userId);
            const access_token = user.generateAccess_token();
            const refresh_token = user.generateRefresh_token();
            user.refreshtoken = refresh_token;
            await user.save({ validateBeforeSave: false });
            return { access_token, refresh_token };
        } catch (error) {
            throw new ApiError(error, 500);
        }
    }

    // Method for user registration
    registerUser = asyncHandler(async (req, res, next) => {
        const { email, username, password, role } = req.body;
        if (!email || !username || !password) {
            throw new ApiError("Please enter all required fields", 400);
        }
        const userExists = await this.UserModel.findOne({
            $or: [{ username }, { email }],
        }).select("_id");

        if (userExists) {
            throw new ApiError("User already Exists", 409);
        }

        const user = await this.UserModel.create({
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

    // Method for user login
    loginUser = asyncHandler(async (req, res, next) => {
        const { email, username, password } = req.body;

        if (!username || !password) {
            throw new ApiError("Please enter all required fields", 400);
        }

        const user = await this.UserModel.findOne({
            $or: [{ username }, { email }]
        }).select("_id email username +password");
        if (!user) {
            throw new ApiError("User account doesn't exist, please register as a new user", 404);
        }
        
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError("Your credentials are incorrect", 401);
        }
        
        const { access_token, refresh_token } = await this.generateAccessRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };
        return res
            .status(200)
            .cookie("access_token", access_token, options)
            .cookie("refresh_token", refresh_token, options)
            .json({
                message: "User logged in successfully",
                access_token: access_token,
                user: user
            });
    });
}

// Export an instance of UserController
export const userController = new UserController(User);