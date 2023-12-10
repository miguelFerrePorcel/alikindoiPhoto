/**
 Código de JavaScript que utiliza las bibliotecas NextAuth, bcrypt y otras para implementar la autenticación de la aplicación web.
 */

/**Importación de bibliotecas y módulos:
next-auth - Biblioteca que se utiliza para implementar la autenticación en la aplicación Next.js.
CredentialsProvider - Proveedor de autenticación que permite a los usuarios autenticarse mediante credenciales (nombre de usuario y contraseña).
User - Modelo de usuario que se utiliza para interactuar con la base de datos y buscar usuarios por su dirección de correo electrónico.
signJwtToken - función para firmar un token JWT (JSON Web Token) después de la autenticación del usuario.
bcrypt - Biblioteca para realizar la comparación segura de contraseñas almacenadas en la base de datos.
db - Módulo de base de datos. 
*/

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { signJwtToken } from "@/lib/jwt";
import bcrypt from "bcrypt";
import db from "@/lib/db";

/**Se define el objeto handler que contiene la configuración del controlador de autenticación utilizando NextAuth */

const handler = NextAuth({
    providers: [
        /** CredentialsProvider permite autenticarse utilizando un nombre de usuario (etiquetado como "Email") y una contraseña (etiquetada como "Password"). */
        CredentialsProvider({
            type: "credentials",
            credentials: {
                username: {
                    label: "Email",
                    type: "text",
                    placeholder: "",
                },
                password: { label: "Password", type: "password" },
            },

            /**
             * La función authorize se utiliza para autenticar al usuario. Primero, se intenta conectar a la base de datos.
             * Luego, se busca un usuario en la base de datos por su dirección de correo electrónico:
             * - Si no se encuentra el usuario, se lanza un error ("Entrada no válida").
             * - Si se encuentra el usuario, se compara la contraseña proporcionada con la contraseña almacenada en la base de datos utilizando la función bcrypt.compare.
             * - Si la contraseña coincide, se firma un token JWT que contiene información del usuario y se devuelve como parte de la respuesta.
             */
            async authorize(credentials, req) {
                const { email, password } = credentials;

                await db.connect();

                const user = await User.findOne({ email });

                if (!user) {
                    throw new Error("Entrada no válida");
                }

                const comparePass = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!comparePass) {
                    throw new Error("Entrada no válida");
                } else {
                    const { password, ...currentUser } = user._doc;

                    const accessToken = signJwtToken(currentUser, {
                        expiresIn: "6d",
                    });

                    return {
                        ...currentUser,
                        accessToken,
                        imageUrl: currentUser.imageUrl,
                    };
                }
            },
        }),
    ],

    /**páginas personalizadas para el inicio de sesión ("signIn") y el cierre de sesión ("signOut") */
    pages: {
        signIn: "/login",
        signOut: "/logout",
    },

    /** Las devoluciones de llamada "jwt" y "session" se utilizan para personalizar el token JWT y la sesión del usuario después de la autenticación.
     * Esto se hace para agregar información adicional al token y a la sesión, como el ID del usuario y su imagen.
     */
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token._id = user._id;
                token.imageUrl = user.imageUrl;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.accessToken = token.accessToken;
                session.user.imageUrl = token.imageUrl;
            }

            return session;
        },
    },
});

/**
Finalmente, el controlador de autenticación se exporta como handler y se asigna a las rutas GET y POST  
*/
export { handler as GET, handler as POST };
