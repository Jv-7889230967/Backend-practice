import { userRoleEnum } from "../constants.js";
import { User } from "../models/userModels.js"



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

const registerUser = async (req, res) => {
    const { email, username, password, role } = req.body;  //getting the user from request body
    const userExists = await User.findOne({
        $or: [{ username }, { email }],
    }).select("_id");
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
        email,
        username,
        password,
        role: role || userRoleEnum.USER
    })

    return res.status(200).json({
        message: "User registered successfully. A verification email has been sent to your email.",
        user: user,
    });
};

export { registerUser };