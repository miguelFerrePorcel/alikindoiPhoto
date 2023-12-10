/**
 * Este código gestiona la eliminación de comentarios en una aplicación web, garantizando que solo el autor del comentario pueda eliminarlo y verificando la autorización del usuario mediante un token JWT antes de permitir la eliminación.
 */

/** Importación de módulos y componentes necesario */
import db from "@/lib/db";
import { verifyJwtToken } from "@/lib/jwt";
import Comment from "@/models/Comment";

/** Función que maneja solicitudes POST para crear comentarios en una base de datos, verificando la autenticación del usuario mediante un token JWT y respondiendo con el resultado del proceso de creación del comentario o con un mensaje de error en caso de cualquier problema.
 * Comienza conectándose a la base de datos.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, se busca el comentario en la base de datos y se carga información relacionada con el autor del comentario.
 * Se verifica si el autor del comentario coincide con el usuario representado por el token JWT.
 * Si no coincide, se devuelve una respuesta de error con un estado HTTP 401 (no autorizado).
 * Se crea el comentario de la base de datos utilizando Comment.create(body).
 * Agrega la información del autor del comentario en el nuevo comentario creado
 * Se devuelve una respuesta con el nuevo comentario creado con un código de estado 201 (Creado) como respuesta
 * Si se produce un error en cualquiera de las etapas anteriores, se devuelve una respuesta con un estado HTTP 500.
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

        let newComment = await Comment.create(body);
        newComment = await newComment.populate("authorId");

        return new Response(JSON.stringify(newComment), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}
