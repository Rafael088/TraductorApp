import mongoose from "mongoose";


export const dbConnect = () => {

    const DB_URI =  process.env.DB_URI;
    
    mongoose.set('strictQuery', false)
    mongoose.connect(DB_URI)


}