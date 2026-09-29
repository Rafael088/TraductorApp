import { User } from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export async function cUser(req, res) {
    try {
        const data = req.body; //Obtenemos la informacion del Front y la guardamos

        if (typeof data.email === "number") {
            return res.status(500).json({
                msg: "Error email no es valido",
                ok: false
            })
        }



        let user;

        const salt = bcrypt.genSaltSync()
        data.password = bcrypt.hashSync(data.password, salt)

        user = new User(data); //Asignamos el esquema con los datos nuevos

        await user.save(); //guardar en la DB
        console.log("User: " + user)

        res.status(200).json({
            msg: "User created succesfully",
            ok: true,
            user: {
                email: user.email,
                created: user.created,
                premium: user.premium
            }
        })

    } catch (error) {

        console.error("Error en la creacion del servidor: " + error);

        return res.status(500).json({
            msg: "Error creating new user",
            ok: false
        })

    }
}

export async function gUser(req, res) {
    try {

        const users = await User.find()

        res.status(200).json({
            msg: "User getting succesfully",
            ok: true,
            users: users,
        })

    } catch (error) {
        console.error("Error en el get del usuario: " + error);

        return res.status(500).json({
            msg: "Error getting new user",
            ok: false
        })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })


        if (!user) {
            return res.status(400).json({
                msg: "Credenciales no válidas - Correo",
                ok: false
            })
        }

        const validPassword = bcrypt.compareSync(password, user.password)
        if (!validPassword) {
            return res.status(400).json({
                msg: "Credenciales no válidas - Contraseña",
                ok: false
            })
        }

        const token = jwt.sign(

            {
                email: user.email,
                premium: user.premium
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )


        res.status(200).json({
            msg: "Login Exitoso -- Prubea",
            ok: true,
            token
        })


    } catch (error) {
        console.error("Error en el login: " + error);

        return res.status(500).json({
            msg: "Error login server",
            ok: false
        })
    }
}

export async function dUser(req, res) {

    const { id } = req.params
    if (!id) {
        return res.status(400).json({
            msg: "Falta el ID",
            ok: false
        })
    }

    await User.findByIdAndDelete(id)

    res.status(200).json({
        msg: "Usuario Eliminado Correctamente",
        ok: true
    })


}

export async function changePassword(req, res) {
    try {
        const { email, currentPassword, newPassword } = req.body


        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                msg: "Credenciales no válidas - Correo",
                ok: false
            })
        }

        const validPassword = bcrypt.compareSync(currentPassword, user.password)

        if (!validPassword) {
            return res.status(400).json({
                msg: "Credenciales no válidas - Contraseña",
                ok: false
            })
        }


        const salt = bcrypt.genSaltSync()
        const hashedNewPassword = bcrypt.hashSync(newPassword, salt)

        await User.findByIdAndUpdate(user._id, { password: hashedNewPassword })

        res.status(200).json({
            msg: "Cambio de Contraseña Exitoso",
            ok: true,
        })




    } catch (error) {
        console.error("Error en el cambio de contraseña: " + error);

        return res.status(500).json({
            msg: "Error changePassword server",
            ok: false
        })
    }
}