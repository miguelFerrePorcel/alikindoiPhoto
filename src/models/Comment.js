//Este es el modelo de Mongoose para un documento de MongoDB llamado "Comment".

// Importación de modulos y componentes necesarios
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        // Campo de tipo ObjectId que almacena una referencia al blog al que se refiere el comentario. Este campo se relaciona con el modelo "Blog" y es obligatorio.
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
        },

        // Campo de tipo ObjectId que almacena una referencia al autor del comentario. Este campo se relaciona con el modelo "User" y es obligatorio.
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Campo de tipo String que almacena el texto del comentario. Es obligatorio.
        text: {
            type: String,
            required: true,
        },
    },

    // Esta opción agrega dos campos adicionales, createdAt y updatedAt, a cada documento del blog para registrar la fecha y hora en que se creó y se actualizó.
    { timestamps: true }
);

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default mongoose?.models?.Comment ||
    mongoose.model("Comment", CommentSchema);
