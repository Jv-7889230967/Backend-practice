import { userRoleEnum } from "../constants.js";
import { User } from "../models/userModels.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { otpStore } from "../utils/TemporaryStorage.js";
import { sendMessage } from "./sendMessage.cjs";


class UserController extends sendMessage {
    constructor(UserModel) {
        super(); //calling the sendMessage class constructor
        this.UserModel = UserModel;
    }
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
        const { email, username, phonenumber, password, role } = req.body;
        if (!email || !username || !password || !phonenumber) {
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
            phonenumber,
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
            });
    });

    loginWithOtp = asyncHandler(async (req, res, next) => {
        const { phonenumber, otp } = req.body;
        if (!phonenumber) {
            throw new ApiError("Phone number is required", 400);
        }

        // If both phonenumber and OTP are provided, verify OTP
        if (phonenumber && otp) {
            const storedOtpData = otpStore.get(phonenumber); // Use phonenumber as key

            // Check if OTP exists and matches, also check expiration
            if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expiresAt < Date.now()) {
                throw new ApiError("Entered OTP is incorrect or has expired", 401);
            }

            // OTP is correct, proceed with login
            const user = await this.UserModel.findOne({ phonenumber }).select("_id");
            if (!user) {
                throw new ApiError("User not found", 404);
            }

            const { access_token, refresh_token } = await this.generateAccessRefreshToken(user._id);

            const options = {
                httpOnly: true,
                secure: true,
            };
            return res
                .status(200)
                .cookie("access_token", access_token, options)
                .cookie("refresh_token", refresh_token, options)
                .json({
                    message: "User logged in successfully",
                    access_token: access_token,
                });
        }
        const messageService = new sendMessage(phonenumber);
         await messageService.send();
        // console.log("wekdmewklmkmwefw");
        return res.status(200).json({ message: "Your OTP has been sent to the phone number" });
    });

    logoutUser = asyncHandler(async (req, res, next) => {
        await this.UserModel.findByIdAndUpdate(req.user._id, {
            $set: { refreshtoken: "" }
        },
            { new: true }
        )
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .clearCookie("access_token", options)
            .clearCookie("refresh_token", options)
            .json({ message: "User logged out successfully" });
    }
    )
}

// Export an instance of UserController
export const userController = new UserController(User);