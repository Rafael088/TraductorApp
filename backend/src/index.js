import app from './app.js';
import { dbConnect } from './config/db.js';
const port = 5000;

async function main(){

    try {

        await dbConnect();


        app.get('/home', (req, res) => res.send('Hola Mundo desde send') );

        app.listen(port, () => {

            console.log("Servidor corriendo en el puerto: " + port);

        } );


    } catch (error) {

        console.error("Error en la creacion del servidor: " + error);

    }

};

main();



