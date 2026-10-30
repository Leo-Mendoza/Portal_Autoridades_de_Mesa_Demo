const EDAD_MINIMA = 18;
const ANIO_MINIMO_DE_NACIMIENTO = 1900;
const FORMATO_DNI = /^\d{7,8}$/;
const FORMATO_TELEFONO = /^[\d\s()+-]+$/;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function contarDigitos(texto) {
  return texto.replace(/\D/g, "").length;
}

function cumplioEdadMinima(fechaNacimientoIso) {
  const [anio, mes, dia] = fechaNacimientoIso.split("-").map(Number);
  const fechaEnQueCumpleLaEdad = new Date(anio + EDAD_MINIMA, mes - 1, dia);
  return fechaEnQueCumpleLaEdad <= new Date();
}

function validarFechaNacimiento(fechaNacimiento) {
  if (!fechaNacimiento) {
    return "Ingresá tu fecha de nacimiento.";
  }
  if (Number(fechaNacimiento.split("-")[0]) < ANIO_MINIMO_DE_NACIMIENTO) {
    return "La fecha de nacimiento no es válida.";
  }
  if (!cumplioEdadMinima(fechaNacimiento)) {
    return `Tenés que tener al menos ${EDAD_MINIMA} años para postularte.`;
  }
  return null;
}

function validarTelefono(telefono) {
  if (!telefono) {
    return "Ingresá tu teléfono.";
  }
  const cantidadDigitos = contarDigitos(telefono);
  if (!FORMATO_TELEFONO.test(telefono) || cantidadDigitos < 8 || cantidadDigitos > 13) {
    return "El teléfono debe tener entre 8 y 13 números (se permiten espacios, + - y paréntesis).";
  }
  return null;
}

function validarCorreo(correo) {
  if (!correo) {
    return "Ingresá tu correo de contacto.";
  }
  if (!FORMATO_CORREO.test(correo)) {
    return "El correo no es válido: tiene que ser del estilo nombre@dominio.com.";
  }
  return null;
}

// Devuelve la lista de problemas encontrados; si está vacía, los datos son válidos.
function validarPostulante(postulante) {
  const errores = [];

  if (!postulante.nombre) errores.push("Ingresá tu nombre.");
  if (!postulante.apellido) errores.push("Ingresá tu apellido.");
  if (!FORMATO_DNI.test(postulante.dni)) {
    errores.push("El DNI debe tener 7 u 8 números, sin puntos ni espacios.");
  }
  errores.push(validarFechaNacimiento(postulante.fechaNacimiento));
  if (!postulante.distrito) errores.push("Elegí tu distrito electoral.");
  if (!postulante.direccion) errores.push("Ingresá tu dirección actual.");
  errores.push(validarTelefono(postulante.telefono));
  errores.push(validarCorreo(postulante.correo));

  if (postulante.fueAutoridad === null) {
    errores.push("Indicá si ya fuiste autoridad de mesa.");
  }
  if (postulante.cumplioCapacitacion === null) {
    errores.push("Indicá si cumpliste la capacitación.");
  }
  if (postulante.afiliado === null) {
    errores.push("Indicá si estás afiliado/a a una agrupación política.");
  }

  return errores.filter((error) => error !== null);
}
