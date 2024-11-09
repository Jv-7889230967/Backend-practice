import otpGenerator from 'otp-generator';


export class generateOTP {

    generateOTP = () => {
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false });
        return otp
    }
}