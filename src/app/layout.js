/** Este archivo de diseño (RootLayout) define la estructura básica de la página Next.js, incluyendo la barra de navegación en la parte superior, el contenido principal y el pie de página. 
 * Además, gestióna la sesión. */

// Importación de modulos y componentes necesarios
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/componnents/navBar/Navbar";
import Footer from "@/componnents/footer/Footer";
import Provider from "@/SessionProvider";

// Fuente de google
const inter = Inter({ subsets: ["latin"] });

// Título y descripción
export const metadata = {
    title: "alikindoiPhoto",
    description: "Proyecto Integrado del CGFS DAW",
};

/** RootLayout que recibe dos propiedades, children y session. children se utiliza para renderizar el contenido de la página y session es la información de sesión que se pasa como prop.
 * Se define el elemento html con un atributo lang establecido en "es" -> el idioma principal de la página es español.
 * Define el elemento body de la página y asigna una clase que proviene de la fuente "Inter".
 * Provider se encarga de la gestión de sesiones y autenticación en la aplicación.
 * Navbar y {children}: Renderiza el componente Navbar en la parte superior de la página, seguido del contenido de la página (representado por {children}).
 * Finalmente <Footer />: Renderiza el componente Footer en la parte inferior de la página.*/
export default function RootLayout({ children, session }) {

    return (
        <html lang="es">
            <body className={inter.className}>
                <Provider session={session}>
                    <Navbar />
                    {children}
                    <Footer />
                </Provider>
            </body>
        </html>
    );
}