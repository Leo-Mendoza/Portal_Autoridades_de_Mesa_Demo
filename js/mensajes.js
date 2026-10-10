function mostrarError(mensaje) {
  const elemento = document.getElementById("mensaje-error");
  elemento.textContent = mensaje;
  elemento.hidden = false;
}
