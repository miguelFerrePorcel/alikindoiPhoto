/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "./register.module.css";
import { AiOutlineFileImage } from "react-icons/ai";
import { AiOutlineCheck } from "react-icons/ai";
import Link from "next/link";

/** Este es un componente que se utiliza para permitir que los usuarios se registren en la aplicación web.*/
const Register = () => {
    /** Se establecen las siguientes variables de estado utilizando el hook useState de React:
     * username, email, password, verifyPassword, photo y web
     * Se utiliza el estado selectedFileName para gestionar el nombre del archivo seleccionado por el usuario en el campo de selección de imagen queiInicialmente se establece en "No se ha seleccionado ningún archivo".*/
    const CLOUD_NAME = "dfrln5zlm";
    const UPLOAD_PRESET = "alikindoiPhoto_preset";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [photo, setPhoto] = useState("");
    const [web, setWeb] = useState("");
    const [selectedFileName, setSelectedFileName] = useState(
        "No se ha seleccionado ningún archivo"
    );

    /** Se define una función llamada uploadImage que se encarga de cargar una imagen de perfil del usuario a Cloudinary.
     * Si photo es null o undefined, la función se detiene inmediatamente y no realiza ninguna carga.
     * Si photo contiene una imagen, la función crea el objeto FormData que se utiliza para construir conjuntos de pares clave/valor que representan datos de formulario. En este caso, se utiliza para construir un formulario que contiene la imagen que se cargará.
     * Se agrega la imagen a formData con el método append. La clave "file" se utiliza para representar el archivo de imagen y se asigna el valor de photo. Además, se agrega una clave "upload_preset" con el valor de UPLOAD_PRESET. que es un valor específico de Cloudinary que se utiliza para configurar la carga de imágenes.
     * Se realiza una solicitud fetch al punto final de carga de imágenes de Cloudinary ${CLOUD_NAME} se reemplaza con el nombre de la nube de Cloudinary configurado previamente en .env.
     * La solicitud se configura como POST y el cuerpo de la solicitud contiene el objeto formData que representa la imagen.
     * Se espera la respuesta de la solicitud con await que contiene la información de la imagen cargada.
     * Se analiza la respuesta como un objeto JSON con su URL segura (secure_url).
     * La función devuelve la URL segura de la imagen.
     * Si se produce algún error durante el proceso de carga de la imagen, se captura el error y se muestra en la consola.
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
            console.error(error);
        }
    };

    /** Esta función se encarga de recopilar los datos del formulario de registro, realizar validaciones, enviar una solicitud de registro al servidor y mostrar mensajes de éxito o error según la respuesta del servidor.
     * Se llama al método e.preventDefault() para prevenir el comportamiento predeterminado del formulario, que sería recargar la página.
     * Se llama a la función uploadImage() para cargar una imagen del usuario (si se ha seleccionado una) y se almacena la URL de la imagen en la variable imageUrl.
     * Se realizan validaciones para asegurarse de que se completaron todos los campos del formulario y que la contraseña y su verificación coinciden.
     * Se verifica si los campos username, email, password y verifyPassword están vacíos. Si alguno de estos campos está vacío, se muestra un mensaje de error y la función se detiene.
     * Se verifica si la contraseña y su verificación coinciden. Si no coinciden, se muestra un mensaje de error y la función se detiene.
     * Finalmente, se verifica que la contraseña tenga más de 6 caracteres, mayúsculas y minúsculas numeros o caracteres especiales. Si no cumple con este requisito, se muestra un mensaje de error y la función se detiene.
     * Si todas las validaciones son exitosas, se procede a realizar una solicitud fetch a /api/register. Esta solicitud se utiliza para enviar los datos de registro del usuario, incluyendo username, email, password, web e imageUrl (la URL de la imagen cargada).
     * Se establece la cabecera de la solicitud con el tipo de contenido "application/json" para indicar que los datos se envían en formato JSON.
     * La solicitud se configura como un método "POST", lo que indica que se está creando un nuevo registro.
     * El cuerpo de la solicitud se configura utilizando JSON.stringify para convertir los datos del usuario en una cadena JSON.
     * Se espera la respuesta de la solicitud utilizando await.
     * Se analiza la respuesta de la solicitud con await res.json() para obtener información adicional, y el resultado se muestra en la consola mediante console.log(await res.json()).
     * Si la respuesta es exitosa, se muestra un mensaje de éxito mediante toast.success y se redirige al usuario a través de signIn() al inicio de sesión (Login).
     * Si la respuesta no es exitosase muestra un mensaje de error mediante toast.error.

Si ocurre algún error en la solicitud o en el proceso de registro, se captura y se muestra en la consola.*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        const imageUrl = await uploadImage();

        if (
            username === "" ||
            email === "" ||
            password === "" ||
            verifyPassword === ""
        ) {
            toast.error("Completa todos los campos");
            return;
        }

        if (
            password !== verifyPassword ||
            password.length <= 6 ||
            !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d]|[\W_])/.test(password)
        ) {
            toast.error(
                "La contraseña debe tener más de 6 caracteres.\n- Contener mayúsculas, minúsculas, y un número o un carácter especial.\n- La contraseña y la verificación de contraseña deben coincidir."
            );
            return;
        }



        try {
            const res = await fetch("https://alikindoiphoto.vercel.app/api/register", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    imageUrl,
                    web,
                }),
            });

            if (res.ok) {
                toast.success("Usuario registrado con éxito");
                setTimeout(() => {
                    signIn();
                }, 3000);
                return;
            } else {
                toast.error("Error en el registro");
                return;
            }
        } catch (error) {
            console.error(error);
        }
    };

    /** Estructura del formulario de registro de la aplicación web.
     * Se muestra un encabezado que muestra "Registro" en el formulario.
     * Se establece el atributo onSubmit al formulario para que ejecute la función handleSubmit para procesar los datos del formulario.
     *  Se muestra campos de entrada de texto que permite al usuario ingresar su nombre de usuario, correo electrónico, web, contraseña y verificar contraseña. El atributo onChange se utiliza para capturar los cambios en el valor del campo y almacenarlos en el estado.
     *  Se muestra una etiqueta para permitir al usuario subir una imagen. Cuando el usuario hace clic en el texto "Subir imagen" o en el icono de imagen, se activa un campo de entrada de tipo archivo que está oculto. Cuando el usuario selecciona un archivo, se activa el evento onChange, y la función setPhoto almacena el archivo de imagen en el estado photo.
     * Se muestra el botón Register que permite al usuario enviar el formulario. Al hacer clic en él, se ejecutará la función handleSubmit, que procesa los datos del formulario.
     * El "botón" Tienes cuenta? Acceso invita al usuario a iniciar sesión si ya tiene una cuenta. Al hacer clic en él, se ejecuta la función signIn() que inicia sesión en la aplicación.
     * Finalmente <ToastContainer />: Componente que muestra notificaciones emergentes en la aplicación, como mensajes de éxito o error después de enviar el formulario. */
    return (
        <div className={classes.container}>
            <div
                className={classes.wrapper}
                role="region"
                aria-label="Registro de usuario"
            >
                <h2>Registro</h2>
                <br />
                <h3>
                    La contraseña debe tener más de 6 caracteres y contener al
                    menos
                    <br />
                    una mayúscula, una minúscula, y un número o un carácter
                    especial.
                </h3>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre de usuario..."
                        onChange={(e) => setUsername(e.target.value)}
                        role="region"
                        aria-label="Introducir nombre de usuario"
                    />
                    <input
                        type="email"
                        placeholder="Email..."
                        onChange={(e) => setEmail(e.target.value)}
                        role="region"
                        aria-label="Introducir correo electrónico"
                    />
                    <input
                        type="password"
                        placeholder="Password..."
                        onChange={(e) => setPassword(e.target.value)}
                        role="region"
                        aria-label="Introducir contraseña"
                    />
                    <input
                        type="password"
                        placeholder="Verificar contraseña..."
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        role="region"
                        aria-label="Vuelve a introducir contraseña"
                    />

                    <input
                        type="text"
                        placeholder="Web..."
                        onChange={(e) => setWeb(e.target.value)}
                        role="region"
                        aria-label="Introduce tu web o enlace a red social"
                    />

                    <label
                        htmlFor="image"
                        role="region"
                        aria-label="Elige imagen de usuario"
                    >
                        Subir imagen <AiOutlineFileImage size={30} />
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
                    <p>
                        {selectedFileName}{" "}
                        {selectedFileName !==
                            "No se ha seleccionado ningún archivo" && (
                            <AiOutlineCheck />
                        )}
                    </p>
                    <button
                        className={classes.submitButton}
                        role="region"
                        aria-label="Confirmar registro de usuario"
                    >
                        Registro
                    </button>
                    <Link
                        role="region"
                        aria-label="Cancelar registro de usuario"
                        className={classes.cancel}
                        href={'/'}
                    >
                        Cancelar
                    </Link>
                    <button
                        className={classes.loginNow}
                        onClick={() => signIn()}
                        role="region"
                        aria-label="Inciar sesión"
                    >
                        Tienes cuenta? <br /> Acceso.
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Register;
