/* =========================================================
   TOMO NEÓN · Lógica de la tienda
   ========================================================= */

/* ---------- 1. Datos del catálogo ----------
   Para usar una imagen real de portada, agrega la propiedad img:
   { id: 1, ..., img: "imagenes/one-piece.jpg" }
   Sin img, se dibuja una portada con el color (hue) indicado. */
const MANGAS = [
  { id: 1,  titulo: "One Piece, Vol. 1",        autor: "Eiichiro Oda",      genero: "Aventura", precio: 42900, hue: 200 },
  { id: 2,  titulo: "Naruto, Vol. 1",           autor: "Masashi Kishimoto", genero: "Shonen",   precio: 39900, hue: 28  },
  { id: 3,  titulo: "Berserk, Vol. 1",          autor: "Kentaro Miura",     genero: "Seinen",   precio: 54900, hue: 350 },
  { id: 4,  titulo: "Death Note, Vol. 1",       autor: "Tsugumi Ohba",      genero: "Misterio", precio: 41900, hue: 275 },
  { id: 5,  titulo: "Attack on Titan, Vol. 1",  autor: "Hajime Isayama",    genero: "Acción",   precio: 44900, hue: 150 },
  { id: 6,  titulo: "Fullmetal Alchemist, Vol. 1", autor: "Hiromu Arakawa", genero: "Aventura", precio: 43900, hue: 45  },
  { id: 7,  titulo: "Chainsaw Man, Vol. 1",     autor: "Tatsuki Fujimoto",  genero: "Acción",   precio: 46900, hue: 10  },
  { id: 8,  titulo: "Jujutsu Kaisen, Vol. 1",   autor: "Gege Akutami",      genero: "Shonen",   precio: 45900, hue: 245 },
  { id: 9,  titulo: "Vagabond, Vol. 1",         autor: "Takehiko Inoue",    genero: "Seinen",   precio: 52900, hue: 320 },
  { id: 10, titulo: "Dragon Ball, Vol. 1",      autor: "Akira Toriyama",    genero: "Aventura", precio: 38900, hue: 60  },
  { id: 11, titulo: "Spy x Family, Vol. 1",     autor: "Tatsuya Endo",      genero: "Comedia",  precio: 43900, hue: 170 },
  { id: 12, titulo: "Frieren, Vol. 1",          autor: "Kanehito Yamada",   genero: "Fantasía", precio: 47900, hue: 215 }
];

/* ---------- 2. Utilidades ---------- */

// Formato de precio en pesos colombianos
const COP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0
});

// Atajo para seleccionar elementos por id
const $ = (id) => document.getElementById(id);

// Guardar y leer del navegador (con protección por si no está disponible)
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
}
function leer(clave, porDefecto) {
  try {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : porDefecto;
  } catch (e) { return porDefecto; }
}

// Quita tildes y pasa a minúsculas para que "accion" encuentre "Acción"
const normalizar = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ---------- 3. Estado ---------- */
let carrito = leer("tomoneon-carrito", {});   // { idManga: cantidad }
let filtro = { texto: "", genero: "Todos" };

/* ---------- 4. Portada (imagen o diseño CSS) ---------- */
function crearPortada(manga, conTexto = true) {
  const div = document.createElement("div");
  div.className = "portada";
  div.style.setProperty("--h", manga.hue);

  // Texto de la portada de colores (se usa si no se encuentra la imagen)
  const ponerTexto = () => {
    if (!conTexto) return;
    const titulo = document.createElement("b");
    titulo.textContent = manga.titulo.split(",")[0];   // "One Piece"
    const vol = document.createElement("small");
    vol.textContent = manga.titulo.split(", ")[1] || "";
    div.append(titulo, vol);
  };

  // Busca la imagen en manga.img o, si no existe, en imagenes/<id>.jpg
  const img = document.createElement("img");
  img.src = manga.img || "imagenes/" + manga.id + ".jpg";
  img.alt = "Portada de " + manga.titulo;
  img.loading = "lazy";
  // Si la imagen no existe, se muestra la portada de colores
  img.addEventListener("error", () => { img.remove(); ponerTexto(); });
  div.appendChild(img);
  return div;
}

