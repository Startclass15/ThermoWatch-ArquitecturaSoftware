# ThermoWatch — Sistema de monitoreo de temperatura

Aplicación web demostrativa del patrón de diseño **Observer**, hecha con HTML, CSS y JavaScript puro. Está preparada para publicarse en **GitHub Pages**: no necesita servidor, base de datos, instalación ni claves API.

## Funcionalidades

- Simulación interactiva de temperatura entre 0 °C y 50 °C.
- Tres observadores independientes:
  - **Observador visual:** actualiza la lectura del panel.
  - **Observador de alertas:** genera una alerta cuando la temperatura supera 30 °C.
  - **Observador de historial:** registra los cambios que recibe.
- Suscripción y cancelación dinámica de cada observador.
- Contadores de notificaciones, observadores activos y alertas.
- Historial de eventos y opción para limpiarlo.
- Modo claro/oscuro y reinicio de la demostración.
- Diseño adaptable a móviles y computadoras.

> **Importante:** la temperatura se simula en el navegador. Este proyecto no mide temperatura física ni envía notificaciones reales a dispositivos externos.


## ¿Dónde se aplica Observer?

En `script.js`:

- `SensorTemperatura` es el **sujeto**: mantiene la temperatura y gestiona las suscripciones.
- `suscribir()` incorpora un observador.
- `cancelar()` retira un observador.
- `cambiarTemperatura()` modifica el estado y notifica a los observadores registrados.
- Los objetos `display`, `alerts` e `history` son los **observadores concretos**. Cada uno implementa su propio método `actualizar()`.

El sujeto no necesita conocer los detalles internos de las reacciones. Solo recorre la lista de suscriptores y llama a `actualizar()`.



## Tecnologías

HTML5 · CSS3 · JavaScript ES6 · GitHub Pages


