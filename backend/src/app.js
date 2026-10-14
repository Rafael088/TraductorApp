import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import users from './routes/users.js';
import chats from './routes/chats.js';
import conversations from './routes/conversations.js';
import translate from './routes/translate.js';
import products from './routes/products.js';


dotenv.config();

const app = express()

app.use(
    cors({

        origin: "*",

    })
)
app.use(express.json())

// Registro de peticiones: para ver desde consola qué llega del teléfono.
// Quitar cuando ya no se necesite el diagnóstico.
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[http] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    });
    next();
});

app.use(users)
app.use(chats)
app.use(conversations)
app.use(translate)
app.use(products)


export default app



