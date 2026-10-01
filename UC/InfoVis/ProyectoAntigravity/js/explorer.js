// ==========================================================================
// SECCIÓN 4: MOSAICO Y EXPLORADOR DE LOS 110 OBJETOS MESSIER
// Catálogo Messier - ProyectoAntigravity
// ==========================================================================

(function () {
  const containerId = "#mosaic-grid";
  let sortMode = "number";
  let searchTerm = "";
  let activeCategory = "all";

  function init() {
    render();
    setupControls();
  }

  function render() {
    const container = d3.select(containerId);
    let data = [...window.MESSIER_DATA];

    // Filtrar por categoría
    if (activeCategory !== "all") {
      data = data.filter(d => d.type === activeCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.nameEs.toLowerCase().includes(q) ||
        d.ngc.toLowerCase().includes(q) ||
        d.constellationEs.toLowerCase().includes(q) ||
        d.discoverer.toLowerCase().includes(q)
      );
    }

    // Ordenar
    if (sortMode === "number") {
      data.sort((a, b) => a.number - b.number);
    } else if (sortMode === "distance-asc") {
      data.sort((a, b) => a.distance - b.distance);
    } else if (sortMode === "distance-desc") {
      data.sort((a, b) => b.distance - a.distance);
    } else if (sortMode === "magnitude-asc") {
      data.sort((a, b) => a.magnitude - b.magnitude);
    } else if (sortMode === "size-desc") {
      data.sort((a, b) => b.radiusArcmin - a.radiusArcmin);
    } else if (sortMode === "year-asc") {
      data.sort((a, b) => a.year - b.year);
    }

    // Actualizar contador
    d3.select("#mosaic-counter-label").text(`Mostrando ${data.length} de 110 objetos celestes`);

    container.html("");

    if (data.length === 0) {
      container.html(`
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
          <p>No se encontraron objetos Messier que coincidan con los filtros seleccionados.</p>
        </div>
      `);
      return;
    }

    data.forEach(d => {
      const typeColor = window.APP_STATE.getColor(d.type);

      const card = container.append("div")
        .attr("class", `mosaic-card mosaic-card-${d.id}`)
        .on("click", () => {
          window.APP_STATE.setActiveObject(d);
          window.APP_STATE.openModal(d.id);
        });

      card.html(`
        <div class="mosaic-thumb-wrap">
          <img src="${d.image}" alt="${d.id} - ${d.nameEs}" loading="lazy">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span class="mosaic-m-id">${d.id}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${d.ngc}</span>
        </div>
        <div class="mosaic-common-name" title="${d.nameEs}">${d.nameEs}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 6px;">
          <span class="mosaic-meta-tag" style="background: ${typeColor}22; color: ${typeColor}; border: 1px solid ${typeColor}55;">
            ${d.typeEs}
          </span>
          <span style="font-size: 0.75rem; font-weight: 600; color: #fff;">
            ${formatDistanceBrief(d.distance)}
          </span>
        </div>
      `);
    });
  }

  function formatDistanceBrief(d) {
    if (d >= 1000000) return (d / 1000000).toFixed(1) + "M al";
    if (d >= 1000) return (d / 1000).toFixed(1) + "k al";
    return d + " al";
  }

  function setupControls() {
    d3.select("#mosaic-sort-select").on("change", function () {
      sortMode = this.value;
      render();
    });
  }

  function updateSearch(term) {
    searchTerm = term;
    render();
  }

  function updateCategory(cat) {
    activeCategory = cat;
    render();
  }

  window.Explorer = {
    init,
    render,
    updateSearch,
    updateCategory
  };
})();