/* ---------- 5. Catálogo ---------- */
function mangasFiltrados() {
  const q = normalizar(filtro.texto.trim());
  return MANGAS.filter((m) => {
    const coincideGenero = filtro.genero === "Todos" || m.genero === filtro.genero;
    const coincideTexto = !q || normalizar(m.titulo + " " + m.autor).includes(q);
    return coincideGenero && coincideTexto;
  });
}

function renderCatalogo() {
  const grid = $("grid");
  const lista = mangasFiltrados();
  grid.innerHTML = "";

  $("resultado").textContent =
    lista.length === 1 ? "1 manga encontrado" : lista.length + " mangas encontrados";

  // Estado vacío: explica qué pasó y qué hacer
  if (lista.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "vacio";
    vacio.innerHTML = "<p>No hay mangas con esa búsqueda. Prueba con otro título o quita el filtro.</p>";
    const btn = document.createElement("button");
    btn.className = "btn btn-primario";
    btn.type = "button";
    btn.textContent = "Ver todos los mangas";
    btn.addEventListener("click", reiniciarFiltros);
    vacio.appendChild(btn);
    grid.appendChild(vacio);
    return;
  }

  lista.forEach((m) => {
    const card = document.createElement("article");
    card.className = "card";

    const titulo = document.createElement("h3");
    titulo.textContent = m.titulo;
    const autor = document.createElement("p");
    autor.className = "autor";
    autor.textContent = m.autor;
    const genero = document.createElement("span");
    genero.className = "genero";
    genero.textContent = m.genero;

    const fila = document.createElement("div");
    fila.className = "fila";
    const precio = document.createElement("span");
    precio.className = "precio";
    precio.textContent = COP.format(m.precio);
    const btn = document.createElement("button");
    btn.className = "btn btn-primario";
    btn.type = "button";
    btn.textContent = "Agregar";
    btn.setAttribute("aria-label", "Agregar " + m.titulo + " al carrito");
    btn.addEventListener("click", () => agregar(m.id));
    fila.append(precio, btn);

    card.append(crearPortada(m), titulo, autor, genero, fila);
    grid.appendChild(card);
  });
}

/* ---------- 6. Filtros por género ---------- */
function renderFiltros() {
  const cont = $("filtros");
  const generos = ["Todos", ...new Set(MANGAS.map((m) => m.genero))];
  cont.innerHTML = "";

  generos.forEach((g) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = g;
    chip.setAttribute("aria-pressed", String(g === filtro.genero));
    chip.addEventListener("click", () => {
      filtro.genero = g;
      renderFiltros();
      renderCatalogo();
    });
    cont.appendChild(chip);
  });
}

function reiniciarFiltros() {
  filtro = { texto: "", genero: "Todos" };
  $("buscador").value = "";
  renderFiltros();
  renderCatalogo();
}

/* ---------- 7. Carrito ---------- */
function agregar(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  guardar("tomoneon-carrito", carrito);
  renderCarrito();
  const manga = MANGAS.find((m) => m.id === id);
  mostrarToast("Agregado: " + manga.titulo);

  // Pequeña animación en el contador
  const c = $("contador");
  c.classList.remove("pulso");
  void c.offsetWidth;            // reinicia la animación
  c.classList.add("pulso");
}

function cambiarCantidad(id, delta) {
  carrito[id] = (carrito[id] || 0) + delta;
  if (carrito[id] <= 0) delete carrito[id];
  guardar("tomoneon-carrito", carrito);
  renderCarrito();
}

function quitar(id) {
  delete carrito[id];
  guardar("tomoneon-carrito", carrito);
  renderCarrito();
}

function vaciar() {
  carrito = {};
  guardar("tomoneon-carrito", carrito);
  renderCarrito();
}

