import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
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
        created: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "segments",
        versionKey: false
    }
);

chatSchema.index({ conversationId: 1, created: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export { Chat };
