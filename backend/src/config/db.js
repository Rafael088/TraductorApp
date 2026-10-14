import mongoose from "mongoose";
import dns from "dns";

// Algunos routers/hotspots devuelven respuestas DNS que Node (c-ares) no puede
// interpretar (EBADRESP) al resolver los SRV de MongoDB. Forzamos servidores
// DNS publicos para que la conexion `mongodb+srv://` funcione siempre.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const dbConnect = async () => {

    const DB_URI =  process.env.DB_URI;

    mongoose.set('strictQuery', false)

    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("MongoDB conectado");
    } catch (error) {
        // La red puede estar inestable: no tiramos el servidor, reintentamos.
        // Sin este catch, la promesa rechazada mata el proceso (unhandled rejection).
        console.error("MongoDB no conectó (" + error.code + "), reintento en 5s:", error.message);
        setTimeout(dbConnect, 5000);
    }

}