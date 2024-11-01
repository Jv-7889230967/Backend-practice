import mongoose, { Schema } from "mongoose";
import { userRoleEnum } from "../constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = new Schema({   //schema format for userDetails
    useravatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: 'https://via.placeholder.com/200x200.png',
            localPath: ''
        }
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "password is mandatory"]
    },
    role: {
        type: String,
        enum: Object.values(userRoleEnum),
        default: userRoleEnum.USER,
        required: true
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {  // method to check before saving the password that if password is changes then hash it
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {  //password comparator
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccess_token = function () {   //method to generate the access token using jwt
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,    
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
        expiresIn:'1d'
    })
}

userSchema.methods.generateRefresh_token = function () {   //method to generate refresh token using jwt
    return jwt.sign({
        _id: this._id    
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
        expiresIn:'1d'
    })
}
export const User = mongoose.model("User", userSchema);
