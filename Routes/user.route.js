import { Router } from "express";
import { registerUser } from "../Controllers/authControllers.js";


const router=Router();

router.route('/register').post(registerUser);

export default router;