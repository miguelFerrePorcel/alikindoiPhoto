/** Importación de modulos y componentes necesarios */
import React from "react";
import classes from "@/componnents/confirmModal/confirmationModal.module.css"
import { AiFillDelete } from "react-icons/ai";
import { TiArrowBack } from "react-icons/ti";
import { GrAlert } from "react-icons/gr";

/** El componente se utiliza para crear un modal de confirmación con un mensaje y dos botones para confirmar o cancelar una acción. 
 * Este modal es una interfaz común para pedir la confirmación del usuario antes de realizar una acción crítica, como eliminar un elemento.
 *Toma las siguientes propiedades:
    isOpen: Un booleano que determina si el modal de confirmación debe mostrarse o no.
    message: El mensaje que se mostrará en el modal de confirmación.
    onConfirm: Una función que se ejecutará cuando el usuario confirme la acción.
    onCancel: Una función que se ejecutará cuando el usuario cancele la acción.*/
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    return (
        isOpen && (
            <div
                className={classes.modal}
                role="region"
                aria-label="Alerta para eliminar el post"
            >
                <div className={classes.confirmationRow}>
                    <div className={classes.confirmationIcon}>
                        <GrAlert />
                    </div>
                    <p className={classes.confirmationMessage}>{message}</p>
                </div>
                <div className={classes.confirmationRrow}>
                    <div className={classes.confirmationButtons}>
                        <button
                            className={classes.cancelButton}
                            onClick={onCancel}
                        >
                            Cancelar
                            <TiArrowBack />
                        </button>
                        <button
                            className={classes.deleteButton}
                            onClick={onConfirm}
                        >
                            Eliminar
                            <AiFillDelete />
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

// Se exporta el componente para que pueda ser importado y utilizado en otros archivos.
export default ConfirmationModal;
