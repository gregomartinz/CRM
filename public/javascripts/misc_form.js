
/**
 * Limpia los campos de un formulario.
 *
 * @param formId Id del formulario a limpiar.
 */
function cleanupForm(formId) {

    var form = document.getElementById(formId);

    var inputs = form.getElementsByTagName("input");
    for (var i=0 ; i < inputs.length ; i++) {
        inputs[i].value = "";
    }

    var selects = form.getElementsByTagName("select");
    for (var i=0 ; i < selects.length ; i++) {
        selects[i].value = "";
    }
}

/**
 * Escribe la fecha de hoy en los campos de formulario pasados como argumento.
 *
 *
 * @param date    String con la fecha a poner en los campos input dados en los siguientes argumentos.
 * @param field1Id id del campo input donde queremos poner la fecha de hoy.
 * @param field2Id id del campo input donde queremos poner la fecha de hoy.
 * @param field3Id id del campo input donde queremos poner la fecha de hoy.
 * @param field4Id etc.
 */
function setDate(date, field1Id, field2Id, field3Id, field4Id) {

    for (var i = 1 ; i < arguments.length ; i++) {
        var id = arguments[i];
        var field = document.getElementById(id);
        field.value = date;
    }
}


