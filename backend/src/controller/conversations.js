import Conversation from "../models/conversations.js";
import { Chat } from "../models/chats.js";

const isValidId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

export async function cConversation(req, res) {
    try {
        const conversation = await Conversation.create({
            userId: req.user._id,
            sourceLanguage: req.user.sourceLanguage,
            targetLanguage: req.user.targetLanguage
        });
        //Falta validacion
        return res.status(201).json({
            msg: "Conversación iniciada correctamente",
            ok: true,
            conversation
        });
    } catch (error) {
        console.error("Error al iniciar la conversación:", error);

        return res.status(500).json({
            msg: "Error al iniciar la conversación",
            ok: false
        });
    }
}

export async function endConversation(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        const conversation = await Conversation.findOne({ _id: id, userId: req.user._id });

        if (!conversation) {
            return res.status(404).json({
                msg: "Conversación no encontrada",
                ok: false
            });
        }

        if (conversation.endedAt) {
            return res.status(200).json({
                msg: "La conversación ya estaba cerrada",
                ok: true,
                conversation
            });
        }

        conversation.endedAt = new Date();
        conversation.segmentCount = await Chat.countDocuments({ conversationId: conversation._id });
        await conversation.save();

        return res.status(200).json({
            msg: "Conversación cerrada correctamente",
            ok: true,
            conversation
        });
    } catch (error) {
        console.error("Error al cerrar la conversación:", error);

        return res.status(500).json({
            msg: "Error al cerrar la conversación",
            ok: false
        });
    }
}

export async function gConversations(req, res) {
    try {
        const conversations = await Conversation.find({ userId: req.user._id })
            .sort({ startedAt: -1 });

        return res.status(200).json({
            msg: "Historial obtenido correctamente",
            ok: true,
            conversations
        });
    } catch (error) {
        console.error("Error al obtener el historial:", error);

        return res.status(500).json({
            msg: "Error al obtener el historial",
            ok: false
        });
    }
}

export async function gConversation(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        const conversation = await Conversation.findOne({ _id: id, userId: req.user._id });

        if (!conversation) {
            return res.status(404).json({
                msg: "Conversación no encontrada",
                ok: false
            });
        }

        const segments = await Chat.find({ conversationId: conversation._id })
            .sort({ created: 1 })
            .select("-userId");

        return res.status(200).json({
            msg: "Conversación obtenida correctamente",
            ok: true,
            conversation,
            segments
        });
    } catch (error) {
        console.error("Error al obtener la conversación:", error);

        return res.status(500).json({
            msg: "Error al obtener la conversación",
            ok: false
        });
    }
}

export async function dConversation(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                msg: "ID de conversación no válido",
                ok: false
            });
        }

        const conversation = await Conversation.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!conversation) {
            return res.status(404).json({
                msg: "Conversación no encontrada",
                ok: false
            });
        }

        await Chat.deleteMany({ conversationId: conversation._id });

        return res.status(200).json({
            msg: "Conversación eliminada correctamente",
            ok: true
        });
    } catch (error) {
        console.error("Error al eliminar la conversación:", error);

        return res.status(500).json({
            msg: "Error al eliminar la conversación",
            ok: false
        });
    }
}
