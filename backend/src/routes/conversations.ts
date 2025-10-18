import { Router } from "express";
import { auth } from "../middleware/auth";
import conversationController from "../controllers/conversationController";

const router = Router();

router.use(auth);

router.get('/check', conversationController.checkLimit.bind(conversationController));
router.post('/start', conversationController.start.bind(conversationController));
router.post('/:id/end', conversationController.end.bind(conversationController));
router.get('/:id/messages', conversationController.getMessages.bind(conversationController));
router.get('/', conversationController.getAll.bind(conversationController));

export default router;