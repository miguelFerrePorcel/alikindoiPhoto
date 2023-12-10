/**
 * Este código proporciona la funcionalidad para obtener una lista de blogs y crear nuevos blogs en la aplicación web.
 * Se asegura de que el usuario esté autorizado mediante un token JWT antes de permitir la creación de un nuevo blog.
 */

/** Importación de bibliotecas y módulos: */
import db from "@/lib/db";
import { verifyJwtToken, verifyToken } from "@/lib/jwt";
import Blog from "@/models/Blog";

/** Función que maneja solicitudes GET para recuperar una lista de blogs.
 * Comienza conectándose a la base de datos.
 * Utiliza el modelo Blog para buscar todos los blogs en la base de datos utilizando Blog.find({}).
 * Utiliza .populate("authorId") para cargar información relacionada con el autor de cada blog.
 * Si se encuentran blogs, devuelve una lista de blogs en formato JSON y un estado HTTP 200.
 * Si se produce un error en la búsqueda de blogs, se devuelve una respuesta con un estado HTTP 500.
 */
export async function GET(req) {
    await db.connect();

    try {
        const blogs = await Blog.find({}).populate("authorId");
        return new Response(JSON.stringify(blogs), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}

/** Función que maneja solicitudes POST para crear un nuevo blog.
 * Comienza conectándose a la base de datos.
 * Obtiene el token de acceso del encabezado de la solicitud, lo divide para extraer el token real y verifica si el token es válido utilizando verifyJwtToken.
 * Si el token no es válido o no está presente, se devuelve una respuesta de error con un estado HTTP 403 (no autorizado).
 * Luego, intenta analizar el cuerpo de la solicitud como JSON utilizando req.json().
 * Crea un nuevo blog en la base de datos utilizando Blog.create(body).
 * Devuelve una respuesta con el nuevo blog creado en formato JSON y un estado HTTP 201 (creado).
 * Si se produce un error al crear el blog, se devuelve una respuesta con un estado HTTP 500.
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
        body.authorName = decodedToken.username;
        const newBlog = await Blog.create(body);

        console.log("NUEVO POST: ", newBlog)
        
        return new Response(JSON.stringify(newBlog), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify(null), { status: 500 });
    }
}
