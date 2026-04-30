import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamsRouter from "./teams";
import alertsRouter from "./alerts";
import preferencesRouter from "./preferences";

const router: IRouter = Router();

router.use(healthRouter);
router.use(teamsRouter);
router.use(alertsRouter);
router.use(preferencesRouter);

export default router;
