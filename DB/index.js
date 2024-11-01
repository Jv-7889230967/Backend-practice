import mongoose from "mongoose";
import {DB_NAME} from '../constants.js';

const connectDB=async()=>{
    try {
       await mongoose.connect(`${process.env.MONGO_CONNECTION_URI}/${DB_NAME}`);  // using mongoose ORM to connect to mongodb using our private mongodb URI
       console.log('MongoDB Connected...');
    } catch (error) {
        console.log("DB error occurred", +error);   
        process.exit(1);
    }
}
export default connectDB;