import { Router, type IRouter } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router: IRouter = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

export default router;
