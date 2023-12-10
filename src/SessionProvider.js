// El código está siendo ejecutado en el lado del cliente. 
"use client";

// Importación de modulos y componentes necesarios
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Este módulo proporciona un contexto de sesión de autenticación a la aplicación y la capacidad de mostrar notificaciones emergentes utilizando la biblioteca "react-toastify". Esto es útil para gestionar la autenticación y comunicarse con el usuario a través de notificaciones en la aplicación.
El componente Provider toma dos propiedades:
children: Los componentes hijos que se envolverán con el contexto de sesión y la capacidad de mostrar notificaciones.
session: La información de la sesión del usuario autenticado que se pasa al SessionProvider.
En el componente Provider, se utiliza SessionProvider para proporcionar el contexto de sesión y se pasa la session como prop.
Además, se incluye un ToastContainer para mostrar notificaciones emergentes.*/
const Provider = ({ children, session }) => (
    <>
        <SessionProvider session={session}>{children}</SessionProvider>
        <ToastContainer />
    </>
);

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Provider;
