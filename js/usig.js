const URL_NORMALIZAR_USIG = "https://servicios.usig.buenosaires.gob.ar/normalizar/";

async function obtenerUbicacionDeDireccion(direccion) {
  const parametros = new URLSearchParams({ direccion, geocodificar: "true" });

  let respuesta;
  try {
    respuesta = await fetch(`${URL_NORMALIZAR_USIG}?${parametros}`);
  } catch (error) {
    throw new Error("No se pudo conectar con el servicio de mapas.");
  }
  if (!respuesta.ok) {
    throw new Error("El servicio de mapas respondió con un error.");
  }

  const datos = await respuesta.json();
  const [primerResultado] = datos.direccionesNormalizadas || [];
  if (!primerResultado || !primerResultado.coordenadas) {
    throw new Error("El servicio de mapas no encontró la dirección de la sede.");
  }

  // USIG devuelve la longitud en "x" y la latitud en "y".
  return {
    direccionNormalizada: primerResultado.direccion,
    latitud: Number(primerResultado.coordenadas.y),
    longitud: Number(primerResultado.coordenadas.x),
  };
}
