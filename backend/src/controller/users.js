import User from "../models/users.js";



export async function cUser(req, res) {
    try {
        const data = req.body; //Obtenemos la informacion del Front y la guardamos

        let user;

        user = new User(data); //Asignamos el esquema con los datos nuevos

        await user.save(); //guardar en la DB
        console.log("User: " + user)

        res.status(200).json({
            msg: "User created succesfully",
            ok: true,
            user: {
                name: user.name,
                deviceId: user.deviceId,
                created: user.created
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

// GET /me — perfil del dispositivo actual.
// identifyDevice ya dejó al usuario en req.user, no hace falta consultar la DB.
export async function meUser(req, res) {
    try {
        const { _id, name, deviceId, sourceLanguage, targetLanguage, created } = req.user;

        res.status(200).json({
            msg: "Perfil obtenido correctamente",
            ok: true,
            user: {
                _id,
                name,
                deviceId,
                sourceLanguage,
                targetLanguage,
                created
            }
        })

    } catch (error) {
        console.error("Error al obtener el perfil: " + error);

        return res.status(500).json({
            msg: "Error getting user profile",
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
