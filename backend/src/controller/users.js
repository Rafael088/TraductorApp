import User from "../models/users.js";

// Campos del usuario que se devuelven al cliente (nunca el documento completo).
const publicUser = (user) => {
    const { _id, name, deviceId, sourceLanguage, targetLanguage, created } = user;

    return { _id, name, deviceId, sourceLanguage, targetLanguage, created };
};

// POST /users — registro por deviceId (ARQUITECTURA.md §8).
// Idempotente: si el deviceId ya existe, devuelve ese mismo usuario.
export async function cUser(req, res) {
    try {
        const { name, deviceId } = req.body;

        if (!name || !deviceId) {
            return res.status(400).json({
                msg: "Faltan los campos name o deviceId",
                ok: false
            })
        }

        let user = await User.findOne({ deviceId });
        let created = false;

        if (!user) {
            try {
                user = await User.create({ name: name.trim(), deviceId });
                created = true;
            } catch (error) {
                // Dos arranques a la vez: gana el índice único y recargamos el usuario.
                if (error.code === 11000) {
                    user = await User.findOne({ deviceId });
                } else {
                    throw error;
                }
            }
        }

        if (!user) {
            return res.status(500).json({
                msg: "Error creating new user",
                ok: false
            })
        }

        res.status(created ? 201 : 200).json({
            msg: created ? "User created succesfully" : "User already exists",
            ok: true,
            user: publicUser(user)
        })

    } catch (error) {

        console.error("Error en la creacion del usuario: " + error);

        return res.status(500).json({
            msg: "Error creating new user",
            ok: false
        })

    }
}

// GET /me — perfil del dispositivo actual.
// identifyDevice ya dejó al usuario en req.user, no hace falta consultar la DB.
export async function meUser(req, res) {
    try {
        res.status(200).json({
            msg: "Perfil obtenido correctamente",
            ok: true,
            user: publicUser(req.user)
        })

    } catch (error) {
        console.error("Error al obtener el perfil: " + error);

        return res.status(500).json({
            msg: "Error getting user profile",
            ok: false
        })
    }
}

// PUT /me — cambia el nombre del dispositivo actual (ARQUITECTURA.md §8).
// Los idiomas se quedan bloqueados en Ajustes hasta que se decida abrirlos.
export async function updateMe(req, res) {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                msg: "El nombre no puede estar vacío",
                ok: false
            })
        }

        if (name.trim().length > 30) {
            return res.status(400).json({
                msg: "El nombre no puede superar los 30 caracteres",
                ok: false
            })
        }

        req.user.name = name.trim();
        await req.user.save();

        res.status(200).json({
            msg: "Perfil actualizado correctamente",
            ok: true,
            user: publicUser(req.user)
        })

    } catch (error) {
        console.error("Error al actualizar el perfil: " + error);

        return res.status(500).json({
            msg: "Error updating user profile",
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
