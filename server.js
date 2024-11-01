import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/index.js";
dotenv.config({
  path: "./.env",
});

const app=express();

connectDB();  //calling the DB connect function here

app.listen(process.env.PORT,()=>{
  console.log(`server running at ${process.env.PORT}`);
})
