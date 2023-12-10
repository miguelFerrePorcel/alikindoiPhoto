/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import noUser from "@/../../public/user.png";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import classes from "./user.module.css";
import { BsFillPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "timeago.js";
import ConfirmationModal from "@/componnents/confirmModal/ConfirmationModal";
import { useRouter } from "next/navigation";

/** Estas funciones son parte de la lógica de manejo de eventos para permitir a los usuarios confirmar o cancelar la eliminación de su perfil y mostrar mensajes de éxito o error.*/
const UserDetails = (ctx) => {
    /** Se establecen los estados inciales para almacenar los detalles del usuario
     * Se utiliza el hook useSession para obtener información sobre la sesión del usuario que se almacena en la constante session.
     * Se establece estado para controlar si se debe mostrar una imagen o no.
     * Se establece estado para controlar si se debe mostrar un modal de confirmación cuando el usuario intenta eliminar su perfil.
     * Se establece estado para indicar si la eliminación del perfil está en proceso..
     */
    const [userDetails, setUserDetails] = useState("");
    const { data: session } = useSession();
    const [showImage, setShowImage] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    /** Ejecuta la función de logout de sesión de usuario
     * Espera a que se complete el logout antes de continuar
     * Redirige al usuario a la página de inicio ("/") después de hacer logout
     */
    const handleLogout = async () => {
        await signOut();
        /* router.push("/"); */
    };

    /** Se define un efecto con useEffect.
     * En el cuerpo de la función, se define una función asincrónica fetchUser que realiza una solicitud a la API para obtener los detalles del usuario cuyo ID se encuentra en ctx.params.id.
     * Se utiliza await fetch(...) para hacer la solicitud a la URL de la API correspondiente a los detalles del usuario. La opción { cache: "no-store" } se utiliza para evitar el almacenamiento en caché de la respuesta de la solicitud.
     * Se utiliza await res.json() para analizar la respuesta de la solicitud y obtener los datos del usuario en formato JSON. Estos datos se almacenan en el estado userDetails utilizando setUserDetails.
     * La condición session && fetchUser() verifica si hay una sesión actual (session) y luego llama a la función fetchUser(). Esto asegura que los detalles del usuario solo se carguen cuando haya una sesión válida.
     * El efecto tiene dos dependencias: session y ctx.params.id. Esto significa que el efecto se volverá a ejecutar cada vez que cualquiera de estas dos dependencias cambie. */
    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/user/${ctx.params.id}`,
                { cache: "no-store" }
            );
            const user = await res.json();
            setUserDetails(user);
        }
        session && fetchUser();
    }, [session, ctx.params.id]);

    /** Esta función se activa cuando se hace clic en una imagen o un elemento que debería mostrar una imagen. Cuando se llama a esta función, establece el estado showImage en true, lo que indica que se debe mostrar una imagen.*/
    const handleClickImage = () => {
        setShowImage(true);
    };

    /** Esta función se utiliza para cerrar la visualización de una imagen. Cuando se llama a esta función, establece el estado showImage en false, lo que indica que la imagen debe ocultarse.*/
    const handleClose = () => {
        setShowImage(false);
    };

    /** Esta función se activa cuando se realiza una acción para eliminar un perfil de usuario. Cuando se llama a esta función, establece el estado showConfirmationModal en true, lo que indica que se debe mostrar un modal de confirmación para confirmar la acción de eliminación.*/
    const handleDelete = () => {
        setShowConfirmationModal(true);
    };

    /** Esta función se utiliza para confirmar y llevar a cabo la eliminación de un perfil de usuario.
     * Establece isDeleting en true: Esto indica que se está procesando una solicitud de eliminación.
     * Realiza una solicitud de eliminación al servidor: Utiliza la función fetch para enviar una solicitud DELETE al servidor para eliminar el perfil de usuario. Se incluye el token de autorización en los encabezados para autenticar la solicitud.
     * Verifica si la solicitud al servidor fue exitosa: Comprueba si la respuesta (res) es satisfactoria (res.ok). Si la eliminación del perfil se realiza correctamente, procede a eliminar los blogs relacionados con ese perfil.
     * Realiza una segunda solicitud al servidor para eliminar los blogs relacionados con el perfil.
     * Verifica si esta solicitud es exitosa.
     * Muestra una notificación de éxito: Si la eliminación del perfil y los blogs se realizan correctamente, muestra una notificación de éxito utilizando toast.success.
     * Después de mostrar la notificación, hay un retraso de 5 segundos (setTimeout) antes de redirigir al usuario a la página principal.
     * Maneja errores: Si se produce algún error durante el proceso de eliminación, se captura el error y se muestra una notificación de error utilizando toast.error. También se registra el error en la consola.
     * Restablece el estado para limpiar la indicación de eliminación y cerrar el modal de confirmación
     */
    const handleConfirmDelete = async () => {
        setIsDeleting(true);

        try {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/user/${ctx.params.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "DELETE",
                }
            );

            if (res.ok) {
                // Notificar éxito
                toast.success("Perfil y blogs eliminados correctamente");

                // Ejecuta el logout después de un breve retraso
                setTimeout(() => {
                    handleLogout(); 
                }, 4850);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el perfil");
        }

        setIsDeleting(false);
        setShowConfirmationModal(false);
    };

    /** Se encarga de ocultar el modal de confirmación de eliminación */
    const handleCancelDelete = () => {
        setShowConfirmationModal(false);
    };

    /** Si no hay sesión... */
     if (!session) {
         return (
             <div
                 className={classes.bye}
                 role="region"
                 aria-label="Regresar a página de inicio"
             >
                 Hasta pronto
                 <Link
                     className={classes.home}
                     href="/"
                     aria-label="Página de inicio"
                 >
                     <FaHome />
                 </Link>
             </div>
         );
     }

    /** Muestra los detalles del usuario y le permite al usuario editar su perfil o eliminarlo si así lo desea
     * La imagen del usuario se muestra con un componente Image que puede ampliarse al hacer clic en ella (handleClickImage) y se muestra en un modal (showImage).
     * Los detalles del usuario, como el nombre de usuario, el correo electrónico, la descripción, Link y la fecha de creación, se muestran en elementos div con estilos específicos (classes).
     * Hay botones para editar y eliminar el perfil (handleEdit y handleDelete).
     * El modal de confirmación se muestra cuando el usuario hace clic en el botón de eliminación. Muestra un mensaje de confirmación y botones de "Confirmar" y "Cancelar".
     * Cuando se confirma la eliminación (handleConfirmDelete), se envía una solicitud a la API del servidor para eliminar el perfil y sus publicaciones.
     * Después de una eliminación exitosa, se muestra un mensaje de éxito y se redirige al usuario a la página principal.*/
    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                <Image
                    src={userDetails?.imageUrl || noUser}
                    alt="imagen de usuario"
                    width={500}
                    height={300}
                    objectFit="contain" // Ajusta la imagen para que quepa en el contenedor manteniendo la relación de aspecto
                    priority={true} // La imagen debe cargarse con prioridad alta
                    onClick={handleClickImage}
                />

                {showImage && (
                    <div className={classes.imgScreen} onClick={handleClose}>
                        <Image
                            src={userDetails?.imageUrl}
                            alt="imagen de usuario"
                            layout="fill" // Toma el tamaño del contenedor
                            objectFit="contain" // Ajusta la imagen para que quepa en el contenedor manteniendo la relación de aspecto
                            priority={true} // La imagen debe cargarse con prioridad alta
                            className={classes.imgDim}
                        />
                    </div>
                )}
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Nombre de usuario"
                >
                    <span className={classes.username}>
                        Usuario:
                        <span>{userDetails?.username}</span>
                    </span>
                </div>

                <div
                    className={classes.row}
                    role="region"
                    aria-label="Email de usuario"
                >
                    <span className={classes.email}>
                        Email:
                        <span>{userDetails?.email}</span>
                    </span>
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Web de usuario"
                >
                    <span className={classes.web}>
                        Link:
                        <span>{userDetails?.web}</span>
                    </span>
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Fecha de creación"
                >
                    <span className={classes.created}>
                        Creado: <span>{format(userDetails?.createdAt)}</span>
                    </span>
                </div>
                <div className={classes.row}>
                    <div className={classes.controls}>
                        <Link
                            role="region"
                            aria-label="Editar usuario"
                            className={classes.editButton}
                            href={`/user/edit/${ctx.params.id}`}
                        >
                            Editar <BsFillPencilFill />
                        </Link>
                        <Link
                            role="region"
                            aria-label="Regresar a página de inicio"
                            className={classes.home}
                            href="/"
                        >
                            <FaHome />
                        </Link>
                        <button
                            role="region"
                            aria-label="Eliminar usuario"
                            onClick={handleDelete}
                            className={classes.deleteButton}
                        >
                            Eliminar
                            <AiFillDelete />
                        </button>
                    </div>
                </div>
                <div>
                    <ConfirmationModal
                        isOpen={showConfirmationModal}
                        message="¿Estás seguro de eliminar tu usuario y todos tus Posts?"
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        isDeleting={isDeleting}
                    />
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default UserDetails;
