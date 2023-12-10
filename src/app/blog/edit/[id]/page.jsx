/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import classes from "./edit.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai";
import Link from "next/link";

/** Este componente permite a los usuarios editar los detalles de un post, incluyendo el título, la descripción y la imagen del post.*/
const Edit = (ctx) => {
    /** Se definen constantes CLOUD_NAME y UPLOAD_PRESET, para la carga de imágenes a través de Cloudinary.
     * Se inicializan estados utilizando el hook useState para almacenar el título (title), la descripción (desc), y la foto (photo) que se editará. Además, se utiliza el hook useSession de NextAuth para obtener información de la sesión del usuario.
     */
    const CLOUD_NAME = "dfrln5zlm";
    const UPLOAD_PRESET = "alikindoiPhoto_preset";

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [desc, setDesc] = useState("");
    const [photo, setPhoto] = useState("");
    const [aperture, setAperture] = useState("");
    const [speed, setSpeed] = useState("");
    const [iso, setIso] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedFileName, setSelectedFileName] = useState(
        "No se ha seleccionado ningún archivo"
    );

    /** Se utiliza el hook useEffect para buscar los detalles del post a editar. Se hace una solicitud HTTP para obtener los detalles del post específico y se establecen los valores del título y la descripción en los estados correspondientes.
     * Se realizan comprobaciones de status (estado de la sesión) para manejar diferentes casos:
     * Si status es "loading", se muestra un mensaje de carga.
     * Si status es "unauthenticated", se muestra un mensaje de "Access Denied" en caso de que el usuario no esté autenticado.
     */
    useEffect(() => {
        async function fetchBlog() {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${ctx.params.id}`
            );

            if (!res.ok) {
                throw new Error("Error al obtener los detalles del blog");
            }

            const blog = await res.json();

            setTitle(blog.title);
            setDesc(blog.desc);
            setCategory(blog.category);
            setAperture(blog.aperture || "");
            setSpeed(blog.speed || "");
            setIso(blog.iso || "");
        }
        fetchBlog();
    }, [ctx.params.id]);

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        return <p className={classes.accessDenied}>Acceso Denegado</p>;
    }

    /** La función handleSubmit se ejecuta cuando se envía el formulario de edición.
     * Se valida que el título, la descripción y la foto (si se proporciona) no estén vacíos.
     * Si falta alguno de estos campos, se muestra una notificación de error utilizando toast.error.
     * Se intenta cargar la imagen utilizando la función uploadImage.
     * Se crea un objeto body que contiene el título, la descripción y, si se proporcionó una imagen, la URL de la imagen.
     * Se realiza una solicitud HTTP PUT para actualizar el post con los nuevos valores.
     * La solicitud incluye el encabezado de autorización y el cuerpo en formato JSON.
     * Si la solicitud es exitosa se redirige al usuario a la página de inicio.
     * En caso de error, se captura el error y se muestra en la consola.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (title === "" || desc === "" || category === "") {
            toast.error("All fields are required");
            return;
        }

        try {
            let imageUrl = null;
            if (photo) {
                imageUrl = await uploadImage();
            }

            const body = {
                title,
                desc,
                category,
            };

            // Si la categoría es "Fotografía", agrega los parámetros adicionales al cuerpo de la solicitud
            if (category === "Fotografía") {
                body.aperture = aperture;
                body.speed = speed;
                body.iso = iso;
            }

            if (imageUrl != null) {
                body.imageUrl = imageUrl;
            }

            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog/${ctx.params.id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "PUT",
                    body: JSON.stringify(body),
                }
            );

            if (!res.ok) {
                throw new Error("Error actualizando el post");
            }

            toast.success("Blog editado exitosamente");
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Error al editar el blog");
        }
    };

    /** La función uploadImage se encarga de cargar una imagen a través de Cloudinary.
     * Si se proporciona una foto, se crea un objeto FormData que contiene la imagen y el upload_preset y se realiza una solicitud HTTP POST a la URL de Cloudinary para cargar la imagen.
     * El componente renderiza un formulario que permite al usuario editar el título, la descripción y seleccionar una nueva imagen para el post.
     * Cuando el formulario se envía, se llama a handleSubmit. También hay un botón de "Editar" y un enlace para "Cancelar".
     * El formulario contiene elementos de entrada para el título y la descripción, y un input oculto para seleccionar la imagen.
     * Cuando se hace clic en la etiqueta "Subir Imágen" con el icono AiOutlineCloudUpload, se activa el input oculto para seleccionar una imagen.
     * Al final del componente, se muestra un contenedor de notificaciones (ToastContainer) que se utiliza para mostrar notificaciones de éxito o error al usuario.*/
    const uploadImage = async () => {
        if (!photo) return;

        const formData = new FormData();

        formData.append("file", photo);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) {
                throw new Error("Error suciendo imagen");
            }

            const data = await res.json();

            const imageUrl = data["secure_url"];

            return imageUrl;
        } catch (error) {
            console.log(error);
            toast.error("Error subiendo imagen");
        }
    };

    /** Esta función verifica si la categoría del post es "Fotografía". 
     * Si es así, renderiza campos adicionales para la edición de los parámetros relacionados con la fotografía, como apertura, velocidad e ISO. 
     * Si la categoría no es "Fotografía", la función devuelve null y no muestra ningún campo adicional. 
     * Esto permite una experiencia de edición más específica según la categoría del post que se está editando.*/
    const renderAdditionalFields = () => {
        if (category === "Fotografía") {
            return (
                <div>
                    <label htmlFor="Parameters">Parámetros</label>
                    <div
                        className={classes.additionalFields}
                        role="region"
                        aria-label="Parámetros de la fotografía"
                    >
                        <br />
                        <input
                            type="text"
                            id="aperture"
                            placeholder="Apertura..."
                            value={aperture}
                            onChange={(e) => setAperture(e.target.value)}
                        />
                        <input
                            type="text"
                            id="speed"
                            placeholder="Velocidad..."
                            value={speed}
                            onChange={(e) => setSpeed(e.target.value)}
                        />
                        <input
                            type="text"
                            id="iso"
                            placeholder="ISO..."
                            value={iso}
                            onChange={(e) => setIso(e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        return null; // Devuelve null si la categoría no es "Fotografía"
    };

    /** Aquí, se define cómo se mostrará la interfaz de usuario de la página de edición de un post.
     * Se agrega un título "Edit Post" para indicar que el usuario está en la página de edición.
     * A continuación, se crea un formulario que se enviará cuando el usuario haga clic en el botón "Edit".
     * El evento onSubmit se maneja con la función handleSubmit.
     * Dentro del formulario, se incluyen varios campos de entrada y un botón:
     * Un campo de entrada de texto (<input>) para editar el título del post. El valor (value) del campo se establece en el estado title, y cualquier cambio en el campo se maneja mediante onChange, que actualiza el estado con el nuevo valor del campo.
     * Un área de texto (<textarea>) para editar la descripción del post. Al igual que con el título, el valor del campo se establece en el estado desc y se actualiza a medida que el usuario escribe.
     * Una etiqueta (<label>) con un for que hace referencia a un elemento input oculto (usando id="image"). Esta etiqueta se utiliza para permitir al usuario cargar una nueva imagen para el post y muestra el icono AiOutlineCloudUpload.
     * Un elemento input oculto que se utiliza para seleccionar una imagen. Cuando el usuario hace clic en la etiqueta "Subir Imágen", esto activa este input oculto para que el usuario pueda seleccionar una imagen de su dispositivo.
     * Un botón que se etiqueta como "Edit". Cuando el usuario hace clic en este botón, se activará la función handleSubmit para enviar el formulario de edición.
     * Un enlace (<Link>) para cancelar la edición y redirige al usuario de vuelta al post original.
     * Al final del componente, se muestra un contenedor de notificaciones (ToastContainer) que se utiliza para mostrar mensajes de éxito o error al usuario.
     */
    return (
        <div className={classes.container}>
            <div
                className={classes.wrapper}
                role="region"
                aria-label="Editar post"
            >
                <h2>Editar Post</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Título</label>
                    <input
                        value={title}
                        type="text"
                        placeholder="Title..."
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <label htmlFor="category">Categoría</label>
                    <div
                        className={classes.category}
                        role="region"
                        aria-label="Categoría del post"
                    >
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            aria-labelledby="Selecciona categoría"
                        >
                            <option value="">Seleccionar categoría</option>
                            <option value="Fotografía">Fotografía</option>
                            <option value="Collage">Collage</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className={classes.additionalFields}>
                        {renderAdditionalFields()}
                    </div>

                    <label htmlFor="description">Descripción</label>
                    <textarea
                        value={desc}
                        rows="3"
                        cols="25"
                        placeholder="Description..."
                        onChange={(e) => setDesc(e.target.value)}
                    />
                    <label htmlFor="image" aria-label="Selecciona imagen">
                        Subir Imágen <AiOutlineCloudUpload />
                    </label>
                    <input
                        id="image"
                        type="file"
                        className={classes.fileInput}
                        onChange={(e) => {
                            setPhoto(e.target.files[0]);
                            setSelectedFileName(`${e.target.files[0].name}`);
                        }}
                    />
                    <p>
                        {selectedFileName}{" "}
                        {selectedFileName !==
                            "No se ha seleccionado ningún archivo" && (
                            <AiOutlineCheck />
                        )}
                    </p>
                    <button className={classes.editBlog}>Edit</button>
                    <Link
                        className={classes.cancel}
                        href={`/blog/${ctx.params.id}`}
                    >
                        Cancel
                    </Link>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Edit;
