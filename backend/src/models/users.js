import mongoose from "mongoose";

const options = {

    collection: 'users',
    versionKey: false

}

const userSchema = new mongoose.Schema({

    email: {type: String},
    password: {type: String},
    created: {type: Date, default: Date.now},
    premium: {type: Boolean, default: false}


}, options);

const User = mongoose.model('User', userSchema)

export {User};