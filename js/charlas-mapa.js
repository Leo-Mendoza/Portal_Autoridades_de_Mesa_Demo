const CENTRO_POR_DEFECTO = [-34.6037, -58.3816]; // Ciudad de Buenos Aires
const ZOOM_POR_DEFECTO = 12;
const ZOOM_AL_SELECCIONAR = 16;
const ZOOM_MAXIMO_AL_ENCUADRAR = 15;
const URL_TEJAS_DEL_MAPA = "https://servicios.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png";

const listaCharlas = document.getElementById("lista-charlas");
const estadoMapa = document.getElementById("estado-mapa");

const entradas = new Map();
let mapa;
let idSeleccionada = null;

function crearMapa() {
  if (typeof L === "undefined") {
    throw new Error("No se pudo cargar el mapa. Revisá tu conexión a internet.");
  }
  mapa = L.map("mapa").setView(CENTRO_POR_DEFECTO, ZOOM_POR_DEFECTO);
  L.tileLayer(URL_TEJAS_DEL_MAPA, {
    maxZoom: 19,
    tms: true,
    attribution: '&copy; <a href="https://usig.buenosaires.gob.ar/">USIG - GCBA</a>',
  }).addTo(mapa);
}

function crearIcono() {
  return L.divIcon({
    className: "pin-contenedor",
    html: '<span class="pin"></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 33],
    popupAnchor: [0, -30],
  });
}

function crearTexto(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function crearContenidoDelPopup(charla) {
  const caja = document.createElement("div");
  caja.className = "popup-charla";

  caja.append(
    crearTexto("strong", "popup-charla__titulo", charla.titulo),
    crearTexto("span", "popup-charla__dato", charla.fechaHora),
    crearTexto("span", "popup-charla__dato", charla.sede?.nombre ?? ""),
    crearTexto("span", "popup-charla__dato", charla.sede?.direccion ?? ""),

  );
  return caja;
}

function moverElScroll(elemento) {
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  elemento.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block: "nearest" });
}

function crearEntradaDeCharla(charla) {
  const item = document.createElement("li");
  item.className = "charla";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "charla__seleccion";
  boton.setAttribute("aria-pressed", "false");

  const nota = crearTexto("span", "charla__nota", "");
  nota.hidden = true;

  boton.append(
    crearTexto("span", "charla__titulo", charla.titulo),
    crearTexto("span", "charla__dato", charla.fechaHora),
    crearTexto("span", "charla__dato", charla.sede?.nombre ?? ""),
    crearTexto("span", "charla__dato", charla.sede?.direccion ?? ""),
    nota
  );

  const enlace = document.createElement("a");
  enlace.className = "charla__enlace";
  enlace.href = `charla.html?id=${charla.id}`;
  enlace.textContent = "Saber más";

  item.append(boton, enlace);
  boton.addEventListener("click", () => seleccionarCharla(charla.id));

  return { charla, item, boton, nota, ubicacion: null, marcador: null };
}

function marcarEntrada(entrada, activa) {
  entrada.item.classList.toggle("charla--activa", activa);
  entrada.boton.setAttribute("aria-pressed", String(activa));

  if (entrada.marcador) {
    const elemento = entrada.marcador.getElement();
    if (elemento) {
      elemento.classList.toggle("pin-contenedor--activo", activa);
    }
    entrada.marcador.setZIndexOffset(activa ? 1000 : 0);
  }
}

function enfocarMarcador(marcador) {
  const destino = marcador.getLatLng();
  const zoom = Math.max(mapa.getZoom(), ZOOM_AL_SELECCIONAR);
  const yaEstaAhi = mapa.getZoom() === zoom && mapa.getCenter().distanceTo(destino) < 1;

  if (yaEstaAhi) {
    marcador.openPopup();
    return;
  }
  mapa.once("moveend", () => marcador.openPopup());
  mapa.flyTo(destino, zoom, { duration: 0.8 });
}

function seleccionarCharla(id, { desdeMapa = false } = {}) {
  const entrada = entradas.get(id);
  if (!entrada) {
    return;
  }

  const anterior = entradas.get(idSeleccionada);
  if (anterior && anterior !== entrada) {
    marcarEntrada(anterior, false);
  }
  idSeleccionada = id;
  marcarEntrada(entrada, true);

  if (desdeMapa) {
    moverElScroll(entrada.item);
    return;
  }
  if (entrada.marcador) {
    enfocarMarcador(entrada.marcador);
  }
}

function agregarMarcador(entrada) {
  const { latitud, longitud } = entrada.ubicacion;
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    throw new Error("Las coordenadas de la sede no son válidas.");
  }

  const marcador = L.marker([latitud, longitud], {
    icon: crearIcono(),
    title: entrada.charla.titulo,
    alt: entrada.charla.titulo,
  }).addTo(mapa);

  marcador.bindPopup(crearContenidoDelPopup(entrada.charla));
  marcador.on("click", () => seleccionarCharla(entrada.charla.id, { desdeMapa: true }));
  entrada.marcador = marcador;

  if (entrada.charla.id === idSeleccionada) {
    marcarEntrada(entrada, true);
    enfocarMarcador(marcador);
  }
}

function encuadrarMarcadores() {
  const puntos = [...entradas.values()]
    .filter((entrada) => entrada.marcador)
    .map((entrada) => entrada.marcador.getLatLng());

  const yaEligioUnaCharla = entradas.get(idSeleccionada)?.marcador;
  if (puntos.length === 0 || yaEligioUnaCharla) {
    return;
  }
  mapa.fitBounds(L.latLngBounds(puntos), {
    padding: [60, 60],
    maxZoom: ZOOM_MAXIMO_AL_ENCUADRAR,
  });
}

function mostrarEstadoDelMapa(totalSinUbicar) {
  if (totalSinUbicar === 0) {
    estadoMapa.hidden = true;
    return;
  }
  estadoMapa.classList.add("estado-mapa--error");
  estadoMapa.textContent =
    totalSinUbicar === entradas.size
      ? "No pudimos ubicar ninguna charla en el mapa. Igual podés ver sus datos en la lista."
      : `No pudimos ubicar ${totalSinUbicar} charla(s) en el mapa. Igual podés ver sus datos en la lista.`;
}

async function ubicarCharlas() {
  const pedidos = new Map();
  const pedirUbicacion = (direccion) => {
    if (!pedidos.has(direccion)) {
      pedidos.set(direccion, obtenerUbicacionDeDireccion(direccion));
    }
    return pedidos.get(direccion);
  };

  let totalSinUbicar = 0;

  await Promise.all(
    [...entradas.values()].map(async (entrada) => {
      try {
        entrada.ubicacion = await pedirUbicacion(entrada.charla.sede.direccion);
        agregarMarcador(entrada);
      } catch (error) {
        totalSinUbicar += 1;
        entrada.nota.textContent = "No se pudo ubicar en el mapa.";
        entrada.nota.hidden = false;
      }
    })
  );

  encuadrarMarcadores();
  mostrarEstadoDelMapa(totalSinUbicar);
}

async function iniciarPantalla() {
  try {
    crearMapa();
    const charlas = await obtenerCharlas();

    if (charlas.length === 0) {
      estadoMapa.hidden = true;
      document.getElementById("mensaje-vacio").hidden = false;
      return;
    }

    for (const charla of charlas) {
      const entrada = crearEntradaDeCharla(charla);
      entradas.set(charla.id, entrada);
      listaCharlas.appendChild(entrada.item);
    }
    await ubicarCharlas();
  } catch (error) {
    estadoMapa.hidden = true;
    mostrarError(error.message);
  }
}

iniciarPantalla();
