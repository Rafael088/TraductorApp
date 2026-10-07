import jwt from "jsonwebtoken";
import User from "../models/users.js";

// Version base de identifyDevice para desbloquear /conversations.
// Segun ARQUITECTURA.md este middleware es de la rama fer: coordinar cambios con el.

export const identifyDevice = async (req, res, next) => {

    const deviceId = req.header("x-device-id");

    if (!deviceId) {
        return res.status(401).json({
            msg: "No hay deviceId en la peticion"
        })
    }
    try {
        const user = await User.findOne({ deviceId });

        if (!user) {
            return res.status(401).json({
                msg: "Dispositivo no registrado"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            msg: "Error al identificar el dispositivo"
        })
    }
}

export const validateJWT = (req, res, next) => {

    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token en la peticion"
        })
    }
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        //req.uid = payload.id
        req.email = payload.email
        next();
    } catch (error) {
        return res.status(401).json({
            msg: "Token Invalido"
        })
    }
}