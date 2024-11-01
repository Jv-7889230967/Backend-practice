import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/index.js";
dotenv.config({
  path: "./.env",
});
import userRouter from "./Routes/user.route.js"
const app=express();

connectDB();  //calling the DB connect function here
app.use(express.json());
app.use("/api/v1/users",userRouter);
app.listen(process.env.PORT,()=>{
  console.log(`server running at ${process.env.PORT}`);
})
