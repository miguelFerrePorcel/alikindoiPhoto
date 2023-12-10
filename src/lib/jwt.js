//Este módulo proporciona funciones para firmar (sign) y verificar (verify) tokens JSON Web (JWT).

/** Importación de modulos y componentes necesarios */
import jwt from "jsonwebtoken";

/** signing jwt
 * Esta función se utiliza para firmar un token JWT con la información proporcionada en el argumento payload. 
 * Se puede proporcionar opciones adicionales a través del objeto options. 
 * La función utiliza una clave secreta para firmar el token y devuelve el token JWT resultante.*/ 
export function signJwtToken(payload, options = {}) {
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, options);
    return token;
}

/** verifying jwt
 * Esta función se utiliza para verificar un token JWT. 
 * Toma un token como argumento y verifica su validez utilizando la misma clave secreta que se utiliza para firmar. 
 * Si el token es válido y no ha caducado, la función devuelve el contenido (payload) del token. 
 * Si el token no es válido o ha caducado, se captura una excepción y se devuelve null. 
 * También se registra un mensaje de error en la consola si se produce un error durante la verificación.*/ 
export function verifyJwtToken(token) {
    try {
        const secret = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secret);
        return payload;
    } catch (error) {
        console.error(error);
        return null;
    }
}