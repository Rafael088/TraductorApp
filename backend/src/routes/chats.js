import { Router } from "express";
import { cChat, gChats, gChat, dChat } from "../controller/chats.js";
import { validateJWT } from "../config/middleware.js";

const router = Router();

router.post("/create-chat", validateJWT, cChat);
router.get("/get-chats", validateJWT, gChats);
router.get("/get-chat/:id", validateJWT, gChat);
router.delete("/delete-chat/:id", validateJWT, dChat);

export default router;
