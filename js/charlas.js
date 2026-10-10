const RUTA_CHARLAS = "data/charlas.json";

async function obtenerCharlas() {
  let respuesta;
  try {
    respuesta = await fetch(RUTA_CHARLAS);
  } catch (error) {
    throw new Error("No se pudo cargar el listado de charlas.");
  }
  if (!respuesta.ok) {
    throw new Error("No se encontró el archivo de charlas.");
  }

  try {
    return await respuesta.json();
  } catch (error) {
    throw new Error("El archivo de charlas tiene un formato inválido.");
  }
}

async function buscarCharlaPorId(id) {
  const charlas = await obtenerCharlas();
  return charlas.find((charla) => charla.id === id);
}
