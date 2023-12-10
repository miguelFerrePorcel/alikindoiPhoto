/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import classes from "./createBlog.module.css";
import Link from "next/link";

/** Este componente permite a los usuarios crear nuevas entradas de blog con un título, descripción e imagen. 
 * La imagen se carga en Cloudinary y se almacena la URL de la imagen cargada en la entrada de blog.*/
const CreateBlog = () => {
    /** Se definen dos constantes: CLOUD_NAME y UPLOAD_PRESET, que se utilizan para la carga de imágenes en la plataforma de almacenamiento en la nube (Cloudinary). Estos valores representan el nombre del usuario y el conjunto de configuraciones preestablecidas para la carga de fotos.*/
    const CLOUD_NAME = "ddd7t4oyt";
    const UPLOAD_PRESET = "alikindoiPhoto_preset";

    /** Se utilizan estados (useState) para gestionar el título, la descripción, la imagen del blog que inicialmente se establece en null y los parámetros de la fotografía.
     * Se utiliza el estado selectedFileName para gestionar el nombre del archivo seleccionado por el usuario en el campo de selección de imagen queiInicialmente se establece en "No se ha seleccionado ningún archivo".
     * Se utiliza el hook useSession para obtener información sobre la sesión del usuario que se almacena en la constante session.
     * Se utiliza el hook useRouter para acceder al enrutador de Next.js, que permite redirigir al usuario después de realizar una acción.
     * Se verifica el estado de la sesión del usuario:
     * Si la sesión está en proceso de carga (status === "loading"), se muestra un mensaje de "Loading...".
     * Si la sesión no está autenticada (status === "unauthenticated"), se muestra un mensaje de "Access Denied", lo que significa que el usuario no tiene permiso para crear una entrada de blog si no ha iniciado sesión.
     */
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [desc, setDesc] = useState("");
    const [photo, setPhoto] = useState(null);
    const [aperture, setAperture] = useState("");
    const [speed, setSpeed] = useState("");
    const [iso, setIso] = useState("");
    const [selectedFileName, setSelectedFileName] = useState(
        "No se ha seleccionado ningún archivo"
    );
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        return <p className={classes.accessDenied}>Access Denied</p>;
    }

    /** En el manejador de eventos handleSubmit:
     * Se verifica si se han completado todos los campos obligatorios: título (title), descripción (desc) y una imagen (photo).
     * Si no se han completado todos los campos, se muestra un mensaje de error utilizando toast.error y se detiene el proceso.
     * Si se han completado todos los campos, se procede a cargar la imagen utilizando la función uploadImage.
     * Se utiliza la función fetch para realizar una solicitud HTTP. y se utiliza await para esperar a que la solicitud se complete antes de continuar.
     * La URL es la ruta en el servidor de la aplicación donde se maneja la creación de nuevas entradas de blog.
     * headers: Se especifican los encabezados de la solicitud. En este caso:
     * "Content-Type": Se indica que el tipo de contenido del cuerpo de la solicitud es JSON.
     * Authorization": Se incluye un encabezado de autorización con el token de acceso del usuario autenticado. Esto permite al servidor verificar la identidad del usuario y determinar si tiene permiso para crear una entrada de blog.
     * method: "POST" Indica que se está enviando información al servidor para crear  una nueva entrada de blog).
     * body: El cuerpo de la solicitud es un objeto JSON que contiene los datos de la nueva entrada de blog (título,descripción, URL de la imagen de la entrada de blog, el ID del autor de la entrada de blog, que se obtiene de session?.user?._id, el nombre del autor de la entrada de blog, que se obtiene de session?.user?.username.
     * Se verifica si la respuesta de la solicitud no es "ok", en ese caso, se lanza una excepción con el mensaje "Error occured".
     * Si la respuesta es "ok" se procede a extraer los datos de la respuesta en formato JSON.
     * Se muestra una notificación o mensaje de éxito al usuario para informar que la entrada de blog se creó con éxito.
     * Finalmente, después de crear la entrada de blog con éxito, se redirige al usuario a la página de la entrada de blog recién creada mediante la función router.push, que navegará a la URL de la entrada de blog utilizando el ID de la entrada de blog (blog?._id) para construir la URL.
     * En caso de error, se captura el error y se muestra en la consola.*/
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificación de campos requeridos
        if (!photo || !title || !desc) {
            toast.error("All fields are required");
            return;
        }

        try {
            // Subir la imagen
            const imageUrl = await uploadImage();

            // Crear objeto de datos para la nueva entrada de blog
            const body = {
                title,
                desc,
                category,
                imageUrl,
                authorId: session?.user?._id,
                authorName: session?.user?.username,
            };

            // Si la categoría es "Fotografía", agrega los parámetros adicionales al cuerpo de la solicitud
            if (category === "Fotografía") {
                body.aperture = aperture;
                body.speed = speed;
                body.iso = iso;
            }

            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/blog`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    method: "POST",
                    body: JSON.stringify(body),
                }
            );

            // Si la categoría es "Fotografía", agrega los parámetros adicionales al cuerpo de la solicitud
            if (category === "Fotografía") {
                body.aperture = aperture;
                body.speed = speed;
                body.iso = iso;
            }

            if (!res.ok) {
                throw new Error("Error creando el Post");
            }

            toast.success("Post creado correctamente");

            // Obtener los datos de la nueva entrada de blog desde la respuesta del servidor
            const newBlog = await res.json(); // Suponiendo que la respuesta contiene los datos del blog creado

            // Redirigir a la página de la nueva entrada de blog
            router.push(`/blog/${newBlog._id}`);
        } catch (error) {
            console.error(error);
        }
    };

    /** Esta función se encarga de subir una imagen a Cloudinary, un servicio de almacenamiento de imágenes en la nube.
     * Se comprueba si photo (la imagen que se va a subir) está definida. Si photo es null o undefined, la función retorna inmediatamente sin realizar ninguna acción.
     * Se crea un objeto FormData que se utiliza para construir conjuntos de pares clave/valor que se enviarán en una solicitud HTTP POST. En este caso, se agrega la imagen (photo) y la clave upload_preset con el valor UPLOAD_PRESET a formData.
     * Se utiliza la función fetch para enviar una solicitud HTTP POST a la URL de la API de Cloudinary, que se construye utilizando la variable CLOUD_NAME. La solicitud incluye el objeto formData como cuerpo de la solicitud.
     * Se espera la respuesta de la solicitud con await, y se almacena en la variable res.
     * Se parsea la respuesta de la solicitud como JSON que contiene información sobre la imagen que se ha subido, incluyendo su URL segura (secure_url) que se almacena en la variable imageUrl.
     * Finalmente, la función devuelve imageUrl, que es la URL segura de la imagen subida a Cloudinary.
     * Si ocurre algún error durante el proceso de carga de la imagen, se captura ese error y se registra en la consola, esto es útil para la depuración y para manejar cualquier problema que pueda surgir durante la carga de imágenes a la plataforma de Cloudinary.
     */
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

            const data = await res.json();

            const imageUrl = data["secure_url"];

            return imageUrl;
        } catch (error) {
            console.log(error);
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
                    <div role="region" aria-label="Apertura de diafragma">
                        <input
                            type="text"
                            id="aperture"
                            placeholder="Apertura..."
                            value={aperture}
                            onChange={(e) => setAperture(e.target.value)}
                        />
                    </div>
                    <br />
                    <div role="region" aria-label="Velocidad de obturación">
                        <input
                            type="text"
                            id="speed"
                            placeholder="Velocidad..."
                            value={speed}
                            onChange={(e) => setSpeed(e.target.value)}
                        />
                    </div>
                    <br />
                    <div role="region" aria-label="Valor de ISO">
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
    };

    /** Este fragmento de código representa una interfaz de usuario para crear un nuevo post con un título, descripción e imagen opcional. Los campos del formulario y los botones permiten al usuario ingresar información y enviarla para su procesamiento.
     * Se muestra un encabezado con el texto "Crear Post"
     * A continuación, hay un formulario que se envía cuando el usuario presiona el botón "Crear Post" que llama a la función handleSubmit. Dentro del formulario, hay 4 campos:
     * Un campo de entrada de texto para el título del post.
     * Un campo Select para seleccionar categoría, que si se establece en Fotografía añadira 3 campos de entrada adicionles.
     * Un campo de entrada de texto para la descripción del post.
     * Un campo para seleccionar una imagen, que está oculto y se activa cuando el usuario hace clic en la etiqueta "Subir Imagen".
     * Junto a la etiqueta "Subir Imagen", se muestra el nombre del archivo seleccionado. Inicialmente, se muestra "No se ha seleccionado ningún archivo". Cuando el usuario selecciona un archivo, se actualiza para mostrar el nombre del archivo seleccionado. Además, se muestra un ícono de verificación (<AiOutlineCheck />) si se ha seleccionado un archivo.
     * Debajo de los campos del formulario, hay dos botones:
     * Un botón con el texto "Crear Post" que permite al usuario enviar el formulario para crear un nuevo post.
     * Un botón con el texto "Cancelar" que redirige al usuario de regreso a la página principal.
     * Al final, se utiliza ToastContainer para mostrar notificaciones al usuario que se muestran en la parte superior de la pantalla.
     */
    return (
        <div className={classes.container}>
            <div
                className={classes.wrapper}
                role="region"
                aria-label="Crear un nuevo post"
            >
                <h2>Crear Post</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Título</label>
                    <input
                        type="text"
                        placeholder="Título..."
                        onChange={(e) => setTitle(e.target.value)}
                        role="region"
                        aria-label="Título del post"
                    />
                    <div
                        className={classes.category}
                        role="region"
                        aria-label="Selecciona categoría"
                    >
                        <label htmlFor="category">Categoría</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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
                        rows="3"
                        cols="25"
                        placeholder="Descripción..."
                        onChange={(e) => setDesc(e.target.value)}
                        role="region"
                        aria-label="Descripción del post"
                    />

                    <label htmlFor="image" aria-label="Subir imagen">
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
                    <button className={classes.createBlog}>Crear Post</button>
                    <Link
                        className={classes.cancel}
                        href="/"
                        role="region"
                        aria-label="Cancelar edición del post"
                    >
                        Cancelar
                    </Link>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default CreateBlog;
