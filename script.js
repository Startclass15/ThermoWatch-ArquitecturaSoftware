/* Patrón Observer: el sujeto notifica a los observadores suscritos. */
(() => {
  const UMBRAL_ALERTA = 30;

  // SUJETO: mantiene el estado y administra las suscripciones.
  class SensorTemperatura {
    constructor(temperaturaInicial) {
      this.temperatura = temperaturaInicial;
      this.observadores = [];
    }
    suscribir(observador) {
      if (!this.observadores.includes(observador)) this.observadores.push(observador);
    }
    cancelar(observador) {
      this.observadores = this.observadores.filter(item => item !== observador);
    }
    cambiarTemperatura(nuevaTemperatura) {
      if (nuevaTemperatura === this.temperatura) {
        mostrarToast("La temperatura no cambió; no se generó una notificación.");
        return false;
      }
      this.temperatura = nuevaTemperatura;
      // Se recorre una copia para evitar problemas si cambia la lista durante la notificación.
      [...this.observadores].forEach(observador => observador.actualizar(nuevaTemperatura));
      return true;
    }
    cantidadObservadores() { return this.observadores.length; }
  }

  const $ = id => document.getElementById(id);
  const estado = {
    notificaciones: 0,
    alertas: 0,
    historial: [],
    observadores: {}
  };

  // OBSERVADOR CONCRETO 1: actualiza la lectura visual.
  estado.observadores.display = {
    actualizar(temperatura) {
      $("temperatureValue").textContent = temperatura.toFixed(1);
      $("displayResult").textContent = `${temperatura.toFixed(1)} °C`;
      $("meterFill").style.width = `${(temperatura / 50) * 100}%`;
      $("temperatureMessage").textContent = temperatura > UMBRAL_ALERTA
        ? "Temperatura por encima del umbral recomendado."
        : "Temperatura dentro del rango esperado.";
      actualizarEstadoVisual(temperatura);
    }
  };

  // OBSERVADOR CONCRETO 2: revisa si debe mostrar una alerta.
  estado.observadores.alerts = {
    actualizar(temperatura) {
      if (temperatura > UMBRAL_ALERTA) {
        estado.alertas++;
        $("alertsResult").textContent = "¡Temperatura alta!";
        $("alertsResult").classList.add("alert-active");
        mostrarToast(`Alerta: temperatura alta (${temperatura} °C).`);
      } else {
        $("alertsResult").textContent = "Sin alertas";
        $("alertsResult").classList.remove("alert-active");
      }
      $("alertCount").textContent = estado.alertas;
    }
  };

  // OBSERVADOR CONCRETO 3: almacena cada temperatura recibida.
  estado.observadores.history = {
    actualizar(temperatura) {
      const fecha = new Date();
      estado.historial.unshift({
        hora: fecha.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        temperatura,
        estado: temperatura > UMBRAL_ALERTA ? "Alerta alta" : "Normal",
        alta: temperatura > UMBRAL_ALERTA
      });
      if (estado.historial.length > 30) estado.historial.pop();
      $("historyResult").textContent = `${estado.historial.length} ${estado.historial.length === 1 ? "evento" : "eventos"}`;
      renderizarHistorial();
    }
  };

  const sensor = new SensorTemperatura(24);
  Object.entries(estado.observadores).forEach(([id, observador]) => sensor.suscribir(observador));
  // El valor inicial también se refleja en los componentes una vez suscritos.
  Object.values(estado.observadores).forEach(observador => observador.actualizar(24));
  estado.historial = []; // El valor inicial no cuenta como evento de cambio.
  $("historyResult").textContent = "0 eventos";
  renderizarHistorial();

  function actualizarEstadoVisual(temperatura) {
    const pill = $("statusPill");
    pill.classList.remove("normal", "warning", "danger");
    if (temperatura > UMBRAL_ALERTA) {
      pill.classList.add("danger");
      pill.innerHTML = "<span></span> Alerta alta";
    } else if (temperatura >= 27) {
      pill.classList.add("warning");
      pill.innerHTML = "<span></span> Precaución";
    } else {
      pill.classList.add("normal");
      pill.innerHTML = "<span></span> Normal";
    }
  }

  function renderizarHistorial() {
    const tabla = $("historyTable");
    if (!estado.historial.length) {
      tabla.innerHTML = '<tr class="empty-row"><td colspan="4">Aún no hay eventos registrados por el observador.</td></tr>';
      return;
    }
    tabla.innerHTML = estado.historial.map(evento => `
      <tr>
        <td>${evento.hora}</td>
        <td>${evento.temperatura.toFixed(1)} °C</td>
        <td><span class="event-tag ${evento.alta ? "high" : ""}">${evento.estado}</span></td>
        <td>${evento.alta ? "Umbral superado" : "Cambio registrado"}</td>
      </tr>`).join("");
  }

  let toastTimer;
  function mostrarToast(mensaje) {
    const toast = $("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function actualizarContadores() {
    $("notificationCount").textContent = estado.notificaciones;
    $("observerCount").textContent = sensor.cantidadObservadores();
    $("activeObserverBadge").textContent = sensor.cantidadObservadores();
    $("lastUpdate").textContent = estado.ultimaActualizacion || "—";
  }

  function actualizarSuscripcionUI(id, activo) {
    const etiqueta = $(`${id}State`);
    const boton = document.querySelector(`[data-toggle-observer="${id}"]`);
    etiqueta.textContent = activo ? "SUSCRITO" : "CANCELADO";
    etiqueta.classList.toggle("active", activo);
    etiqueta.classList.toggle("inactive", !activo);
    boton.textContent = activo ? "Cancelar suscripción" : "Volver a suscribir";
    boton.classList.toggle("subscribe", !activo);
    document.querySelector(`[data-observer-card="${id}"]`).classList.toggle("unsubscribed", !activo);
  }

  function aplicarTemperatura(valor) {
    const nueva = Number(valor);
    $("temperatureRange").value = nueva;
    $("rangeValue").textContent = nueva;
    const cambio = sensor.cambiarTemperatura(nueva);
    if (cambio) {
      estado.notificaciones++;
      estado.ultimaActualizacion = new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      actualizarContadores();
      mostrarToast(`Cambio publicado: ${nueva} °C.`);
    }
  }

  $("temperatureRange").addEventListener("input", event => {
    $("rangeValue").textContent = event.target.value;
  });
  $("applyTemperature").addEventListener("click", () => aplicarTemperatura($("temperatureRange").value));
  document.querySelectorAll("[data-temp]").forEach(button => button.addEventListener("click", () => aplicarTemperatura(button.dataset.temp)));

  document.querySelectorAll("[data-toggle-observer]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.toggleObserver;
      const observador = estado.observadores[id];
      const activo = sensor.observadores.includes(observador);
      if (activo) sensor.cancelar(observador);
      else sensor.suscribir(observador);
      actualizarSuscripcionUI(id, !activo);
      actualizarContadores();
      mostrarToast(activo ? "Suscripción cancelada. El observador no recibirá nuevos cambios." : "Suscripción activada. El observador volverá a recibir cambios.");
    });
  });

  $("clearHistory").addEventListener("click", () => {
    estado.historial = [];
    $("historyResult").textContent = "0 eventos";
    renderizarHistorial();
    mostrarToast("Historial visual limpiado.");
  });

  $("resetDemo").addEventListener("click", () => {
    estado.notificaciones = 0;
    estado.alertas = 0;
    estado.historial = [];
    estado.ultimaActualizacion = "";
    sensor.temperatura = 24;
    Object.entries(estado.observadores).forEach(([id, observador]) => {
      sensor.cancelar(observador);
      sensor.suscribir(observador);
      actualizarSuscripcionUI(id, true);
    });
    $("temperatureRange").value = 24;
    $("rangeValue").textContent = "24";
    $("temperatureValue").textContent = "24.0";
    $("displayResult").textContent = "24.0 °C";
    $("alertsResult").textContent = "Sin alertas";
    $("alertsResult").classList.remove("alert-active");
    $("alertCount").textContent = "0";
    $("historyResult").textContent = "0 eventos";
    $("meterFill").style.width = "48%";
    $("temperatureMessage").textContent = "Temperatura dentro del rango esperado.";
    actualizarEstadoVisual(24);
    renderizarHistorial();
    actualizarContadores();
    mostrarToast("Demostración reiniciada; los tres observadores están suscritos.");
  });

  $("themeButton").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    mostrarToast(document.body.classList.contains("dark") ? "Tema oscuro activado." : "Tema claro activado.");
  });

  actualizarContadores();
})();
