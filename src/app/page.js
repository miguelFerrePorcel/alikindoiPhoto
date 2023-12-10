/** Este código  muestra cómo se importan los módulos y estilos, cómo se obtienen y filtran los datos de los blogs, y cómo se diseñan la interfaz de usuario y los elementos interactivos para permitir a los usuarios buscar y explorar los blogs. Además, se incluye el manejo de errores y el consentimiento de cookies.*/

// El código está siendo ejecutado en el lado del cliente.
"use client";

//Importación de modulos y componentes necesarios
import React, { useState, useEffect } from "react";
import BlogCard from "@/componnents/blogCard/BlogCard";
import classes from "./page.module.css";
import useSWR from "swr"; // Hook (Stale-While-Revalidate) realiza solicitudes de datos a la API y recuperar datos de blogs
import CookieConsent from "react-cookie-consent";
import { BsSearch } from "react-icons/bs";
import { TbFilesOff } from "react-icons/tb";
import { BsCloudDownload } from "react-icons/bs";

// Función para realizar solicitudes HTTP y convertir la respuesta en JSON
const fetcher = (url) => fetch(url).then((res) => res.json());

// Componente principal de la página principal (Home)
export default function Home() {
    // Utilización de useSWR para obtener datos de blogs
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://alikindoiphoto.vercel.app/api/blog";
    const { data: blogs, error } = useSWR(apiUrl, fetcher);

    // Estados locales de término de busqueda, número total de blogs y blogs filtrados.
    const [searchTerm, setSearchTerm] = useState("");
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [filteredBlogs, setFilteredBlogs] = useState([]);

    // Estados locales de página actual y blogs por página
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 8;

    /** Efecto de React que se ejecuta cuando cambian las dependencias [searchTerm, blogs].
     * Aquí se realiza la lógica para filtrar los blogs basándose en el término de búsqueda introducido por el usuario y se actualiza el estado totalBlogs para mostrar el número total de blogs coincidentes.
     * Verifica si blogs contiene datos válidos antes de realizar cualquier operación.
     * Evita errores si blogs es null o undefined.
     * Se utiliza la función filter para crear un nuevo arreglo filteredBlogs que contiene solo los blogs que cumplen con ciertos criterios de búsqueda.
     * Convierte el término de búsqueda (searchTerm) a minúsculas para que la búsqueda no sea sensible a mayúsculas/minúsculas.
     * Convierte el título de cada blog a minúsculas. Si el título no existe (blog.title es null o undefined), se asigna una cadena vacía.
     * Convierte la descripción de cada blog a minúsculas, o asigna una cadena vacía si no existe.
     * Convierte la categoría de cada blog a minúsculas, o asigna una cadena vacía si no existe.
     * El bloque return dentro de blogs.filter compara el lowerTitle, lowerDescription, lowerCategory y el nombre del autor con el lowerSearchTerm. Si alguna de estas propiedades contiene el término de búsqueda, el blog se considera coincidente y se incluye en filteredBlogs.
     * Después de filtrar los blogs, se actualiza el estado totalBlogs con la longitud del arreglo filteredBlogs. Esto proporciona el número total de blogs coincidentes con el término de búsqueda.*/
    useEffect(() => {
        if (blogs) {
            const filteredBlogs = blogs.filter((blog) => {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const lowerTitle = blog.title ? blog.title.toLowerCase() : "";
                const lowerDescription = blog.desc
                    ? blog.desc.toLowerCase()
                    : "";
                const lowerCategory = blog.category
                    ? blog.category.toLowerCase()
                    : "";
                return (
                    lowerTitle.includes(lowerSearchTerm) ||
                    lowerDescription.includes(lowerSearchTerm) ||
                    lowerCategory.includes(lowerSearchTerm) ||
                    (blog.authorName &&
                        blog.authorName.toLowerCase().includes(lowerSearchTerm))
                );
            });

            setTotalBlogs(filteredBlogs.length);
            setFilteredBlogs(filteredBlogs);
        }
    }, [searchTerm, blogs]);

    // Calcula el índice de inicio y el índice final para los blogs que se mostrarán en la página actual
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;

    // Obtiene los blogs que se mostrarán en la página actual utilizando slice
    const blogsToDisplay = filteredBlogs.slice(startIndex, endIndex);

    // Calcula el número total de páginas. Math.ceil redondea hacia arriba, asegurándose de que incluso si hay algunos blogs adicionales, se mostrará una página adicional.
    const totalPages = blogs ? Math.ceil(totalBlogs / blogsPerPage) : 0;

    /** Función para manejar el cambio de página.
     * Verifica si la nueva página está dentro de los límites permitidos (mayor o igual a 1 y menor o igual al número total de páginas) antes de actualizar el estado currentPage. Esto ayuda a evitar que el usuario intente ir a una página que no existe.*/
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Mensaje de error
    if (error) return <div>Error al cargar datos: {error.message}</div>;

    /** Aquí se presenta la página principal que muestra una lista de publicaciones (blogs) y permite al usuario buscar publicaciones específicas utilizando un campo de búsqueda y aplica páginación.
     * Muestra un componente de consentimiento de cookies en la parte inferior de la página. Este componente aparece cuando un usuario visita el sitio y le permite aceptar las cookies.
     * El consentimiento se registra cuando el usuario acepta o desplaza la página y asigna un nombre específico a la cookie utilizada para registrar el consentimiento.
     * Verifica si hay datos de blogs (blogs). Si no se han cargado los datos (cuando blogs es null o undefined), muestra un spinner. En caso contrario, muestra el contenido de las publicaciones y el campo de búsqueda.
     *  Muestra el encabezado de la sección de publicaciones con el número total de blogs coincidentes.
     * El campo de entrada de texto permite al usuario ingresar un término de búsqueda.
     * verifica si existe al menos una publicación coincidente (totalBlogs es mayor que 0).
     * Verifica si blogs es una variable definida y no es nula antes de continuar con la operación. Esto evita errores si blogs es nulo o no está definido.
     * Mapea y renderiza las publicaciones utilizando el componente BlogCard. Cada publicación se identifica con su _id.
     * Verifica si hay más de una página antes de renderizar los controles de paginación y muestra botones para avanzar o retroceder página.
     */
    return (
        <main className={classes.container}>
            <div className={classes.cookieConsent}>
                <CookieConsent
                    location="bottom"
                    buttonText="Aceptar cookies"
                    cookieName="CookieConsent_alikindoiPhoto"
                    acceptOnScroll={true}
                    acceptOnScrollPercentage="30"
                    onAccept={(acceptedByScrolling) => {
                        if (acceptedByScrolling) {
                            alert("Cookies aceptadas mediante scrolling");
                        }
                    }}
                    contentClasses={{ message: "cookie-consent" }}
                    role="region"
                    aria-label="Aceptar cookies"
                >
                    Este sitio web utiliza cookies para garantizar la mejor
                    experiencia en nuestro sitio web.
                </CookieConsent>
            </div>

            <div className={classes.wrapper}>
                {!blogs ? (
                    <>
                        <div className={classes.loadingIcon}>
                            <BsCloudDownload />
                            <div className={classes.spinnerContainer}>
                                <div className={classes.spinner}></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            className={classes.postsHeader}
                            role="region"
                            aria-label="Número de posts"
                        >
                            <h2>Posts ({totalBlogs})</h2>
                        </div>
                        <div
                            className={classes.searchHeader}
                            role="region"
                            aria-label="Filtrar resultados"
                        >
                            <label htmlFor="search">
                                <BsSearch id="search-icon" /> Filtrar
                            </label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Categoría, Título, Autor, Descripción"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {totalBlogs > 0 ? (
                            <>
                                <div
                                    className={`${classes.blogContainer} ${classes.wrapper}`}
                                >
                                    {blogsToDisplay.map((blog) => (
                                        <BlogCard key={blog._id} blog={blog} />
                                    ))}
                                </div>
                                <div
                                    className={classes.paginationContainer}
                                    role="region"
                                    aria-label="Paginación"
                                >
                                    {totalPages > 1 && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage - 1
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                            >
                                                <h1
                                                    role="region"
                                                    aria-label="Regreso a página anterior"
                                                >
                                                    {"<<"} Anterior
                                                </h1>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage + 1
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                            >
                                                <h1
                                                    role="region"
                                                    aria-label="Avanzar a página siguiente"
                                                >
                                                    Siguiente {">>"}
                                                </h1>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <h2
                                role="region"
                                aria-label="No hay posts para mostrar"
                            >
                                No hay posts para mostrar <TbFilesOff />
                            </h2>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
