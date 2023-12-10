/**
 * Funciones para obtener, actualizar y eliminar blogs en la aplicación web, y verifican la autorización del usuario a través de un token JWT.
 */

/** Importación de bibliotecas y módulos: */
import db from "@/lib/db";
import { verifyJwtToken } from "@/lib/jwt";
import Blog from "@/models/Blog";

/** Función que maneja solicitudes GET para recuperar un blog por su ID.
 * Comienza conectándose a la base de datos.
 * Luego, extrae el ID del blog de los parámetros de la solicitud.
 * Intenta buscar el blog en la base de datos utilizando el modelo Blog, y utiliza el método findById para buscar el blog por su ID.
 * Se utiliza el método .populate("authorId") para cargar información relacionada con el autor del blog.
 * Se utiliza .select("-password") para excluir la contraseña del blog de la respuesta.
 * Si se encuentra el blog, se devuelve una respuesta con el blog en formato JSON y un estado HTTP 200.
 * Si se produce un error en la búsqueda del blog, se devuelve una respuesta con un estado HTTP 500.
 */
export async function GET(req, ctx) {
    await db.connect();

    const id = ctx.params.id;

    try {
        const blog = await Blog.findById(id)
            .populate("authorId")
            .select("-password");

        return new Response(JSON.stringify(blog), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes PUT para actualizar un blog por su ID.
 * Comienza conectándose a la base de datos.
 * Luego, extrae el ID del blog de los parámetros de la solicitud.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, se intenta analizar el cuerpo de la solicitud como JSON utilizando req.json().
 * Se busca el blog en la base de datos y se carga información relacionada con el autor.
 * Se verifica si el autor del blog coincide con el usuario representado por el token JWT. Si no coincide, se devuelve una respuesta de error con un estado HTTP 403.
 * Se actualiza el blog con la información del cuerpo de la solicitud utilizando Blog.findByIdAndUpdate, y se devuelve el blog actualizado en formato JSON con un estado HTTP 200.
 * Si se produce un error en cualquiera de las etapas anteriores, se devuelve una respuesta con un estado HTTP 500.
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
        const blog = await Blog.findById(id).populate("authorId");

        if (blog?.authorId?._id.toString() !== decodedToken._id.toString()) {
            return new Response(
                JSON.stringify({
                    msg: "Sólo el autor puede actualizar su blog",
                }),
                { status: 403 }
            );
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $set: { ...body } },
            { new: true }
        );

        return new Response(JSON.stringify(updatedBlog), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes DELETE para eliminar un blog por su ID.
 * Comienza conectándose a la base de datos.
 * Extrae el ID del blog de los parámetros de la solicitud.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Se busca el blog en la base de datos y se carga información relacionada con el autor.
 * Se verifica si el autor del blog coincide con el usuario representado por el token JWT.
 * Si no coincide, se devuelve una respuesta de error con un estado HTTP 403.
 * Se elimina el blog de la base de datos utilizando Blog.findByIdAndDelete, y se devuelve una respuesta de éxito en formato JSON con un estado HTTP 200.
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
                error: "No autorizado (token incorrecto o caducado",
            }),
            { status: 403 }
        );
    }

    try {
        const blog = await Blog.findById(id).populate("authorId");
        if (blog?.authorId?._id.toString() !== decodedToken._id.toString()) {
            return new Response(
                JSON.stringify({
                    msg: "Sólo el autor puede eliminar su blog",
                }),
                { status: 403 }
            );
        }

        await Blog.findByIdAndDelete(id);

        return new Response(
            JSON.stringify({ msg: "Blog eliminado con éxito" }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}
