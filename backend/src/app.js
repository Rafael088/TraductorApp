import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import users from './routes/users.js';
import chats from './routes/chats.js';
import conversations from './routes/conversations.js';
import translate from './routes/translate.js';


dotenv.config();

const app = express()

app.use(
    cors({

        origin: "*",

    })
)
app.use(express.json())
app.use(users)
app.use(chats)
app.use(conversations)
app.use(translate)


export default app



