function completarDato(idElemento, valor) {
  document.getElementById(idElemento).textContent = valor ?? "";
}

async function iniciarDetalle() {
  try {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const charla = await buscarCharlaPorId(id);

    if (!charla) {
      throw new Error("No encontramos la charla que buscás.");
    }

    completarDato("charla-titulo", charla.titulo);
    completarDato("charla-tema", charla.tema);
    completarDato("charla-disertante", charla.disertante);
    completarDato("charla-fecha-hora", charla.fechaHora);
    completarDato("charla-sede-nombre", charla.sede?.nombre);
    completarDato("charla-sede-direccion", charla.sede?.direccion);
    document.getElementById("detalle-charla").hidden = false;
  } catch (error) {
    mostrarError(error.message);
  }
}

iniciarDetalle();
