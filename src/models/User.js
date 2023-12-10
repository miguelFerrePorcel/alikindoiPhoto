//Este es el modelo de Mongoose para un documento de MongoDB llamado "User".

// Importación de modulos y componentes necesarios
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        // Campo de tipo String que almacena el nombre de usuario del usuario. Es obligatorio y debe ser único.
        username: {
            type: String,
            required: true,
            unique: true,
        },

        // Campo de tipo String que almacena la dirección de correo electrónico del usuario. Es obligatorio y debe ser único.
        email: {
            type: String,
            required: true,
            unique: true,
        },

        // Campo de tipo String que almacena la contraseña del usuario. Es obligatorio.
        password: {
            type: String,
            required: true,
        },

        // Campo de tipo String que almacena la URL de la imagen del usuario.
        imageUrl: {
            type: String,
        },

        // Campo de tipo String que almacena la web del usuario.
        web: {
            type: String,
        },
    },

    /* Esta opción agrega dos campos adicionales, createdAt y updatedAt, a cada documento del blog para registrar la fecha y hora en que se creó y se actualizó.*/
    { timestamps: true }
);

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default mongoose?.models?.User || mongoose.model("User", UserSchema);
