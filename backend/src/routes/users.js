import { Router } from "express";
import { cUser, gUser, dUser, meUser } from "../controller/users.js";
import { validateJWT, identifyDevice } from "../config/middleware.js";


const router = Router();

router.post("/create-users", cUser);
router.get("/me", identifyDevice, meUser);
router.get("/get-users", gUser);
router.delete("/delete-user/:id",validateJWT, dUser);

export default router;
