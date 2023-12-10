/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import classes from "./blogCard.module.css";
import { useSession } from "next-auth/react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { toast } from "react-toastify";

/** El componente BlogCard toma un objeto blog como una prop de entrada. Este objeto contiene información relevante sobre un blog, como su título, descripción, URL de la imagen, cantidad de "me gusta", autor y el ID del blog.
 * Utiliza el hook useSession de Next.js para verificar si un usuario ha iniciado sesión en la aplicación. La información de la sesión se almacena en la variable session.
 * El componente mantiene un estado local para rastrear si el usuario actual ha dado "me gusta" al blog (isLiked) y la cantidad total de "me gusta" que ha recibido el blog (blogLikes).
 */
const BlogCard = ({
    blog: { title, category, desc, imageUrl, likes, authorId, _id },
}) => {
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(false);
    const [blogLikes, setBlogLikes] = useState(0);

    /** Hook secundario de React que se ejecuta después de que el componente se monta y cada vez que se actualiza una de sus dependencias, en este caso, session y likes.
     * Solo se ejecutará si la variable session (información de la sesión) y likes (lista de "me gusta" del blog) están definidas y tienen valores. Esto evita posibles errores al acceder a propiedades de objetos nulos o indefinidos.
     * Verifica si el ID del usuario actual (session.user?._id) está incluido en la lista de "me gusta" del blog, Si el usuario actual ya ha dado "me gusta" al blog, isLiked se establece en true. De lo contrario, isLiked se establece en false.
     * Se actualiza el estado local blogLikes utilizando setBlogLikes con el valor de la longitud de la lista de "me gusta" (likes.length). Esto refleja la cantidad total de "me gusta" que ha recibido el blog.
     *  El efecto tiene dos dependencias especificadas en el arreglo [session, likes]. Esto significa que el efecto se volverá a ejecutar cada vez que cambie session o likes, lo que garantiza que el estado local (isLiked y blogLikes) se mantenga actualizado en función de estos cambios.
     */
    useEffect(() => {
        if (session && likes) {
            setIsLiked(likes.includes(session.user?._id));
            setBlogLikes(likes.length);
        }
    }, [session, likes]);

    /** Función que se ejecuta cuando el usuario hace clic en el ícono de "me gusta" en el blog.
     * Se realiza una solicitud HTTP con el método PUT utilizando la función fetch con el ID del blog. en el que se hace clic para dar "me gusta".
     * Se incluye un encabezado con el token de autorización, que se obtiene de la sesión del usuario permitiendo al servidor identificar al usuario que está dando "me gusta".
     * Se verifica si la respuesta (res) es "exitosa".
     * Se Invierte el valor de isLiked en función de su valor anterior. Si el usuario ya había dado "me gusta", ahora se quitará; de lo contrario, se agregará.
     * Actualiza el estado local blogLikes, si el usuario ya había dado "me gusta" (isLiked es true), se reduce la cantidad en 1; de lo contrario, se incrementa en 1.
     * En caso de que ocurra algún error durante la solicitud, se captura y se muestra en la consola..
     */
    const handleLike = async () => {
        try {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${_id}/like`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "PUT",
                }
            );

            if (res.ok) {
                setIsLiked((prev) => !prev);
                setBlogLikes((prev) => (isLiked ? prev - 1 : prev + 1));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Función para mostrar un mensaje de error si el usuario no ha iniciado sesión al interactuar con la imagen
    const handleImageClick = () => {
        if (!session?.user) {
            toast.error("Inicia sesión para interactuar con la aplicación");
        }
    };

    /**  El componente BlogCard representa una tarjeta de blog que muestra información sobre un blog específico, incluyendo su título, descripción, imagen, autor y la opción de "me gusta"
     * verifica si el usuario está autenticado utilizando la propiedad session?.user. Si el usuario ha iniciado sesión, se mostrará un enlace al blog; de lo contrario, solo se mostrará la imagen del blog.
     * Se muestra la información del blog, el título, la descripción, el nombre del autor y la cantidad de "me gusta" con  un ícono de "me gusta" representado por AiFillLike o AiOutlineLike.
     * El componente maneja el evento de clic (onClick={handleLike}) para permitir a los usuarios dar "me gusta" o quitar su "me gusta" en el blog.
     */
    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                {session?.user ? (
                    <Link
                        className={classes.imgContainer}
                        href={`/blog/${_id}`}
                    >
                        <Image
                            src={imageUrl}
                            width={345}
                            height={345}
                            alt="Imagen del blog"
                            priority={true}
                            onClick={handleImageClick} // Añadir el onClick para manejar el click en la imagen
                        />
                    </Link>
                ) : (
                    <div className={classes.imgContainer}>
                        <Image
                            src={imageUrl}
                            width={345}
                            height={345}
                            alt="Imagen del blog"
                            priority={true}
                            onClick={handleImageClick} // Añadir el onClick para manejar el click en la imagen
                        />
                    </div>
                )}

                <div className={classes.blogData}>
                    <div
                        className={classes.left}
                        role="region"
                        aria-label="Nmbre del autor"
                    >
                        <h3>{title}</h3>
                        <p>{desc}</p>
                        <h2>Autor: {authorId.username}</h2>
                        <h3 className={classes.category}>{category}</h3>
                    </div>
                    <div
                        className={classes.right}
                        role="region"
                        aria-label="Likes recibidos"
                    >
                        {session?.user ? (
                            <>
                                {blogLikes}{" "}
                                {isLiked ? (
                                    <AiFillLike
                                        onClick={handleLike}
                                        size={20}
                                    />
                                ) : (
                                    <AiOutlineLike
                                        onClick={handleLike}
                                        size={20}
                                    />
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default BlogCard;
