import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import users from './routes/users.js';
import products from './routes/products.js';
import chats from './routes/chats.js';


dotenv.config();

const app = express()

app.use(
    cors({

        origin: "*",

    })
)
app.use(express.json())
app.use(users)
app.use(products)
app.use(chats)


export default app



