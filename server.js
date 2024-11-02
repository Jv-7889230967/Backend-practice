import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/index.js";
dotenv.config({
  path: "./.env.local",
});
import userRouter from "./Routes/user.route.js"
import { errorHandler } from "./middleware/error-middleware.js";
const app = express();

connectDB();  //calling the DB connect function here
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log(`server running at ${process.env.PORT}`);
})
