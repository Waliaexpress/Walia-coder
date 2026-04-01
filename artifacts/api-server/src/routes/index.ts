import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import adminRouter from "./admin.js";
import projectsRouter from "./projects.js";
import subscriptionsRouter from "./subscriptions.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(adminRouter);
router.use(projectsRouter);
router.use(subscriptionsRouter);

export default router;
