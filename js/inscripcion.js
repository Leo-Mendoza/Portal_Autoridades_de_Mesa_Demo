const dialogo = document.getElementById("dialogo-inscripcion");
const formulario = document.getElementById("formulario-inscripcion");
const contenedorErrores = document.getElementById("errores-formulario");
const listaErrores = document.getElementById("lista-errores");
const mensajeExito = document.getElementById("mensaje-exito");

// Devuelve true / false según la opción elegida, o null si no eligió ninguna.
function leerSiNo(datosFormulario, nombreDelCampo) {
  const valor = datosFormulario.get(nombreDelCampo);
  if (valor === null) {
    return null;
  }
  return valor === "si";
}

function leerPostulante() {
  const datos = new FormData(formulario);

  return {
    nombre: datos.get("nombre").trim(),
    apellido: datos.get("apellido").trim(),
    dni: datos.get("dni").trim(),
    fechaNacimiento: datos.get("fechaNacimiento"),
    distrito: datos.get("distrito"),
    direccion: datos.get("direccion").trim(),
    telefono: datos.get("telefono").trim(),
    correo: datos.get("correo").trim(),
    fueAutoridad: leerSiNo(datos, "fueAutoridad"),
    cumplioCapacitacion: leerSiNo(datos, "cumplioCapacitacion"),
    afiliado: leerSiNo(datos, "afiliado"),
    partido: datos.get("partido").trim(),
    interesEnCharlas: leerSiNo(datos, "interesEnCharlas"),
  };
}

function ocultarMensajes() {
  mensajeExito.hidden = true;
  contenedorErrores.hidden = true;
}

function mostrarErroresDelFormulario(errores) {
  const items = errores.map((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    return item;
  });
  listaErrores.replaceChildren(...items);
  contenedorErrores.hidden = false;
  contenedorErrores.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function mostrarExito() {
  mensajeExito.hidden = false;
  mensajeExito.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function manejarEnvio(evento) {
  evento.preventDefault();
  ocultarMensajes();

  const postulante = leerPostulante();
  const errores = validarPostulante(postulante);

  if (errores.length > 0) {
    mostrarErroresDelFormulario(errores);
    return;
  }

  console.log("Postulante inscripto:", postulante);
  guardarPostulacion(postulante);
  formulario.reset();
  mostrarExito();
}

document.getElementById("boton-inscripcion").addEventListener("click", () => {
  ocultarMensajes();
  dialogo.showModal();
});
document.getElementById("boton-cerrar").addEventListener("click", () => dialogo.close());
formulario.addEventListener("submit", manejarEnvio);
