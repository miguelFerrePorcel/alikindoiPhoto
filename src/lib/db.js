/** Módulo para administrar la conexión y desconexión a una base de datos MongoDB de manera eficiente y segura.*/

/** Importación de modulos y componentes necesarios */
import mongoose from "mongoose";

/** connection: Un objeto que se utiliza para mantener un seguimiento del estado de la conexión a la base de datos. Tiene una propiedad isConnected para verificar si ya existe una conexión.*/
const connection = {};

/** Función asincrónica que se encarga de establecer la conexión a la base de datos MongoDB. 
 * Comprueba si ya existe una conexión y si es así, no realiza ninguna acción. 
 * Si hay conexiones previas, las desconecta antes de establecer una nueva. 
 * Al final, actualiza el estado de isConnected con el estado de la conexión.*/
async function connect() {
    if (connection.isConnected) {
        return;
    }
    if (mongoose.connections.length > 0) {
        connection.isConnected = mongoose.connections[0].readyState;
        if (connection.isConnected === 1) {
            return;
        }
        await mongoose.disconnect();
    }
    const db = await mongoose.connect(process.env.MONGO_URL);
    connection.isConnected = db.connections[0].readyState;
}

/** Función asincrónica que se utiliza para desconectar de la base de datos MongoDB. 
 * Verifica si hay una conexión activa y, si es así, la desconecta. 
 * Sin embargo, solo se desconecta si el entorno es de producción. Esto puede ser útil para evitar desconexiones accidentales en entornos de desarrollo.*/
async function disconnect() {
    if (connection.isConnected) {
        if (process.env.NODE_ENV === "production") {
            await mongoose.disconnect();
            connection.isConnected = false;
        }
    }
}

//Oobjeto que exporta las funciones connect y disconnect para que puedan ser utilizadas en otros módulos
const db = { connect, disconnect };

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default db;
