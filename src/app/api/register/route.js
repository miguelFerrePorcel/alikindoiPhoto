/**
 * Este código permite a los usuarios registrarse en la aplicación.
 * Verifica si ya existe un usuario con la misma dirección de correo electrónico.
 * Si no existe, crea un nuevo usuario en la base de datos después de cifrar su contraseña.
 * Luego, se devuelve una respuesta que contiene los detalles del usuario recién creado o un mensaje de error en caso de que se produzca un problema.
 */

/** Importación de módulos y componentes necesarios */
import db from "@/lib/db";
import bcrypt from "bcrypt";
import User from "@/models/User";

/** Función que maneja solicitudes POST para crear un nuevo usuario en la aplicación.
 * Comienza conectándose a la base de datos mediante await db.connect();.
 * Luego, analiza el cuerpo de la solicitud como JSON para obtener datos del usuario, incluyendo username, email, password, y imageUrl.
 * Se verifica si ya existe un usuario con la misma dirección de correo electrónico (email) en la base de datos utilizando User.findOne({ email }).
 * Si se encuentra un usuario con la misma dirección de correo electrónico, se lanza un error con el mensaje "El usuario ya existe".
 * Si no se encuentra un usuario con la misma dirección de correo electrónico, se procede a crear el nuevo usuario.
 * La contraseña (password) proporcionada se cifra utilizando la función bcrypt.hash con un nivel de salt y cifrado de 10.
 * Luego, se crea un nuevo usuario en la base de datos utilizando User.create con los datos proporcionados, incluyendo el nombre de usuario, dirección de correo electrónico, contraseña cifrada y URL de la imagen del perfil.
 * Se extrae la contraseña del nuevo usuario (para no incluirla en la respuesta) y se devuelve una respuesta con los detalles del usuario recién creado en formato JSON y un estado HTTP 201 (creado).
 * Si se produce un error en cualquier etapa del proceso, se devuelve una respuesta de error con un estado HTTP 500 y un mensaje que contiene detalles del error.
 */
export async function POST(req) {
    try {
        await db.connect();

        const {
            username,
            email,
            password: pass,
            imageUrl,
            web,
        } = await req.json();


        const isExisting = await User.findOne({ email });

        if (isExisting) {
            throw new Error("El usuario ya existe");
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            imageUrl,
            web,
        });


        const { password, ...user } = newUser._doc;

        console.log('NUEVO USUARIO',newUser);

        return new Response(JSON.stringify(user), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify(error.message), { status: 500 });
    }
}
