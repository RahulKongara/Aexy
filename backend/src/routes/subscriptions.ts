import { Router } from "express";
import { auth } from "../middleware/auth";
import subscriptionController from "../controllers/subscriptionController";

const router = Router();

router.use(auth);

router.get('/me', subscriptionController.getMySubscription.bind(subscriptionController));
router.post('/upgrade', subscriptionController.upgrade.bind(subscriptionController));

export default router;