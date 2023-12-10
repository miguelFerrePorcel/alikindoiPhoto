/**
 * Este código proporciona la funcionalidad para obtener, actualizar y eliminar usuarios en la aplicación web,
 * y verifica la autorización del usuario mediante un token JWT antes de permitir estas operaciones.
 */

/** Importación de módulos y componentes necesarios */
import db from "@/lib/db";
import { verifyJwtToken } from "@/lib/jwt";
import User from "@/models/User";
import Blog from "@/models/Blog";
import bcrypt from "bcrypt";

/** Función que maneja solicitudes GET para recuperar un usuario por su ID.
 * Comienza conectándose a la base de datos mediante await db.connect();.
 * Extrae el ID del usuario desde los parámetros de la solicitud utilizando const id = ctx.params.id;.
 * Intenta buscar el usuario en la base de datos utilizando el modelo User y el método findById(id).
 * Si se encuentra el usuario, se devuelve una respuesta con los detalles del usuario en formato JSON y un estado HTTP 200.
 * Si se produce un error en la búsqueda del usuario, se devuelve una respuesta con un estado HTTP 500.
 */
export async function GET(req, ctx) {
    await db.connect();

    const id = ctx.params.id;

    try {
        const user = await User.findById(id);

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes PUT para actualizar un usuario por su ID.
 * Comienza conectándose a la base de datos.
 * Extrae el ID del usuario desde los parámetros de la solicitud utilizando const id = ctx.params.id;.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken(token).
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, intenta analizar el cuerpo de la solicitud como JSON utilizando req.json().
 * Busca el usuario en la base de datos utilizando User.findById(id).
 * Actualiza el usuario con la información del cuerpo de la solicitud utilizando User.findByIdAndUpdate(id, { $set: { ...body } }, { new: true }).
 * Se devuelve una respuesta con el usuario actualizado en formato JSON y un estado HTTP 200.
 * Si se produce un error en cualquier etapa del proceso, se devuelve una respuesta con un estado HTTP 500.
 */
export async function PUT(req, ctx) {
    await db.connect();

    const id = ctx.params.id;
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

        if (body.password) {
            // Verifica si se proporcionó una nueva contraseña
            // Si se proporcionó una nueva contraseña, cifra la contraseña antes de actualizarla
            const hashedPassword = await bcrypt.hash(body.password, 10);
            body.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { ...body } },
            { new: true }
        );

        return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes DELETE para eliminar un usuario por su ID.
 * Comienza conectándose a la base de datos.
 * Extrae el ID del usuario desde los parámetros de la solicitud.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, busca el usuario en la base de datos utilizando User.findById(id).
 * Elimina el usuario de la base de datos utilizando User.findByIdAndDelete(id).
 * Se devuelve una respuesta con un mensaje que indica que el usuario se ha eliminado con éxito y un estado HTTP 200.
 * Si se produce un error en cualquier etapa del proceso, se devuelve una respuesta con un estado HTTP 500.
 */
export async function DELETE(req, ctx) {
    await db.connect();

    const id = ctx.params.id;

    const accessToken = req.headers.get("authorization");
    const token = accessToken.split(" ")[1];

    const decodedToken = verifyJwtToken(token);

    if (!accessToken || !decodedToken) {
        return new Response(
            JSON.stringify({
                error: "no autorizado (token incorrecto o caducado)",
            }),
            { status: 403 }
        );
    }
    
    try {
        const user = await User.findById(id);

        if (user) {
            const username = user.username;
            // Primero, elimina los blogs asociados al usuario
            await Blog.deleteMany({ authorId: id });

            // Luego, elimina el usuario
            await User.findByIdAndDelete(id);
            
            return new Response(
                JSON.stringify({
                    msg: `Usuario "${username}" y blogs eliminados exitosamente`,
                }),
                { status: 200 }
            );
        } else {
            // El usuario no se encontró en la base de datos
            console.log("Usuario no encontrado");
            return new Response(
                JSON.stringify({ error: "Usuario no encontrado" }),
                { status: 404 } // Usuario no encontrado (código de estado 404)
            );
        }
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }

}