function renderCarrito() {
  const lista = $("lista-carrito");
  lista.innerHTML = "";

  const ids = Object.keys(carrito).map(Number);
  let total = 0;
  let cantidadTotal = 0;

  if (ids.length === 0) {
    lista.innerHTML = '<li class="vacio">Tu carrito está vacío. Agrega un manga desde el catálogo.</li>';
  }

  ids.forEach((id) => {
    const m = MANGAS.find((x) => x.id === id);
    if (!m) return;                       // por si cambió el catálogo
    const cant = carrito[id];
    total += m.precio * cant;
    cantidadTotal += cant;

    const li = document.createElement("li");
    li.className = "item";

    const info = document.createElement("div");
    const nombre = document.createElement("h3");
    nombre.textContent = m.titulo;
    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = COP.format(m.precio) + " c/u";

    const controles = document.createElement("div");
    controles.className = "controles";
    const menos = document.createElement("button");
    menos.type = "button"; menos.textContent = "−";
    menos.setAttribute("aria-label", "Quitar una unidad de " + m.titulo);
    menos.addEventListener("click", () => cambiarCantidad(id, -1));
    const num = document.createElement("span");
    num.textContent = cant;
    const mas = document.createElement("button");
    mas.type = "button"; mas.textContent = "+";
    mas.setAttribute("aria-label", "Agregar una unidad de " + m.titulo);
    mas.addEventListener("click", () => cambiarCantidad(id, 1));
    const borrar = document.createElement("button");
    borrar.type = "button"; borrar.className = "quitar"; borrar.textContent = "Quitar";
    borrar.addEventListener("click", () => quitar(id));
    controles.append(menos, num, mas, borrar);

    info.append(nombre, precio, controles);
    li.append(crearPortada(m, false), info);
    lista.appendChild(li);
  });

  $("total").textContent = COP.format(total);
  $("contador").textContent = cantidadTotal;
  $("btn-pagar").disabled = cantidadTotal === 0;
  $("btn-vaciar").hidden = cantidadTotal === 0;
}

/* Abrir y cerrar el panel del carrito */
function abrirCarrito() {
  $("carrito").classList.add("abierto");
  $("carrito").setAttribute("aria-hidden", "false");
  $("overlay").hidden = false;
  $("cerrar-carrito").focus();
}
function cerrarCarrito() {
  $("carrito").classList.remove("abierto");
  $("carrito").setAttribute("aria-hidden", "true");
  $("overlay").hidden = true;
  $("btn-carrito").focus();
}

/* Finalizar compra (simulado: aquí conectarías tu pasarela de pago) */
function finalizarCompra() {
  vaciar();
  cerrarCarrito();
  mostrarToast("Compra simulada. Aquí conectarías tu pasarela de pago.");
}

/* ---------- 8. Mensajes breves ---------- */
let temporizadorToast;
function mostrarToast(mensaje) {
  const t = $("toast");
  t.textContent = mensaje;
  t.classList.add("visible");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => t.classList.remove("visible"), 2200);
}

/* ---------- 9. Modo oscuro / claro ---------- */
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  $("btn-tema").setAttribute(
    "aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
  );
  guardar("tomoneon-tema", tema);
}

/* ---------- 10. Inicio ---------- */
function iniciar() {
  // Tema guardado (oscuro por defecto)
  aplicarTema(leer("tomoneon-tema", "dark"));

  renderFiltros();
  renderCatalogo();
  renderCarrito();

  // Eventos
  $("buscador").addEventListener("input", (e) => {
    filtro.texto = e.target.value;
    renderCatalogo();
  });
  $("btn-tema").addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme");
    aplicarTema(actual === "dark" ? "light" : "dark");
  });
  $("btn-carrito").addEventListener("click", abrirCarrito);
  $("cerrar-carrito").addEventListener("click", cerrarCarrito);
  $("overlay").addEventListener("click", cerrarCarrito);
  $("btn-vaciar").addEventListener("click", vaciar);
  $("btn-pagar").addEventListener("click", finalizarCompra);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("carrito").classList.contains("abierto")) cerrarCarrito();
  });
}

document.addEventListener("DOMContentLoaded", iniciar);
