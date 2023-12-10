/**
 * Este código proporciona la funcionalidad para obtener una lista de usuarios y crear nuevos usuarios en la aplicación web.
 * Además, se verifica la autorización del usuario mediante un token JWT antes de permitir la creación de un nuevo usuario.
 */

// Importación de módulos y componentes necesarios
import db from "@/lib/db";
import { verifyJwtToken, verifyToken } from "@/lib/jwt";
import User from "@/models/User";

/** Función que maneja solicitudes GET para recuperar una lista de usuarios. (No se está usando la función)
 * Comienza conectándose a la base de datos utilizando await db.connect();.
 * Utiliza el modelo User para buscar todos los usuarios en la base de datos utilizando User.find({}).
 * Si se encuentran usuarios, se devuelve una respuesta con la lista de usuarios en formato JSON y un estado HTTP 200.
 * Si se produce un error en la búsqueda de usuarios, se devuelve una respuesta con un estado HTTP 500.
 */
export async function GET(req) {
    await db.connect();

    try {
        const users = await User.find({});
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes POST para crear un nuevo usuario.
 * Comienza conectándose a la base de datos.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken(token).
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, intenta analizar el cuerpo de la solicitud como JSON utilizando req.json().
 * Crea un nuevo usuario en la base de datos utilizando User.create(body).
 * Devuelve una respuesta con el nuevo usuario creado en formato JSON y un estado HTTP 201 (creado).
 * Si se produce un error al crear el usuario, se devuelve una respuesta con un estado HTTP 500.
 */
export async function POST(req) {
    await db.connect();

    const accessToken = req.headers.get("authorization");
    const token = accessToken.split(" ")[1];

    const decodedToken = verifyJwtToken(token);

    if (!accessToken || !decodedToken) {
        return new Response(
            JSON.stringify({
                error: "No autorizado (token incorrecto o caducado)",
            }),
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const newUser = await User.create(body);

        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}
