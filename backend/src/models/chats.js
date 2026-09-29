import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        originalText: {
            type: String,
            required: true,
            trim: true
        },
        translatedText: {
            type: String,
            required: true,
            trim: true
        },
        sourceLanguage: {
            type: String,
            required: true,
            trim: true
        },
        targetLanguage: {
            type: String,
            required: true,
            trim: true
        },
        conversationId: {
            type: String,
            trim: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "chat_history",
        versionKey: false
    }
);

chatSchema.index({ user: 1, created: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export { Chat };
