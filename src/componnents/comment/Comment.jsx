/** Importación de modulos y componentes necesarios */
import React from "react";
import { useSession } from "next-auth/react";
import { format } from "timeago.js";
import { BsTrash } from "react-icons/bs";
import classes from "./comment.module.css";
import Image from "next/image";

/** El componente Comment muestra un comentario, incluyendo el nombre de usuario del autor, el texto del comentario, la marca de tiempo y un ícono de eliminación (solo si el usuario actual es el autor). También proporciona la capacidad de eliminar el comentario mediante un botón de eliminación.
 * Este componente recibe dos propiedades: comment y setComments, que se utilizan para representar y manejar un comentario.
*/
const Comment = ({ comment, setComments }) => {
    /** Utiliza el hook useSession para obtener la información de la sesión del usuario.
     * Extrae el token de acceso (accessToken) del objeto de sesión, que se utiliza para autenticar las solicitudes.
     * Obtiene la URL del avatar del autor del comentario desde comment.authorId.imageUrl.*/
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const avatar = comment.authorId.imageUrl;

    /** Función asíncrona que se ejecuta cuando un usuario hace clic en el ícono de eliminación de un comentario.
     * Se realiza una solicitud DELETE a la API utilizando la función fetch, mediante una URL que incluye el ID del comentario específico.
     * Se incluye el encabezado Authorization con el token de acceso (accessToken) del usuario actual para autenticar la solicitud.
     * Si la solicitud DELETE se completa con éxito el comentario se ha eliminado con éxito en el servidor y se procede a la actualización de la lista de comentarios.
     * Se utiliza setComments para actualizar la lista de comentarios en el cliente.
     * La función filter se utiliza para crear un nuevo arreglo que excluye el comentario eliminado. Esto se hace comparando los _id de los comentarios en la lista con el _id del comentario que se eliminó. Los comentarios que no coinciden con el _id del comentario eliminado se mantienen en el nuevo arreglo.
     * Si ocurre algún error durante la eliminación del comentario, se captura y se muestra en la consola  para fines de depuración y seguimiento de problemas.*/
    const handleDeleteComment = async () => {
        try {
            await fetch(`https://alikindoiphoto.vercel.app/api/comment/${comment?._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                method: "DELETE",
            });

            setComments((prev) => {
                return [...prev].filter((c) => c?._id !== comment?._id);
            });
        } catch (error) {
            console.error(error);
        }
    };

    /** La imagen del avatar se muestra con el componente Image y se obtiene de la URL especificada en la variable avatar.
     * Se muestra el nombre de usuario del autor del comentario.
     * Se muestra la marca de tiempo del comentario con la clase timeago.
     * Se muestra el texto del comentario junto  un ícono de papelera. Este ícono solo se muestra si el session?.user?._id coincide con el _id del autor del comentario (comment?.authorId?._id). Es decir, solo el autor del comentario tiene la opción de eliminarlo.
     * Cuando en el ícono de papelera se hace clic, se ejecuta la función handleDeleteComment para eliminar el comentario correspondiente.*/
    return (
        <div
            className={classes.container}
            role="region"
            aria-label="Comentario"
        >
            <div className={classes.wrapper}>
                <div className={classes.left}>
                    <Image src={avatar} width="40" height="40" alt="Imagen del autor del comentario" />
                    <div className={classes.userData}>
                        <p>{comment?.authorId?.username}</p>{" "}
                        <span className={classes.timeago}>
                            {format(comment?.createdAt)}
                        </span>
                    </div>
                    <p className={classes.comment}>{comment?.text}</p>{" "}
                </div>
                <div className={classes.right}>
                    {session?.user?._id === comment?.authorId?._id && (
                        <BsTrash
                            className={classes.trashIcon}
                            onClick={handleDeleteComment}
                        />
                    )}
                </div>
            </div>
            <br />
        </div>
    );

};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Comment;
