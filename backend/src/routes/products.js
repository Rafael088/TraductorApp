import { Router } from "express";
import { cProduct, gProducts, gProduct, dProduct } from "../controller/products.js";
import { validateJWT } from "../config/middleware.js";

const router = Router();

router.post("/create-product", validateJWT, cProduct);
router.get("/get-products", validateJWT, gProducts);
router.get("/get-product/:id", validateJWT, gProduct);
router.delete("/delete-product/:id", validateJWT, dProduct);

export default router;
