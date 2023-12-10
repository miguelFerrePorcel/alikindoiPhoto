/** El código está siendo ejecutado en el lado del cliente. */
"use client";

/** Importación de modulos y componentes necesarios */
import React from "react";
import ScrollToTop from "react-scroll-to-top";
import classes from "./footer.module.css";
import Link from "next/link";

/** El componente crea un pie de página con información sobre la aplicación y enlaces de contacto, además de un botón que permite a los usuarios desplazarse suavemente hacia la parte superior de la página.*/
const Footer = () => {
    return (
        <footer className={classes.footer}>
            <div className={classes.wrapper}>
                <div className={classes.col}>
                    <br />
                    <br />
                    <h2>La App...</h2>
                    <p>
                        Aplicación creada para el proyecto integrado del ciclo
                        de grado superior de Desarrollo de Aplicaciones Web
                    </p>
                    <br />
                    <h2>Contacto</h2>
                    <span className={classes.email}>
                        Email:
                        <Link
                            className={classes.link}
                            href="mailto:"
                            target="_blank"
                        >
                            {""} alikindoiphoto@gmail.com{" "}
                        </Link>
                    </span>
                    <span className={classes.ig}>
                        Instagram:
                        <Link
                            className={classes.link}
                            href="https://www.instagram.com/alikindoiphoto/"
                            target="_blank"
                        >
                            {" "}
                            @alikindoiphoto
                        </Link>
                    </span>
                    <span className={classes.blog}>
                        Blogger:
                        <Link
                            className={classes.link}
                            href="https://alikindoi07.blogspot.com/"
                            target="_blank"
                        >
                            {" "}
                            @alikindoi07
                        </Link>
                    </span>
                    <br />
                    <br />
                </div>
            </div>
            <div role="region" aria-label="Subir al top de la página">
                <ScrollToTop smooth color="#000" />
                <p style={{ marginTop: "200vh" }}></p>
            </div>
        </footer>
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default Footer;
