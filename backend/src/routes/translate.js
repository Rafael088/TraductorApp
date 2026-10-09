import { Router } from "express";
import multer from "multer";
import { identifyDevice } from "../config/middleware.js";
import { cTranslate } from "../controller/translate.js";

const router = Router();

// Los fragmentos de voz (pausa >= 0,8 s o 8 s máx.) viven solo en memoria:
// no hace falta escribirlos en disco.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});

// multer no responde en JSON: traducimos sus errores al formato de la API.
const uploadAudio = (req, res, next) => {
    upload.single("audio")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                msg: "El audio supera el límite de 10 MB",
                ok: false
            });
        }

        return res.status(400).json({
            msg: "No se pudo leer el archivo de audio",
            ok: false
        });
    });
};

// POST /translate — audio (multipart, campo "audio") + conversationId.
router.post("/translate", identifyDevice, uploadAudio, cTranslate);

export default router;
