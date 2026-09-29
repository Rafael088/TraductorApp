import { Chat } from "../models/chats.js";

const isValidText = (value) => typeof value === "string" && value.trim().length > 0;

const isValidId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

export async function cChat(req, res) {
    try {
        const {
            originalText,
            translatedText,
            sourceLanguage,
            targetLanguage,
            conversationId
        } = req.body ?? {};

        if (
            !isValidText(originalText) ||
            !isValidText(translatedText) ||
            !isValidText(sourceLanguage) ||
            !isValidText(targetLanguage)
        ) {
            return res.status(400).json({
                msg: "originalText, translatedText, sourceLanguage y targetLanguage son obligatorios",
                ok: false
            });
        }

        if (conversationId !== undefined && !isValidText(conversationId)) {
            return res.status(400).json({
                msg: "conversationId debe ser un texto válido",
                ok: false
            });
        }

        const chat = await Chat.create({
            user: req.email,
            originalText: originalText.trim(),
            translatedText: translatedText.trim(),
            sourceLanguage: sourceLanguage.trim(),
            targetLanguage: targetLanguage.trim(),
            ...(conversationId ? { conversationId: conversationId.trim() } : {})
        });

        return res.status(201).json({
            msg: "Traducción guardada correctamente",
            ok: true,
            chat
        });
    } catch (error) {
        console.error("Error al guardar la traducción:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                msg: "Los datos de la traducción no son válidos",
                ok: false
            });
        }

        return res.status(500).json({
            msg: "Error al guardar la traducción",
            ok: false
        });
    }
}

export async function gChats(req, res) {
    try {
        const { conversationId } = req.query;
        const filter = { user: req.email };

        if (conversationId) {
            filter.conversationId = conversationId;
        }

        const chats = await Chat.find(filter)
            .sort({ created: -1 })
            .select("-user");

        return res.status(200).json({
            msg: "Historial obtenido correctamente",
            ok: true,
            chats
        });
    } catch (error) {
        console.error("Error al obtener el historial:", error);

        return res.status(500).json({
            msg: "Error al obtener el historial",
            ok: false
        });
    }
}

export async function gChat(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        const chat = await Chat.findOne({ _id: id, user: req.email }).select("-user");

        if (!chat) {
            return res.status(404).json({
                msg: "Traducción no encontrada",
                ok: false
            });
        }

        return res.status(200).json({
            msg: "Traducción obtenida correctamente",
            ok: true,
            chat
        });
    } catch (error) {
        console.error("Error al obtener la traducción:", error);

        return res.status(500).json({
            msg: "Error al obtener la traducción",
            ok: false
        });
    }
}

export async function dChat(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        const chat = await Chat.findOneAndDelete({ _id: id, user: req.email });

        if (!chat) {
            return res.status(404).json({
                msg: "Traducción no encontrada",
                ok: false
            });
        }

        return res.status(200).json({
            msg: "Traducción eliminada correctamente",
            ok: true
        });
    } catch (error) {
        console.error("Error al eliminar la traducción:", error);

        return res.status(500).json({
            msg: "Error al eliminar la traducción",
            ok: false
        });
    }
}
