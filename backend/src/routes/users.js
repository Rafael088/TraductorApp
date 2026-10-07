import { Router } from "express";
import { cUser, gUser, dUser, meUser, updateMe } from "../controller/users.js";
import { validateJWT, identifyDevice } from "../config/middleware.js";


const router = Router();

router.post("/users", cUser);
router.get("/me", identifyDevice, meUser);
router.put("/me", identifyDevice, updateMe);
router.get("/get-users", gUser);
router.delete("/delete-user/:id",validateJWT, dUser);

export default router;
