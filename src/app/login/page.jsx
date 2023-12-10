/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "./login.module.css";
import { signIn } from "next-auth/react";

/** Este código se utiliza para manejar el inicio de sesión de usuarios en la aplicación y es parte de un formulario de inicio de sesión en la interfaz de usuario. Cuando el usuario llena los campos y hace clic en el botón de envío, se ejecuta handleSubmit para validar y autenticar al usuario.*/
const Login = () => {
    /** Se crean dos estados, email y password, utilizando el hook useState para rastrear los valores del correo electrónico y la contraseña ingresados por el usuario en el formulario de inicio de sesión.
     * Se obtiene el objeto router utilizando el hook useRouter de Next.js  para navegar a otras páginas dentro de la aplicación.
     * Se define la función handleSubmit que se ejecuta cuando se envía el formulario de inicio de sesión que se activa por el evento onSubmit del formulario.*/

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    /** e.preventDefault() para prevenir el comportamiento predeterminado del envío del formulario, que recargará la página.
     * Se verifica si los campos password y email están vacíos y se muestra una notificación de error utilizando toast.error().
     * Se intenta iniciar sesión llamando a signIn con el método de autenticación "credentials". El objeto con las credenciales se pasa como un objeto con las propiedades email y password.
     * Si la autenticación es exitosa se redirige al usuario a la página de inicio.
     * Si la autenticación falla, se muestra una notificación de error.
     * Si ocurre un error durante este proceso, se captura y se muestra en la consola */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password === "" || email === "") {
            toast.error("Rellene todos los campos!");
            return;
        }

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error == null) {
                router.push("/");
            } else {
                toast.error("Error en el acceso");
            }
        } catch (error) {
            console.error(error);
        }
    };

    /** Aquí se define la interfaz de usuario del formulario de inicio de sesión.
     * Se muestra el título "Log In".
     * Se define un formulario con el atributo onSubmit para llamar a la función handleSubmit cuando se envíe el formulario.
     * El formulario contiene dos campos de entrada <input>. El primero es para el correo electrónico y el segundo es para la contraseña. Cada campo tiene un atributo type que se configura como "email" o "password", respectivamente.
     * Se utilizan los eventos onChange para rastrear los cambios en los valores de correo electrónico y contraseña.
     * Cuando el usuario escribe en estos campos, se actualizan los estados locales email y password utilizando las funciones setEmail y setPassword.
     * Se muestra un botón "Log in" que se activa al hacer clic y que ejecutará la función handleSubmit para enviar el formulario.
     * Se muestra un enlace que permite al usuario cancelar el inicio de sesión y volver a la página principal.
     * También se muestra un enlace que lleva al usuario a la página de registro si no tiene cuenta y desea crear una.
     * Al final del componente, se utiliza ToastContainer para mostrar notificaciones.*/
    return (
        <div className={classes.container}>
            <div
                className={classes.wrapper}
                role="region"
                aria-label="Inicio de sesión"
            >
                <h2>Log In</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email..."
                        onChange={(e) => setEmail(e.target.value)}
                        role="region"
                        aria-label="Introduce email"
                    />
                    <input
                        type="password"
                        placeholder="Password..."
                        onChange={(e) => setPassword(e.target.value)}
                        role="region"
                        aria-label="Introduce password"
                    />
                    <button
                        className={classes.submitButton}
                        role="region"
                        aria-label="Inicar sesión"
                    >
                        Log in
                    </button>
                    <Link
                        className={classes.cancel}
                        href="/"
                        role="region"
                        aria-label="Cancelar inicio de sesión"
                    >
                        Cancelar
                    </Link>
                    <Link
                        className={classes.loginNow}
                        href="/register"
                        role="region"
                        aria-label="Crear cuenta de usuario"
                    >
                        No tienes cuenta? <br /> Crea una.
                    </Link>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Login;
