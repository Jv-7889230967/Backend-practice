import { generateOTP } from "./generateOTP.js";
import { ApiError } from "../utils/ApiError.js";
import { otpStore } from "../utils/TemporaryStorage.js";
var twilio=require("twilio")(process.env.TWILLIO_ACCOUNT_SID,process.env.TWILLIO_ACCOUNT_AUTH_TOKEN)

export class sendMessage extends generateOTP {
    constructor(phonenumber) {
        super();
        this.phonenumber = phonenumber;
    }

    send = async () => {

        const client = twilio(process.env.TWILLIO_ACCOUNT_SID, process.env.TWILLIO_ACCOUNT_AUTH_TOKEN);
        console.log('lkfmlwelfn')
        try {
            const generatedotp = super.generateOTP();
            const message = await client.messages.create({
                body: `Your OTP is: ${generatedotp}`, // Added context to the OTP message
                from: process.env.TWILLIO_PHONE_NUMBER,
                to: this.phonenumber
            });

            otpStore.set(this.phonenumber, { otp: generatedotp, expiresAt: Date.now() + 5 * 60 * 1000 });
            console.log("Message sent successfully:", message.sid);
            return { message, generatedotp };
        } catch (error) {
            console.error("Error sending message with Twilio:", error); // Better error logging
            throw new ApiError("Failed to send OTP", 500); // Generic error message
        }
    }
}
