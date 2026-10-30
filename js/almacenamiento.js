const CLAVE_POSTULACIONES = "portal-autoridades.postulaciones";

function obtenerPostulaciones() {
  const guardado = localStorage.getItem(CLAVE_POSTULACIONES);
  return guardado ? JSON.parse(guardado) : [];
}

function guardarPostulacion(postulante) {
  const postulaciones = obtenerPostulaciones();
  postulaciones.push(postulante);
  localStorage.setItem(CLAVE_POSTULACIONES, JSON.stringify(postulaciones));
  return postulaciones;
}