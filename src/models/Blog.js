//Este es el modelo de Mongoose para un documento de MongoDB llamado "Blog".

// Importación de modulos y componentes necesarios
import mongoose from "mongoose";

// Lista de categorías permitidas
const allowedCategories = ["Fotografía", "Collage", "Otro"];

const BlogSchema = new mongoose.Schema(
    {
        // Campo de tipo String que almacena el título del blog. Es obligatorio y debe tener al menos 4 caracteres.
        title: {
            type: String,
            required: true,
            min: 4,
        },

        // Campo de tipo String que almacena la descripción del blog. Es obligatorio y debe tener al menos 6 caracteres.
        desc: {
            type: String,
            required: true,
            min: 6,
        },

        //Ccampo de tipo String que almacena la URL de la imagen asociada al blog. Es obligatorio.
        imageUrl: {
            type: String,
            required: true,
        },

        /* Campo de tipo ObjectId que almacena una referencia al autor del blog. Se relaciona con el modelo "User". 
        Cada blog tiene un autor asociado.*/
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        /* Campo de tipo String que almacena el nombre del autor del blog. Es independiente del campo authorId y no es obligatorio.*/
        authorName: {
            // Nuevo campo para almacenar el nombre del autor
            type: String,
        },

        /* Campo de tipo Array de ObjectId que almacena las identificaciones de los usuarios que han indicado que les gusta este blog. El campo default se establece como un array vacío, lo que significa que, de forma predeterminada, no hay "me gusta" en el blog.*/
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        category: {
            type: String,
            required: true,
            enum: allowedCategories,
        },
        aperture: {
            type: String,
        },

        speed: {
            type: String,
        },

        iso: {
            type: String,
        },
    },

    /* Esta opción agrega dos campos adicionales, createdAt y updatedAt, a cada documento del blog para registrar la fecha y hora en que se creó y se actualizó.*/
    { timestamps: true }
);

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default mongoose?.models?.Blog || mongoose.model("Blog", BlogSchema);
