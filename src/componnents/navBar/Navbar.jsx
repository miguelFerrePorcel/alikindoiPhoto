/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import noUser from "@/../../public/user.png";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import classes from "./navbar.module.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/** Este componente muestra opciones de navegación y la imagen de perfil del usuario si está autenticado, y permite al usuario acceder a su perfil, cerrar la sesión o crear un nuevo blog desde un menú desplegable. Si el usuario no está autenticado, se muestran enlaces para acceder o registrarse.*/

const Navbar = () => {
    const { data: session, error } = useSession(); // Obtiene información sobre la sesión del usuario
    const router = useRouter(); // Permite utilizar funcionalidades de navegación

    const [showDropdown, setShowDropdown] = useState(false); // Estado para controlar la visibilidad del menú desplegable
    const dropdownRef = useRef(null); // Referencia al menú desplegable

    /** Ejecuta la función de logout de sesión de usuario
     * Espera a que se complete el logout antes de continuar
     * Redirige al usuario a la página de inicio ("/") después de hacer logout
     */
    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    /**Esta función detecta si se hace clic fuera de un elemento específico (referenciado por dropdownRef).
     * Cuando se activa un evento de clic en cualquier parte de la página, esta función verifica si el clic ocurrió fuera del elemento referenciado por dropdownRef.
     * Si el clic se produjo fuera de ese elemento, se ejecuta setShowDropdown(false) para ocultar el dropdown, utilizando un estado (showDropdown en este caso) para controlar su visibilidad.
     * Esto es útil para cerrar el dropdown cuando el usuario hace clic fuera de él.*/
    const handleOutsideClick = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setShowDropdown(false);
        }
    };

    /** Este useEffect controla los eventos de clic en el documento.
     * Cuando se monta el componente (y cuando el valor de error cambia), se agrega un event listener al documento para detectar clics (mousedown).
     * Si no hay ningún error (!error es true), se añade el event listener.
     * Cuando el componente se desmonta o cuando cambia el valor de error, se ejecuta la función de limpieza (return () => {...}) para remover el event listener y evitar problemas de memoria o fugas.
     * Esto se hace para asegurarse de que el event listener sea removido adecuadamente y no persista cuando el componente ya no esté en uso o cuando cambie la condición (en este caso, cuando error cambie).*/
    useEffect(() => {
        // Función que se ejecutará cuando ocurra un clic en el documento
        const handleClick = (event) => {
            handleOutsideClick(event); // Llama a la función handleOutsideClick definida anteriormente
        };

        // Si no hay error, agrega un event listener para el evento de clic (mousedown)
        if (!error) {
            document.addEventListener("mousedown", handleClick);
        }

        // Función de limpieza que se ejecuta cuando el componente se desmonta o cuando cambia la dependencia 'error'
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [error]); // El efecto se ejecutará cada vez que 'error' cambie

    /* Función querenderiza el contenido del dropdown si showDropdown es verdadero (true). 
    El dropdown contiene un icono de menú hamburguesa (GiHamburgerMenu) que se puede clicar para alternar la visibilidad del dropdown (showDropdown). 
    También incluye enlaces para acceder al perfil del usuario, crear un nuevo post y realizar el logout. 
    Cada elemento del dropdown está etiquetado con atributos aria-label para mejorar la accesibilidad y hacer que la interfaz sea más entendible para lectores de pantalla u otros dispositivos de asistencia. 
    Si showDropdown es false, la función retorna null, lo que significa que no se renderiza nada, ocultando así el dropdown.* */
    const renderDropdown = () => {
        // Verifica si showDropdown es false, si es así, no renderiza el dropdown
        if (!showDropdown) return null;

        // Si showDropdown es true, renderiza el contenido del dropdown
        return (
            <div
                className={classes.dropdown}
                role="navegaciòn"
                aria-label="Menú de usuario"
            >
                <GiHamburgerMenu
                    size={24}
                    className={classes.closeIcon}
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="Icono de Menú desplegable"
                />

                <Link
                    href={`/user/${session.user._id}`}
                    className={classes.profile}
                    aria-label="Acceso a Perfil"
                >
                    Perfil
                </Link>

                <Link
                    href="/create-blog"
                    className={classes.create}
                    aria-label="Crear Post"
                >
                    Crear
                </Link>

                <a onClick={handleLogout} className={classes.logout}>
                    Salir
                </a>
            </div>
        );
    };

    /** Muestra el título con un enlace que redirige a la página de inicio.
     * Una lista no ordenada que contiene elementos de navegación.
     * Si el usuario está autenticado se muestra la imagen del avatar del usuario.
     * Si se hace clic en la imagen, se muestra un menú desplegable con opciones para ver el perfil del usuario, cerrar la sesión y crear un nuevo blog.
     * Si el usuario no está autenticado, se muestran enlaces para acceder o registrarse en lugar de la imagen del avatar.
     * El menú desplegable (dropdown) contiene opciones para ver el perfil, cerrar la sesión y crear un nuevo blog. También hay un icono para cerrar el menú.
     */
    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                <div>
                    <h1 className={classes.left}>
                        <Link
                            href="/"
                            role="region"
                            aria-label="Acceso a página principal"
                        >
                            alikindoiPhoto
                        </Link>
                    </h1>
                </div>

                <div className={classes.right}>
                    {session ? (
                        <div ref={dropdownRef}>
                            <Image
                                className={classes.avatar}
                                onClick={() => setShowDropdown(!showDropdown)}
                                src={session?.user?.imageUrl || noUser}
                                alt="avatar"
                                width="45"
                                height="45"
                                aria-label="Pulsa para despegar el menú de opciones"
                            />
                            {renderDropdown()}{" "}
                            {/* Aquí se renderiza el menú desplegable */}
                        </div>
                    ) : (
                        <nav role="navigation">
                            <Link
                                href="/login"
                                className={classes.login}
                                aria-label="Acceso"
                            >
                                Acceso
                            </Link>
                            <Link
                                href="/register"
                                className={classes.register}
                                aria-label="Registro"
                            >
                                Registro
                            </Link>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Navbar;
