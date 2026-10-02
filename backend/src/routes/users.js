import { Router } from "express";
import { cUser, gUser, dUser } from "../controller/users.js";
import { validateJWT } from "../config/middleware.js";


const router = Router();

router.post("/create-users", cUser);
router.get("/get-users", gUser);
router.delete("/delete-user/:id",validateJWT, dUser);

export default router;
