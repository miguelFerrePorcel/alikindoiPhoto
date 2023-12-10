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

/** Este componente se utiliza para editar la información de un usuario, incluido su nombre de usuario, correo electrónico, contraseña y foto de perfil. El formulario permite realizar ediciones y proporciona retroalimentación visual al usuario mediante notificaciones emergentes de éxito o error. Además, se verifica la sesión del usuario para evitar el acceso no autorizado a esta página de edición.*/
const Edit = (ctx) => {
    /** Estas constantes almacenan valores relacionados con la carga de imágenes a un servicio de almacenamiento en la nube, como Cloudinary.*/
    const CLOUD_NAME = "dfrln5zlm";
    const UPLOAD_PRESET = "alikindoiPhoto_preset";

    /**  Se utilizan múltiples estados (variables) para controlar diferentes aspectos del formulario de edición del usuario, como el nombre de usuario, el correo electrónico, la contraseña, la verificación de contraseña, la foto seleccionada y el nombre del archivo seleccionado.
     * Se utiliza el hook useSession de Next.js para obtener información sobre la sesión del usuario actual.
     * Se obtiene el objeto router utilizando el hook useRouter de Next.js para navegar a otras páginas dentro de la aplicación.
     */
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [photo, setPhoto] = useState("");
    const [web, setWeb] = useState("");
    const [selectedFileName, setSelectedFileName] = useState(
        "No se ha seleccionado ningún archivo"
    );

    const { data: session, status } = useSession();
    const router = useRouter();

    /** Este hook utiliza para realizar una solicitud de obtención de datos del usuario actual y actualizar los estados del componente con esa información cuando el componente se monta. La solicitud se hace al servidor y se utiliza el ID del usuario proporcionado en ctx.params.id.*/
    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/user/${ctx.params.id}`
            );

            const user = await res.json();

            setUsername(user.username);
            setEmail(user.email);
            setWeb(user.web);
        }
        fetchUser();
    }, [ctx.params.id]);

    /** Se verifica el estado de la sesión (status) y, en función de ello, se muestra un mensaje de "Cargando" si la sesión está en proceso de carga o "Acceso Denegado" si el usuario no está autenticado.*/
    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        return <p className={classes.accessDenied}>Acceso Denegado</p>;
    }

    /** Función que se llama cuando el formulario se envía.
     * Verifica si se ha seleccionado una nueva imagen de perfil y, si es así, llama a la función uploadImage para cargarla a Cloudinary.
     * Prepara un objeto body con los campos username, email y web.
     * Verifica si se ha proporcionado una nueva contraseña y si la contraseña y la verificación coinciden, además de cumplir con los requisitos, antes de agregar la contraseña al objeto body.
     * Si se cargó una nueva imagen, agrega la URL de la imagen al objeto body.
     * Realiza una solicitud PUT al servidor con los datos actualizados del usuario y la información de autorización del usuario actual.
     * Si la solicitud tiene éxito, redirige al usuario a la página de login y muestra un mensaje de éxito. Si ocurre un error, muestra un mensaje de error.*/
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = null;
            if (photo) {
                imageUrl = await uploadImage();
            }

            const body = {
                username,
                email,
                web,
                
            };

            if (password) {
                if (
                    password === verifyPassword &&
                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d]|[\W_])/.test(password) &&
                    password.length > 6
                ) {
                    body.password = password;
                } else {
                    toast.error(
                        "La contraseña debe ser idéntica en ambas casillas.\nDebe tener más de 6 caracteres.\nDebe contener mayúsculas, minúsculas, y un número o un carácter especial."
                    );
                    return;
                }
            }
         


            if (imageUrl != null) {
                body.imageUrl = imageUrl;
            }

            const res = await fetch(
                `https://alikindoiphoto.vercel.app/api/user/${ctx.params.id}`,
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
                throw new Error("Error al actualizar el perfil");
            }

            router.push("/login");
            toast.success(
                "Perfil actualizado correctamente, Los cambios surtirán efecto en el próximo inicio de sesión"
            );
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el perfil");
        }
    };

    /** Esta función se utiliza para cargar una imagen de perfil a Cloudinary. Utiliza la biblioteca fetch para enviar una solicitud POST multipart/form-data a la API de Cloudinary y devuelve la URL de la imagen cargada.*/
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

    /** El componente renderiza un formulario con campos de entrada para editar el nombre de usuario, correo electrónico, contraseña y verificación de contraseña.
     * También permite cargar una imagen de perfil. Además, muestra el nombre del archivo seleccionado y un botón "Editar" para enviar el formulario.
     * Se utiliza un label junto con un input de tipo file para permitir al usuario seleccionar una imagen de perfil.
     * El botón "Editar" llama a la función handleSubmit al hacer clic en él.
     * Se proporciona un enlace de "Cancelar" que redirige al usuario de vuelta a su perfil sin realizar cambios.
     * Se utiliza el componente ToastContainer de la biblioteca "react-toastify" para mostrar notificaciones emergentes de éxito o error.*/
    return (
        <div className={classes.container}>
            <div
                className={classes.wrapper}
                role="region"
                aria-label="Editar usuario"
            >
                <h2>Editar Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        value={username}
                        type="text"
                        placeholder="Username..."
                        onChange={(e) => setUsername(e.target.value)}
                        role="region"
                        aria-label="Nombre de usuario"
                    />
                    <input
                        value={email}
                        type="email"
                        placeholder="Email..."
                        onChange={(e) => setEmail(e.target.value)}
                        role="region"
                        aria-label="Email de usuario"
                    />
                    <input
                        value={password}
                        type="password"
                        placeholder="Nuevo Password...?"
                        onChange={(e) => setPassword(e.target.value)}
                        role="region"
                        aria-label="Cambiar contraseña"
                    />

                    <input
                        value={verifyPassword}
                        type="password"
                        placeholder="Verificar contraseña..."
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        role="region"
                        aria-label="Repetir contraseña"
                    />

                    <input
                        value={web}
                        type="text"
                        placeholder="Web..."
                        onChange={(e) => setWeb(e.target.value)}
                        role="region"
                        aria-label="Web del usuario o enlace a red social"
                    />

                    <label
                        htmlFor="image"
                        role="region"
                        aria-label="Elegir imagen de usuario"
                    >
                        Subir Imágen <AiOutlineCloudUpload />
                    </label>
                    <input
                        id="image"
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            setPhoto(e.target.files[0]);
                            setSelectedFileName(`${e.target.files[0].name}`);
                        }}
                    />
                    <p
                        role="region"
                        aria-label="No se ha seleccionado ningún archivo"
                    >
                        {selectedFileName}{" "}
                        {selectedFileName !==
                            "No se ha seleccionado ningún archivo" && (
                            <AiOutlineCheck />
                        )}
                    </p>
                    <button
                        role="region"
                        aria-label="Cofirmar edición de usuario"
                        className={classes.edit}
                    >
                        Editar
                    </button>
                    <Link
                        role="region"
                        aria-label="Cancelar edición de usuario"
                        className={classes.cancel}
                        href={`/user/${ctx.params.id}`}
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
export default Edit;
