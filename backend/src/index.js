import app from './app.js';
const port = process.env.PORT || 5000;

async function main(){

    try {

        // Sin conexión a base de datos por ahora (ver ARQUITECTURA.md).


        app.get('/home', (req, res) => res.send('Hola Mundo desde send') );

        app.listen(port, () => {

            console.log("Servidor corriendo en el puerto: " + port);

        } );


    } catch (error) {

        console.error("Error en la creacion del servidor: " + error);

    }

};

main();



