/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Este componente se utiliza para cerrar la sesión de un usuario y redirigirlo a la página principal de la aplicación web. No muestra ningún contenido en la página de cierre de sesión, ya que su propósito principal es realizar acciones de cierre de sesión y navegación.*/

/** Importación de modulos y componentes necesarios */
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Logout = () => {
    const router = useRouter();

    useEffect(() => {
        const handleSignOut = async () => {
            await signOut();
            router.push("/");
        };

        handleSignOut();
    }, [router]);

    return null; // No muestra ningún contenido en la página de cierre de sesión
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Logout;
