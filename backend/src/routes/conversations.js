import { Router } from "express";
import {
    cConversation,
    endConversation,
    gConversations,
    gConversation,
    dConversation
} from "../controller/conversations.js";
import { identifyDevice } from "../config/middleware.js";

const router = Router();

router.post("/conversations", identifyDevice, cConversation);
router.put("/conversations/:id/end", identifyDevice, endConversation);
router.get("/conversations", identifyDevice, gConversations);
router.get("/conversations/:id", identifyDevice, gConversation);
router.delete("/conversations/:id", identifyDevice, dConversation);

export default router;
