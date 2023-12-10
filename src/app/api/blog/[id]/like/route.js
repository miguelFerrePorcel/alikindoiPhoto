/**
 * Este código maneja solicitudes PUT para dar "me gusta" o "quitar me gusta" a un blog (post) en la base de datos,
 * y verifica la autorización del usuario utilizando un token JWT.
 * Además, se asegura de que el token esté presente y sea válido antes de realizar cualquier acción en el blog.
 */

/** Importación de bibliotecas y módulos: */
import db from "@/lib/db";
import { verifyJwtToken } from "@/lib/jwt";
import Blog from "@/models/Blog";

/**PUT es una función asíncrona que maneja solicitudes PUT (para actualizar recursos) en la aplicación y se conecta a la base de datos utilizando await db.connect(). */
export async function PUT(req, ctx) {
    await db.connect();

    /**Se obtiene el ID del blog desde los parámetros de la solicitud. */
    const id = ctx.params.id;

    /**Se recupera el token de acceso desde el encabezado de la solicitud (authorization), y se divide para extraer el token real.*/
    const accessToken = req.headers.get("authorization");
    const token = accessToken.split(" ")[1];

    console.log(token);

    /** Verificar y decodificar el token JWT. 
     * Si no se puede verificar el token o si ha caducado, se devuelve una respuesta de error con el estado HTTP 403 (no autorizado). */
    const decodedToken = verifyJwtToken(token);

    if (!accessToken || !decodedToken) {
        return new Response(
            JSON.stringify({
                error: "No autorizado (token incorrecto o caducado)",
            }),
            { status: 403 }
        );
    }

    /** Se intenta buscar el blog en la base de datos utilizando su ID.
     * Se verifica si el usuario representado por el token JWT ya ha dado "me gusta" a este blog         (comprobando si el ID del usuario está presente en la lista de "likes" del blog).
     * Dependiendo del resultado, se agrega o se elimina el ID del usuario en la lista de "likes" del blog.
     * Finalmente, se guarda el blog actualizado en la base de datos. */
    try {
        const blog = await Blog.findById(id);

        if (blog.likes.includes(decodedToken._id)) {
            blog.likes = blog.likes.filter(
                (id) => id.toString() !== decodedToken._id.toString()
            );
        } else {
            blog.likes.push(decodedToken._id);
        }

        await blog.save();

        /** Si todo se ha ejecutado con éxito, se devuelve una respuesta con un estado HTTP 200 y un mensaje JSON que indica el éxito de la interacción con el blog.
         * Si se produce algún error, se devuelve una respuesta con un estado HTTP 200 y un JSON nulo. */
        return new Response(
            JSON.stringify({ msg: "Interactuó exitosamente con el blog." }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 200 });
    }
}
