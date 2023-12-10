/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import classes from "./blog.module.css";
import { BsFillPencilFill } from "react-icons/bs";
import { AiFillDelete, AiFillLike, AiOutlineLike } from "react-icons/ai";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "timeago.js";
import Comment from "@/componnents/comment/Comment";
import { AiOutlineCheck } from "react-icons/ai";
import { IoAperture } from "react-icons/io5";
import { SiSpeedtest } from "react-icons/si";
import { HiFilm } from "react-icons/hi";
import ConfirmationModal from "@/componnents/confirmModal/ConfirmationModal";
import { useRouter } from "next/navigation";

/** Se declara la función de componente BlogDetails, que recibe un objeto ctx como argumento. que contiene información sobre el contexto de uso del componente.
 * Se declaran estados utilizando el hook useState para almacenar información sobre los detalles del blog, si al usuario le gusta el blog, la cantidad de "likes", el texto del comentario y los comentarios del blog.
 * Se obtiene información de la sesión del usuario utilizando el hook useSession. Se obtiene el router de Next.js y se inicializan estados relacionados con la confirmación de eliminación y la imagen de perfil del usuario.
 */
const BlogDetails = (ctx) => {
    const [blogDetails, setBlogDetails] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [blogLikes, setBlogLikes] = useState(0);

    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);

    const { data: session } = useSession();
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const avatar = session?.user?.imageUrl;

    const authorLink = `http://${blogDetails?.authorId?.web}`;

    const router = useRouter();

    const commentsRef = useRef(null);

    /** Se utiliza el hook useEffect para realizar una acción después de que el componente se haya renderizado. En este caso, se utiliza para cargar los comentarios cuando cambia el id en ctx.params.id. */
    useEffect(() => {
        async function fetchComments() {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/comment/${ctx.params.id}`,
                { cache: "no-store" }
            );
            const comments = await res.json();

            setComments(comments);
        }
        fetchComments();
    }, [ctx.params.id]);

    /** Este useEffect se utiliza para cargar los detalles del blog y determinar si al usuario le gusta el blog. Solo se ejecutará si existen datos de sesión y si cambia el id en ctx.params.id. */
    useEffect(() => {
        async function fetchBlog() {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${ctx.params.id}`,
                {
                    cache: "no-store",
                }
            );
            const blog = await res.json();

            setBlogDetails(blog);
            setIsLiked(blog?.likes?.includes(session?.user?._id));
            setBlogLikes(blog?.likes?.length || 0);
        }
        session && fetchBlog();
    }, [session, ctx.params.id]);

    /** Se declaran estados y funciones para manejar la visualización de una imagen en pantalla completa y para cerrar la imagen. */
    const [showImage, setShowImage] = useState(false);

    const handleClickImage = () => {
        setShowImage(true);
    };

    const handleClose = () => {
        setShowImage(false);
    };

    /** Se define una función handleDelete que se ejecuta cuando el usuario desea eliminar un post. Esta función se activa al hacer clic en el botón "Eliminar" del post.
     * Establece el estado showConfirmationModal en true, lo que muestra un modal de confirmación para asegurarse de que el usuario realmente desea eliminar el post.
     */
    const handleDelete = () => {
        setShowConfirmationModal(true);
    };

    /** La función handleConfirmDelete, que se ejecuta cuando el usuario confirma la eliminación del post en el modal de confirmación.*/

    /** Se construye la URL para eliminar el post utilizando el id del post que se encuentra en ctx.params.id.
     * Se proporcionan encabezados HTTP que incluyen un token de autorización (accessToken) que se obtiene de la sesión del usuario. Esto asegura que solo el autorizado pueda eliminar el post.
     * Se especifica el método HTTP como DELETE, indicando que se eliminará el recurso.
     * Se verifica si la respuesta de la solicitud es exitosa (código de estado HTTP 200) y se muestra una notificación de éxito utilizando la biblioteca react-toastify, finalmente se redirige al usuario a la página principal ("/").
     * Si se produce algún error durante la eliminación, se captura en el bloque catch, donde se registra el error en la consola para fines de depuración y se muestra una notificación de error.
     * Se establece el estado isDeleting en false para indicar que la eliminación ha terminado.
     * Se oculta el modal de confirmación estableciendo showConfirmationModal en false
     */
    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${ctx.params.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "DELETE",
                }
            );

            if (res.ok) {
                toast.success("Post eliminado correctamente");
                setTimeout(function () {
                    router.push("/");
                }, 4850);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el post");
        }
        setIsDeleting(false);
        setShowConfirmationModal(false);
    };

    /** Esta función cancela la acción de eliminación y oculta el modal de confirmación sin eliminar el post. */
    const handleCancelDelete = () => {
        setShowConfirmationModal(false);
    };

    /**  Este fragmento de código maneja la acción de dar "like" a un post en el componente */

    /** Se envía una solicitud HTTP PUT al servidor para registrar el "like" en el post utilizando await para esperar la respuesta de la solicitud antes de continuar.
     * Se construye la URL para dar "like" a un post específico utilizando el id del post que se encuentra en ctx.params.id. La ruta incluye "/like" para indicar que se está realizando una acción de "like" en el post.
     * Se proporcionan encabezados HTTP que incluyen un token de autorización (accessToken) que se obtiene de la sesión del usuario. Esto asegura que solo los usuarios autorizados pueden dar "like".
     * Se verifica si la respuesta de la solicitud es exitosa (código de estado HTTP 200) -> Si el "like" se registró con éxito en el post.
     * Se verifica si el usuario ya había dado "like" al post. Si isLiked es true, significa que ya le había dado "like".
     * Si ya le había dado "like al post, se cambia el estado isLiked invirtiendo su valor actual. Esto es equivalente a quitar el "like" del post -> Se reduce la cantidad total de "likes" en el post en 1.
     * Si el usuario no le había dado "like" al post, se cambia el estado isLiked invirtiendo su valor actual y se incrementa la cantidad total de "likes" en el post en 1.
     * Si se produce algún error durante el proceso de dar "like" se registra el error en la consola para fines de depuración.
     */
    const handleLike = async () => {
        try {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${ctx.params.id}/like`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "PUT",
                }
            );

            if (res.ok) {
                if (isLiked) {
                    setIsLiked((prev) => !prev);
                    setBlogLikes((prev) => prev - 1);
                } else {
                    setIsLiked((prev) => !prev);
                    setBlogLikes((prev) => prev + 1);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    /** Este fragmento de código maneja la acción de agregar un comentario a un post en el componente BlogDetails.*/

    /** Se verifica si el texto del comentario es menor a 2 caracteres.
     * Si el comentario es demasiado corto, se muestra una notificación de error utilizando la biblioteca react-toastify para informar al usuario que el comentario debe tener al menos 2 caracteres de longitud y Se detiene la ejecución de la función y se sale de ella.
     * Se crea el objeto body que contendrá los datos del comentario, incluyendo el blogId (ID del post al que se está comentando), el authorId (ID del autor del comentario, obtenido de la sesión del usuario) y el text (texto del comentario).
     * Se envía una solicitud HTTP POST al servidor para agregar un nuevo comentario al post. Se utiliza el await para esperar la respuesta de la solicitud antes de continuar.
     * Se establecen encabezados HTTP, incluyendo el tipo de contenido como "application/json" y el token de autorización (accessToken) obtenido de la sesión del usuario. Esto asegura que solo los usuarios autorizados pueden agregar comentarios.
     * El objeto body se convierte en una cadena JSON y se envía en el cuerpo de la solicitud como datos.
     * Se espera la respuesta de la solicitud, que debería contener los detalles del nuevo comentario agregado.
     * Se actualiza el estado comments utilizando el valor previo y agregando el nuevo comentario en la parte superior de la lista mostrando el comentario más reciente primero.
     * Se limpia el estado commentText restableciendo su valor a una cadena vacía, lo que borra el texto del comentario después de haberlo agregado.
     * Si se produce algún error durante el proceso se registra el error en la consola para fines de depuración.
     */
    const handleComment = async () => {
        if (commentText?.length < 2) {
            toast.error("Comentario debe tener al menos 2 caracteres");
            return;
        }

        try {
            const body = {
                blogId: ctx.params.id,
                authorId: session?.user?._id,
                text: commentText,
            };

            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/comment`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "POST",
                    body: JSON.stringify(body),
                }
            );

            const newComment = await res.json();

            setComments((prev) => {
                return [newComment, ...prev];
            });

            setCommentText("");
        } catch (error) {
            console.error(error);
        }
    };

    /** Función que renderiza detalles adicionales relacionados con un blog específico, basado en la categoría del blog. En este caso "Fotografía".
    * Verifica si la propiedad blogDetails?.category es igual a "Fotografía".
    Si la categoría es "Fotografía", se devuelve un conjunto de detalles adicionales dentro de un contenedor <div> con la clase classes.additionalDetails.
    En este caso, se muestra información específica relacionada con la fotografía, representada por íconos y valores asociados a esos íconos.
    Cada detalle adicional se representa como un <span> que contiene un ícono (representado por componentes como <IoAperture />, <SiSpeedtest />, <HiFilm />) y un valor asociado. El valor se obtiene de las propiedades del objeto blogDetails.
    Los íconos utilizados corresponden a elementos visuales relacionados con la fotografía (apertura, velocidad, ISO).
    Si la categoría del blog no es "Fotografía", la función devuelve null, lo que implica que no se renderizará ningún detalle adicional en ese caso.*/
    const renderAdditionalDetails = () => {
        if (blogDetails?.category === "Fotografía") {
            return (
                <div
                    className={classes.additionalDetails}
                    role="region"
                    aria-label="Detalles adicionales de la fotografía"
                >
                    <span>
                        <IoAperture
                            className={classes.icon}
                            aria-label="Apertura de diafragma"
                        />
                        {" f "}
                        {blogDetails?.aperture}
                    </span>
                    <span>
                        <SiSpeedtest
                            className={classes.icon}
                            aria-label="Velocidad de obturación"
                        />{" "}
                        {blogDetails?.speed}
                    </span>
                    <span>
                        <HiFilm
                            className={classes.icon}
                            aria-label="Valor de ISO"
                        />{" "}
                        {blogDetails?.iso}
                    </span>
                </div>
            );
        }
        return null;
    };

    /** Este fragmento de código define la estructura y la interfaz de usuario para mostrar y gestionar los detalles de un blog, así como para interactuar con los comentarios y las acciones relacionadas con el blog, como dar "like" y eliminar.*/

    /** Se muestra una imagen del blog utilizando el componente Image de Next.js. La imagen tiene un atributo src que obtiene la URL de la imagen del blog desde blogDetails?.imageUrl. Cuando se hace clic en la imagen, se llama a la función handleClickImage.
     * Si la variable showImage es true, se muestra una pantalla de visualización de imagen completa. El usuario puede cerrar esta pantalla haciendo clic en ella, lo que activa la función handleClose.
     * Se muestran detalles del blog, como el título, el autor y los controles para editar o eliminar el blog. Si el usuario actual es el autor del blog, se muestran los botones "Editar" y "Eliminar" con los iconos correspondientes.
     * Se muestra la cantidad de "likes" del blog, y el usuario puede hacer clic en un botón con un ícono para dar "like" al blog o quitar su "like" si ya lo ha dado.
     * Se muestra el texto descriptivo del blog.
     * Se muestra la fecha de creación del blog formateada utilizando la biblioteca timeago.js.
     * Se presenta la sección de comentarios, que consta de un área de entrada de comentario y la lista de comentarios.
     * En el área de entrada de comentario, se muestra la imagen de perfil del usuario actual, un campo de entrada de texto para escribir el comentario y un botón para enviar el comentario. Cuando se hace clic en el botón, se llama a la función handleComment para agregar el comentario.
     * La lista de comentarios se muestra en el área designada, y si hay comentarios presentes, se muestran utilizando el componente Comment. Si no hay comentarios, se muestra un mensaje que invita al usuario a ser el primero en comentar.
     * Finalmente, se muestra un modal de confirmación (ConfirmationModal) que se activa cuando el usuario intenta eliminar el blog. Este modal pregunta al usuario si está seguro de eliminar el post y ofrece opciones para confirmar o cancelar la acción. El modal también muestra un mensaje personalizado y un indicador de estado de eliminación (isDeleting).
     * Al final del componente, se muestra un contenedor de notificaciones (ToastContainer) que se utiliza para mostrar notificaciones de éxito o error al usuario.
     */
    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                <div className={classes.img}>
                    {blogDetails?.imageUrl ? (
                        <Image
                            src={blogDetails.imageUrl}
                            alt="imagen del post"
                            width={500}
                            height={600}
                            priority={true}
                            onClick={handleClickImage}
                        />
                    ) : (
                        <div className="no-image-placeholder">
                            No se encontró ninguna imagen
                        </div>
                    )}

                    {showImage && (
                        <div
                            className={classes.imgScreen}
                            onClick={handleClose}
                        >
                            {blogDetails?.imageUrl ? (
                                <Image
                                    src={blogDetails.imageUrl}
                                    alt="imagen del post"
                                    width={500}
                                    height={600}
                                    priority={true}
                                    onClick={handleClickImage}
                                />
                            ) : (
                                <div className="no-image-placeholder">
                                    No se encontró ninguna imagen
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div
                    className={classes.ampliar}
                    role="region"
                    aria-label="Ampliar imagen"
                >
                    <h2 aria-hidden="true">Pincha en la imagen para ampliar</h2>
                </div>

                <div className={classes.row}>
                    {blogDetails?.authorId?._id.toString() ===
                    session?.user?._id.toString() ? (
                        <div
                            className={classes.controls}
                            role="region"
                            aria-label="Controles"
                        >
                            <Link
                                className={classes.editButton}
                                href={`/blog/edit/${ctx.params.id}`}
                                aria-label="Editar post"
                            >
                                Editar <BsFillPencilFill />
                            </Link>
                            <div className={classes.row}>
                                <div className={classes.likes}>
                                    {blogLikes}{" "}
                                    {isLiked ? (
                                        <AiFillLike
                                            size={25}
                                            onClick={handleLike}
                                        />
                                    ) : (
                                        <AiOutlineLike
                                            size={25}
                                            onClick={handleLike}
                                        />
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleDelete}
                                className={classes.deleteButton}
                                aria-label="Eliminar post"
                            >
                                Eliminar <AiFillDelete />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={classes.row}>
                                <div
                                    className={classes.likes}
                                    role="region"
                                    aria-label="Likes recibidos"
                                >
                                    {blogLikes}{" "}
                                    {isLiked ? (
                                        <AiFillLike
                                            size={25}
                                            onClick={handleLike}
                                        />
                                    ) : (
                                        <AiOutlineLike
                                            size={25}
                                            onClick={handleLike}
                                        />
                                    )}
                                </div>
                            </div>
                            <div
                                className={classes.row}
                                role="region"
                                aria-label="Autor del post"
                            >
                                <span className={classes.author}>
                                    Autor:{" "}
                                    <span>
                                        {blogDetails?.authorId?.username}
                                    </span>
                                </span>
                            </div>
                            <div
                                className={classes.row}
                                role="region"
                                aria-label="Link del autor"
                            >
                                <span className={classes.author}>
                                    Link:{" "}
                                    <span>
                                        <Link
                                            className={classes.link}
                                            href={authorLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {blogDetails?.authorId?.web}
                                        </Link>
                                    </span>
                                </span>
                            </div>
                        </>
                    )}
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Título del post"
                >
                    <span className={classes.title}>
                        Título:
                        <span>{blogDetails?.title}</span>
                    </span>
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Descripción del post"
                >
                    <span className={classes.desc}>
                        Descripción:
                        <span>{blogDetails?.desc}</span>
                    </span>
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Categoría del post"
                >
                    <button className={classes.category}>
                        {blogDetails?.category}
                    </button>
                    <div className={classes.parameters}>
                        {renderAdditionalDetails()}
                    </div>
                </div>
                <div
                    className={classes.row}
                    role="region"
                    aria-label="Fecha de creación"
                >
                    <span className={classes.createdAt}>
                        Creado:
                        <span>{format(blogDetails?.createdAt)}</span>
                    </span>
                </div>
                <div className={classes.commentSection}>
                    <div className={classes.commentInput}>
                        <Image
                            src={avatar}
                            width="45"
                            height="45"
                            alt="avatar"
                        />
                        <input
                            value={commentText}
                            type="text"
                            placeholder="Tu mensaje..."
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            aria-label="Enviar comentario"
                            onClick={handleComment}
                        >
                            <AiOutlineCheck></AiOutlineCheck>
                        </button>
                    </div>
                    <div
                        className={classes.comments}
                        ref={commentsRef}
                        tabIndex={0} // Hace que el contenedor sea enfocable
                    >
                        {comments?.length > 0 ? (
                            comments.map((comment) => (
                                <Comment
                                    key={comment._id}
                                    comment={comment}
                                    setComments={setComments}
                                />
                            ))
                        ) : (
                            <h4 className={classes.noComments}>
                                No hay commentarios. Sé el primero en comentar!
                            </h4>
                        )}
                    </div>
                </div>
                <div>
                    <ConfirmationModal
                        isOpen={showConfirmationModal}
                        message="¿Estás seguro de eliminar el Post?"
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
export default BlogDetails;
