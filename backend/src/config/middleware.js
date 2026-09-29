import jwt from "jsonwebtoken";


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