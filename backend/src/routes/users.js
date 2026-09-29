import { Router } from "express";
import { cUser, gUser, login, dUser, changePassword } from "../controller/users.js";
import { validateJWT } from "../config/middleware.js";


const router = Router();

router.post("/create-users", cUser);
router.get("/get-users",validateJWT, gUser);
router.delete("/delete-user/:id",validateJWT, dUser);
router.post("/login", login);
router.put("/change-password",validateJWT, changePassword);

export default router;
