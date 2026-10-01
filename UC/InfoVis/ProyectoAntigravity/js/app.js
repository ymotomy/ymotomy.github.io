// ==========================================================================
// APP PRINCIPAL Y COORDINADOR DE VISTAS ENLAZADAS (COORDINATED MULTIPLE VIEWS)
// Catálogo Messier - ProyectoAntigravity
// ==========================================================================

(function () {
  // Paleta oficial de colores por tipo celeste
  const categoryColors = {
    Galaxy: "#f72585",
    "Globular Cluster": "#00f0ff",
    "Open Cluster": "#4dff88",
    Nebula: "#ff5436",
    "Double star": "#ffd700",
    all: "#ffffff"
  };

  const typeLabelsEs = {
    Galaxy: "Galaxia",
    "Globular Cluster": "Cúmulo Globular",
    "Open Cluster": "Cúmulo Abierto",
    Nebula: "Nebulosa",
    "Double star": "Estrella Doble",
    all: "Todos"
  };

  // Estado global
  const state = {
    activeCategory: "all",
    activeObject: null,

    getColor: (type) => categoryColors[type] || "#ffffff",
    getTypeLabel: (type) => typeLabelsEs[type] || type,

    setActiveCategory: (cat) => {
      state.activeCategory = cat;

      // Actualizar botones en barra superior
      d3.selectAll(".filter-pill").classed("active", false);
      d3.select(`.filter-pill[data-type="${cat}"]`).classed("active", true);

      // Notificar a las 3 visualizaciones y al explorador
      const objId = state.activeObject ? state.activeObject.id : null;
      if (window.Vis1) window.Vis1.highlight(cat, objId);
      if (window.Vis2) window.Vis2.highlight(cat, objId);
      if (window.Vis3) window.Vis3.highlight(cat, objId);
      if (window.Explorer) window.Explorer.updateCategory(cat);
    },

    setActiveObject: (obj) => {
      state.activeObject = obj;
      const objId = obj ? obj.id : null;

      if (window.Vis1) window.Vis1.highlight(state.activeCategory, objId);
      if (window.Vis2) window.Vis2.highlight(state.activeCategory, objId);
      if (window.Vis3) window.Vis3.highlight(state.activeCategory, objId);

      // Resaltar en mosaico
      d3.selectAll(".mosaic-card").classed("active-selected", false);
      if (objId) {
        d3.select(`.mosaic-card-${objId}`).classed("active-selected", true);
      }
    },

    openModal: (mId) => {
      const d = window.MESSIER_DATA.find(x => x.id === mId);
      if (!d) return;

      const typeColor = state.getColor(d.type);
      const moonComparisonText = d.moonRatio >= 1
        ? `Aproximadamente <strong>${d.moonRatio} veces</strong> el diámetro de la Luna Llena vista desde la Tierra.`
        : `Aproximadamente el <strong>${Math.round(d.moonRatio * 100)}%</strong> del diámetro de la Luna Llena.`;

      // Descripción astronómica enriquecida
      const narrative = getNarrativeForObject(d);

      d3.select("#modal-object-img").attr("src", d.image).attr("alt", `${d.id} - ${d.nameEs}`);
      d3.select("#modal-title").text(`${d.id}: ${d.nameEs}`);
      d3.select("#modal-subtitle").html(`
        <span style="display:inline-block; padding:3px 10px; border-radius:999px; background:${typeColor}22; color:${typeColor}; border:1px solid ${typeColor}66; font-size:0.8rem; font-weight:700; text-transform:uppercase; margin-right:8px;">
          ${d.typeEs} (${d.subType})
        </span>
        ${d.name ? `<em>"${d.name}"</em> · ` : ''}${d.ngc}
      `);

      d3.select("#modal-stats-container").html(`
        <div class="modal-stat-box">
          <div class="modal-stat-label">Distancia</div>
          <div class="modal-stat-val">${d.distance >= 1000000 ? (d.distance / 1000000).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + 'M al' : d.distance.toLocaleString('es-ES') + ' al'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">La luz tardó ${d.distance.toLocaleString('es-ES')} años</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-label">Constelación</div>
          <div class="modal-stat-val">${d.constellationEs}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${d.constellation}</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-label">Magnitud Aparente</div>
          <div class="modal-stat-val">Mag ${d.magnitude}</div>
          <div style="font-size:0.75rem; color:#38bdf8;">${d.visLevel}</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-label">Diámetro Angular</div>
          <div class="modal-stat-val">${d.diameterArcmin}' de arco</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${d.moonRatio}x Luna Llena</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-label">Año de Descubrimiento</div>
          <div class="modal-stat-val">${d.yearOriginal}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${d.isAncient ? 'Conocido desde la Antigüedad' : 'Era telescópica'}</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-label">Descubridor</div>
          <div class="modal-stat-val">${d.discoverer}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Astrónomo histórico</div>
        </div>
      `);

      d3.select("#modal-narrative-text").html(`
        <p><strong>Observación astronómica:</strong> ${d.visibility}.</p>
        <p style="margin-top:8px;"><strong>Escala en el firmamento:</strong> ${moonComparisonText}</p>
        <p style="margin-top:8px;">${narrative}</p>
      `);

      // Configurar botones de salto a visualizaciones
      d3.select("#btn-modal-jump-vis1").on("click", () => {
        closeModal();
        const el = document.getElementById("section-vis1");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        if (window.Vis1) window.Vis1.selectObject(d.id);
      });

      d3.select("#btn-modal-jump-vis3").on("click", () => {
        closeModal();
        const el = document.getElementById("section-vis3");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        state.setActiveObject(d);
      });

      d3.select("#modal-overlay").classed("open", true);
      document.body.style.overflow = "hidden";
    },

    closeModal: () => {
      d3.select("#modal-overlay").classed("open", false);
      document.body.style.overflow = "auto";
    },

    showTooltip: (event, d) => {
      const tooltip = d3.select("#custom-tooltip");
      const typeColor = state.getColor(d.type);

      tooltip.html(`
        <div class="tooltip-header">
          <img src="${d.image}" class="tooltip-img" alt="${d.id}">
          <div>
            <div class="tooltip-title">${d.id}: ${d.nameEs}</div>
            <div class="tooltip-subtitle" style="color: ${typeColor};">${d.typeEs} · ${d.constellationEs}</div>
          </div>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Distancia:</span>
          <span class="tooltip-val">${d.distance >= 1000000 ? (d.distance / 1000000).toFixed(2) + 'M al' : d.distance.toLocaleString('es-ES') + ' al'}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Magnitud:</span>
          <span class="tooltip-val">${d.magnitude} (${d.visLevel})</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Tamaño angular:</span>
          <span class="tooltip-val">${d.diameterArcmin}'</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Descubridor:</span>
          <span class="tooltip-val">${d.yearOriginal} (${d.discoverer})</span>
        </div>
        <div style="font-size:0.75rem; color:#38bdf8; margin-top:6px; text-align:center;">
          ✦ Clic para seleccionar o inspeccionar ✦
        </div>
      `);
      tooltip.style("display", "block");
      state.updateTooltipPosition(event);
    },

    updateTooltipPosition: (event) => {
      const tooltip = d3.select("#custom-tooltip");
      const pad = 16;
      let left = event.clientX + pad;
      let top = event.clientY + pad;

      const node = tooltip.node();
      if (node) {
        const rect = node.getBoundingClientRect();
        if (left + rect.width > window.innerWidth - 10) {
          left = event.clientX - rect.width - pad;
        }
        if (top + rect.height > window.innerHeight - 10) {
          top = event.clientY - rect.height - pad;
        }
      }

      tooltip.style("left", `${Math.max(10, left)}px`).style("top", `${Math.max(10, top)}px`);
    },

    hideTooltip: () => {
      d3.select("#custom-tooltip").style("display", "none");
    }
  };

  function closeModal() {
    state.closeModal();
  }

  // Generador de narrativa astronómica educativa
  function getNarrativeForObject(d) {
    if (d.id === "M1") {
      return "Es el remanente de una supernova que explotó en el año 1054 d.C., registrada por astrónomos chinos y árabes. En su núcleo gira un púlsar (estrella de neutrones) que rota 30 veces por segundo.";
    }
    if (d.id === "M31") {
      return "La majestuosa Galaxia de Andrómeda es la galaxia espiral más cercana a la Vía Láctea. Contiene aproximadamente un billón de estrellas y se acerca a nuestra galaxia a unos 110 km/s.";
    }
    if (d.id === "M42") {
      return "La Gran Nebulosa de Orión es un gigantesco vivero estelar donde se están formando activamente nuevas estrellas y sistemas planetarios a partir de gas y polvo cósmico.";
    }
    if (d.id === "M45") {
      return "Las Pléyades son un deslumbrante cúmulo estelar abierto formado por jóvenes estrellas azules masivas nacidas hace unos 100 millones de años, envueltas en una tenue nebulosa de reflexión.";
    }
    if (d.id === "M51") {
      return "La Galaxia del Remolino es una de las espirales mejor definidas del firmamento. Muestra una espectacular interacción gravitacional con su vecina galaxia enana NGC 5195.";
    }
    if (d.id === "M57") {
      return "La Nebulosa del Anillo es una nebulosa planetaria originada por una estrella similar a nuestro Sol que expulsó sus capas externas en las etapas finales de su evolución estelar.";
    }
    if (d.id === "M87") {
      return "Una galaxia elíptica supermasiva en el centro del Cúmulo de Virgo. En 2019, el Event Horizon Telescope obtuvo aquí la histórica primera imagen directa de un agujero negro supermasivo (M87*).";
    }
    if (d.id === "M104") {
      return "La Galaxia del Sombrero posee un brillante núcleo central con un bulbo inusualmente grande y un prominente anillo de polvo oscuro que le otorga su icónica silueta.";
    }

    if (d.type === "Galaxy") {
      return `Esta lejana isla cósmica está compuesta por decenas o cientos de miles de millones de estrellas situadas a millones de años luz en el universo profundo.`;
    } else if (d.type === "Globular Cluster") {
      return `Los cúmulos globulares son antiguas esferas compactas de cientos de miles de estrellas viejas que orbitan el halo de nuestra Vía Láctea desde los albores del universo.`;
    } else if (d.type === "Open Cluster") {
      return `Los cúmulos abiertos son agrupaciones jóvenes de estrellas nacidas de la misma nube molecular, aún vinculadas gravitatoriamente dentro del disco de la Vía Láctea.`;
    } else if (d.type === "Nebula") {
      return `Nube interestelar de gas ionizado y polvo estelar donde nacen nuevas estrellas o se expanden los restos de estrellas extintas.`;
    } else {
      return `Sistema estelar o asterismo que Charles Messier catalogó originalmente creyendo que se trataba de un objeto difuso.`;
    }
  }

  // Fondo estelar interactivo en Canvas
  function initStarfield() {
    const canvas = document.getElementById("starfield-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let stars = [];
    const numStars = 260;
    let width, height;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    window.addEventListener("resize", resize);
    resize();

    // Estrellas fugaces ocasionales
    let shootingStar = null;
    function spawnShootingStar() {
      if (Math.random() < 0.008 && !shootingStar) {
        shootingStar = {
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          len: Math.random() * 120 + 80,
          speed: Math.random() * 12 + 10,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2,
          alpha: 1
        };
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas titilantes
      stars.forEach(s => {
        s.phase += s.speed;
        const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = "#00f0ff";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Dibujar estrella fugaz si existe
      if (shootingStar) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.len;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.len;

        const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(1, `rgba(0, 240, 255, ${shootingStar.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.02;

        if (shootingStar.alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar = null;
        }
      }

      spawnShootingStar();
      requestAnimationFrame(animate);
    }

    animate();
  }

  // Barra de búsqueda global y autocompletado
  function setupGlobalSearch() {
    const input = document.getElementById("global-search-input");
    const list = document.getElementById("search-autocomplete-list");
    if (!input || !list) return;

    input.addEventListener("input", function () {
      const q = this.value.trim().toLowerCase();
      if (!q) {
        list.style.display = "none";
        list.innerHTML = "";
        if (window.Explorer) window.Explorer.updateSearch("");
        return;
      }

      if (window.Explorer) window.Explorer.updateSearch(q);

      const matches = window.MESSIER_DATA.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.nameEs.toLowerCase().includes(q) ||
        d.ngc.toLowerCase().includes(q) ||
        d.constellationEs.toLowerCase().includes(q) ||
        d.discoverer.toLowerCase().includes(q)
      ).slice(0, 8);

      if (matches.length === 0) {
        list.innerHTML = `<div style="padding:12px; font-size:0.85rem; color:var(--text-muted); text-align:center;">No hay coincidencias para "${q}"</div>`;
        list.style.display = "block";
        return;
      }

      list.innerHTML = matches.map(d => `
        <div class="search-item" data-id="${d.id}">
          <img src="${d.image}" class="search-thumb" alt="${d.id}">
          <div style="flex:1;">
            <div style="font-weight:700; color:#fff; font-size:0.95rem;">${d.id}: ${d.nameEs}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${d.typeEs} · ${d.constellationEs}</div>
          </div>
          <span style="font-size:0.75rem; color:var(--text-accent); font-weight:600;">${d.distance >= 1000000 ? (d.distance / 1000000).toFixed(1) + 'M al' : d.distance.toLocaleString('es-ES') + ' al'}</span>
        </div>
      `).join("");

      list.style.display = "block";

      list.querySelectorAll(".search-item").forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-id");
          const target = window.MESSIER_DATA.find(x => x.id === id);
          if (target) {
            state.setActiveObject(target);
            state.openModal(target.id);
            input.value = `${target.id}: ${target.nameEs}`;
          }
          list.style.display = "none";
        });
      });
    });

    // Cerrar lista al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.style.display = "none";
      }
    });
  }

  // Filtros globales por categoría
  function setupCategoryFilters() {
    d3.selectAll(".filter-pill").on("click", function () {
      const type = d3.select(this).attr("data-type");
      state.setActiveCategory(type);
    });
  }

  // Configurar Modal
  function setupModalEvents() {
    d3.select("#modal-close-btn").on("click", closeModal);
    d3.select("#modal-overlay").on("click", function (event) {
      if (event.target === this) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // Inicialización de la aplicación
  function start() {
    initStarfield();
    setupGlobalSearch();
    setupCategoryFilters();
    setupModalEvents();

    const initializeViews = () => {
      if (window.Vis1) window.Vis1.init();
      if (window.Vis2) window.Vis2.init();
      if (window.Vis3) window.Vis3.init();
      if (window.Explorer) window.Explorer.init();
    };

    if (window.MESSIER_DATA_READY) {
      window.MESSIER_DATA_READY.then(rows => {
        if (rows.length) initializeViews();
      });
    } else if (window.MESSIER_DATA) {
      initializeViews();
    }
  }

  window.APP_STATE = state;
  window.addEventListener("DOMContentLoaded", start);
})();
