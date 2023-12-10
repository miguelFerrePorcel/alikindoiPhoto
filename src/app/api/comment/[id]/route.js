/**
 * Código para obtener una lista de comentarios relacionados con un blog específico y eliminar comentarios.
 * Se verifica la autorización del usuario mediante un token JWT antes de permitir la eliminación de un comentario.
 */

/** Importación de bibliotecas y módulos: */
import db from "@/lib/db";
import { verifyJwtToken } from "@/lib/jwt";
import Comment from "@/models/Comment";

/** Función que maneja solicitudes GET para recuperar una lista de comentarios relacionados con un blog específico.
 * Comienza conectándose a la base de datos.
 * Extrae el ID del blog desde los parámetros de la solicitud utilizando const id = ctx.params.id;.
 * Utiliza el modelo Comment para buscar todos los comentarios que tengan un campo blogId igual al ID del blog proporcionado.
 * Carga información relacionada con el autor de cada comentario utilizando .populate("authorId").
 * Si se encuentran comentarios, devuelve una respuesta con la lista de comentarios en formato JSON y un estado HTTP 200.
 * Si se produce un error en la búsqueda de comentarios, devuelve una respuesta con un estado HTTP 500.
 */
export async function GET(req, ctx) {
    await db.connect();

    const id = ctx.params.id;

    try {
        const comments = await Comment.find({ blogId: id }).populate(
            "authorId"
        );

        return new Response(JSON.stringify(comments), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes DELETE para eliminar un comentario por su ID.
 * Comienza conectándose a la base de datos.
 * Extrae el ID del comentario desde los parámetros de la solicitud utilizando const id = ctx.params.id;.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, se busca el comentario en la base de datos y se carga información relacionada con el autor del comentario.
 * Se verifica si el autor del comentario coincide con el usuario representado por el token JWT.
 * Si no coincide, se devuelve una respuesta de error con un estado HTTP 401 (no autorizado).
 * Se elimina el comentario de la base de datos utilizando Comment.findByIdAndDelete(id).
 * Se devuelve una respuesta con un mensaje indicando que el comentario se ha eliminado con éxito y un estado HTTP 200.
 * Si se produce un error en cualquiera de las etapas anteriores, se devuelve una respuesta con un estado HTTP 500.
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
                error: "No autorizado (token incorrecto o caducado)",
            }),
            { status: 403 }
        );
    }

    try {
        const comment = await Comment.findById(id).populate("authorId");
        if (comment.authorId._id.toString() !== decodedToken._id.toString()) {
            return new Response(
                JSON.stringify({ msg: "Sólo el autor puede eliminar su blog" }),
                { status: 401 }
            );
        }

        await Comment.findByIdAndDelete(id);

        return new Response(
            JSON.stringify({ msg: "comentario eliminado con éxito" }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}
