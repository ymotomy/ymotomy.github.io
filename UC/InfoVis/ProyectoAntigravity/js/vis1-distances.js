// ==========================================================================
// VISUALIZACIÓN 1: DISTANCIAS CÓSMICAS RESPECTO A LA TIERRA
// Catálogo Messier - ProyectoAntigravity
// ==========================================================================

(function () {
  const containerId = "#vis-1";
  let svg, gTrack, gZones, gGrid, gEarth, gObjects, gLaser, gAxis;
  let width, height;
  let zoomBehavior;
  let currentTransform = d3.zoomIdentity;
  let currentLayoutMode = "cosmic"; // 'cosmic' (beeswarm) o 'lanes' (carriles por tipo)
  let scaleX, axisX;

  const margin = { top: 75, right: 60, bottom: 65, left: 90 };
  const baseWidth = 1000;
  const baseHeight = 480;

  // Bandas cósmicas
  const cosmicZones = [
    { name: "Vecindad Solar", min: 400, max: 1000, color: "rgba(255, 215, 0, 0.08)", label: "Vecindad Solar (<1k al)" },
    { name: "Vía Láctea", min: 1000, max: 100000, color: "rgba(0, 240, 255, 0.07)", label: "Vía Láctea (Nuestra Galaxia)" },
    { name: "Vacío Intergaláctico", min: 100000, max: 2000000, color: "rgba(255, 255, 255, 0.02)", label: "Vacío Intergaláctico" },
    { name: "Grupo Local", min: 2000000, max: 3500000, color: "rgba(247, 37, 133, 0.09)", label: "Grupo Local (Andrómeda / Triángulo)" },
    { name: "Cúmulo de Virgo", min: 8000000, max: 65000000, color: "rgba(114, 9, 183, 0.12)", label: "Supercúmulo de Virgo (Universo Profundo)" }
  ];

  // Carriles por categoría (para el modo 'lanes')
  const laneCategories = ["Galaxy", "Globular Cluster", "Open Cluster", "Nebula", "Double star"];
  const laneYMap = {};

  function init() {
    const container = d3.select(containerId);
    container.html(""); // Limpiar

    width = baseWidth;
    height = baseHeight;

    // Calcular alturas de carriles
    const usableHeight = height - margin.top - margin.bottom;
    const laneHeight = usableHeight / laneCategories.length;
    laneCategories.forEach((cat, i) => {
      laneYMap[cat] = margin.top + laneHeight * (i + 0.5);
    });

    svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "vis1-svg");

    // Definiciones (filtros de brillo, patrones)
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow-filter")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Patrones circulares para cada objeto M
    window.MESSIER_DATA.forEach(d => {
      defs.append("pattern")
        .attr("id", `pattern-${d.id}`)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("href", d.image)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("width", 1)
        .attr("height", 1);
    });

    // Grupos en orden de profundidad
    gZones = svg.append("g").attr("class", "g-zones");
    gGrid = svg.append("g").attr("class", "g-grid");
    gAxis = svg.append("g").attr("class", "g-axis");
    gTrack = svg.append("g").attr("class", "g-track");
    gLaser = svg.append("g").attr("class", "g-laser");
    gObjects = svg.append("g").attr("class", "g-objects");
    gEarth = svg.append("g").attr("class", "g-earth");

    // Configuración de escalas
    scaleX = d3.scaleLog()
      .domain([350, 70000000])
      .range([margin.left, width - margin.right]);

    axisX = d3.axisBottom(scaleX)
      .ticks(10, d => formatDistanceTick(d))
      .tickSizeInner(-(height - margin.top - margin.bottom))
      .tickPadding(12);

    // Zoom behavior
    zoomBehavior = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", onZoom);

    svg.call(zoomBehavior);

    renderBase();
    renderObjects();
    setupControls();
  }

  function formatDistanceTick(d) {
    if (d >= 1000000) return (d / 1000000) + "M al";
    if (d >= 1000) return (d / 1000) + "k al";
    return d + " al";
  }

  function formatFullDistance(d) {
    if (d >= 1000000) return (d / 1000000).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + " millones de años luz";
    return d.toLocaleString('es-ES') + " años luz";
  }

  function renderBase() {
    const usableHeight = height - margin.top - margin.bottom;

    // Eje X
    gAxis.attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(axisX)
      .selectAll("line")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-dasharray", "3 4");

    gAxis.selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", "11px");

    // Etiqueta del Eje
    gAxis.append("text")
      .attr("class", "axis-title")
      .attr("x", width - margin.right)
      .attr("y", 45)
      .attr("fill", "#fff")
      .attr("text-anchor", "end")
      .attr("font-weight", "600")
      .text("Distancia desde la Tierra (escala logarítmica en años luz)");

    // Tierra en x = margin.left - 45
    const earthY = height / 2;
    gEarth.selectAll("*").remove();

    const earthGroup = gEarth.append("g")
      .attr("class", "earth-marker")
      .attr("transform", `translate(${margin.left - 45}, ${earthY})`)
      .style("cursor", "pointer")
      .on("click", () => {
        window.APP_STATE.setActiveObject(null);
        resetZoom();
      });

    // Anillo de pulso atmosférico
    earthGroup.append("circle")
      .attr("r", 28)
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 240, 255, 0.4)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 3");

    earthGroup.append("image")
      .attr("href", "../Proyecto/img/earth.png")
      .attr("x", -22)
      .attr("y", -22)
      .attr("width", 44)
      .attr("height", 44);

    earthGroup.append("text")
      .attr("y", 38)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-accent)")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text("TIERRA (0 al)");

    updateZones(scaleX);
  }

  function updateZones(currScale) {
    gZones.selectAll("*").remove();
    const usableHeight = height - margin.top - margin.bottom;

    cosmicZones.forEach(zone => {
      const x1 = Math.max(margin.left, currScale(zone.min));
      const x2 = Math.min(width - margin.right, currScale(zone.max));
      if (x2 > x1) {
        // Banda de fondo
        gZones.append("rect")
          .attr("x", x1)
          .attr("y", margin.top)
          .attr("width", x2 - x1)
          .attr("height", usableHeight)
          .attr("fill", zone.color);

        // Línea divisoria
        gZones.append("line")
          .attr("x1", x1).attr("x2", x1)
          .attr("y1", margin.top).attr("y2", height - margin.bottom)
          .attr("stroke", "rgba(255, 255, 255, 0.12)")
          .attr("stroke-dasharray", "2 3");

        // Etiqueta de la zona
        if (x2 - x1 > 70) {
          gZones.append("text")
            .attr("x", x1 + 8)
            .attr("y", margin.top + 18)
            .attr("fill", "rgba(255,255,255,0.45)")
            .attr("font-size", "10px")
            .attr("font-weight", "600")
            .attr("letter-spacing", "0.5px")
            .text(zone.label);
        }
      }
    });
  }

  // Cálculo de Y para cada astro
  function computeObjectY(d, i, currScale) {
    if (currentLayoutMode === "lanes") {
      return laneYMap[d.type] || (height / 2);
    } else {
      // Modo Beeswarm cósmico: orden alternante pseudo-orgánico
      const midY = (margin.top + height - margin.bottom) / 2;
      const offsetPattern = [0, -38, 38, -75, 75, -110, 110, -145, 145];
      const offset = offsetPattern[i % offsetPattern.length];
      return midY + offset;
    }
  }

  function renderObjects() {
    const data = window.MESSIER_DATA;
    const nodeRadius = 18;

    const nodes = gObjects.selectAll(".astro-node")
      .data(data, d => d.id)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", d => `astro-node astro-${d.id} type-${createSafeClass(d.type)}`)
            .style("cursor", "pointer");

          // Resplandor exterior
          g.append("circle")
            .attr("class", "glow-ring")
            .attr("r", nodeRadius + 3)
            .attr("fill", "none")
            .attr("stroke", d => window.APP_STATE.getColor(d.type))
            .attr("stroke-width", 2)
            .attr("opacity", 0.85);

          // Círculo con imagen
          g.append("circle")
            .attr("class", "core-circle")
            .attr("r", nodeRadius)
            .attr("fill", d => `url(#pattern-${d.id})`)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

          // Etiqueta flotante pequeña
          g.append("text")
            .attr("class", "node-label")
            .attr("y", nodeRadius + 14)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.75)")
            .attr("font-size", "10px")
            .attr("font-weight", "600")
            .text(d => d.id);

          return g;
        },
        update => update,
        exit => exit.remove()
      );

    updateNodePositions();

    // Eventos interactivos
    nodes
      .on("mouseenter", (event, d) => {
        showHoverLaser(d);
        window.APP_STATE.showTooltip(event, d);
      })
      .on("mousemove", (event, d) => {
        window.APP_STATE.updateTooltipPosition(event);
      })
      .on("mouseleave", () => {
        hideHoverLaser();
        window.APP_STATE.hideTooltip();
      })
      .on("click", (event, d) => {
        window.APP_STATE.setActiveObject(d);
        updateInspectorCard(d);
      });
  }

  function updateNodePositions() {
    const currScale = currentTransform.rescaleX(scaleX);

    gObjects.selectAll(".astro-node")
      .attr("transform", (d, i) => {
        const x = currScale(d.distance);
        const y = computeObjectY(d, i, currScale);
        d._currentX = x;
        d._currentY = y;
        return `translate(${x}, ${y})`;
      });

    // Ocultar los que se salgan de pantalla para optimizar
    gObjects.selectAll(".astro-node")
      .style("visibility", d => (d._currentX >= margin.left - 30 && d._currentX <= width - margin.right + 30) ? "visible" : "hidden");
  }

  function onZoom(event) {
    currentTransform = event.transform;
    const currScale = currentTransform.rescaleX(scaleX);

    // Actualizar Eje X
    gAxis.call(axisX.scale(currScale));
    gAxis.selectAll("line")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-dasharray", "3 4");
    gAxis.selectAll("text").attr("fill", "var(--text-muted)");

    updateZones(currScale);
    updateNodePositions();

    // Si hay láser activo, actualizar
    if (activeLaserTarget) {
      drawLaserTo(activeLaserTarget);
    }
  }

  let activeLaserTarget = null;

  function showHoverLaser(d) {
    activeLaserTarget = d;
    drawLaserTo(d);
  }

  function hideHoverLaser() {
    if (!window.APP_STATE.activeObject) {
      gLaser.selectAll("*").remove();
      activeLaserTarget = null;
    } else {
      drawLaserTo(window.APP_STATE.activeObject);
    }
  }

  function drawLaserTo(d) {
    gLaser.selectAll("*").remove();
    if (!d || !d._currentX) return;

    const earthX = margin.left - 45;
    const earthY = height / 2;

    // Línea láser
    gLaser.append("line")
      .attr("x1", earthX)
      .attr("y1", earthY)
      .attr("x2", d._currentX)
      .attr("y2", d._currentY)
      .attr("stroke", window.APP_STATE.getColor(d.type))
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 3")
      .attr("opacity", 0.85);

    // Indicador de distancia en la línea
    const midX = (earthX + d._currentX) / 2;
    const midY = (earthY + d._currentY) / 2 - 12;

    const labelGroup = gLaser.append("g")
      .attr("transform", `translate(${midX}, ${midY})`);

    labelGroup.append("rect")
      .attr("x", -70)
      .attr("y", -14)
      .attr("width", 140)
      .attr("height", 24)
      .attr("rx", 6)
      .attr("fill", "rgba(10, 15, 38, 0.9)")
      .attr("stroke", "rgba(0, 240, 255, 0.4)");

    labelGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 3)
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(formatFullDistance(d.distance));
  }

  // Actualizar tarjeta del inspector lateral
  function updateInspectorCard(d) {
    const card = d3.select("#vis1-inspector-card");
    if (!d) {
      card.html(`
        <div class="empty-state">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔭</div>
          <h3>Explorador de Distancias</h3>
          <p style="margin-top: 8px;">Haz clic en cualquier objeto cósmico en el mapa para inspeccionar sus detalles astronómicos y tiempo de viaje de la luz.</p>
        </div>
      `);
      return;
    }

    const typeColor = window.APP_STATE.getColor(d.type);

    card.html(`
      <div class="preview-hero">
        <img src="${d.image}" alt="${d.id} - ${d.nameEs}">
        <span class="inspector-badge-type" style="background: ${typeColor};">${d.typeEs}</span>
      </div>
      <div class="inspector-title">${d.id}: ${d.nameEs}</div>
      <div class="inspector-sub">${d.name ? `<em>"${d.name}"</em> · ` : ''}${d.ngc}</div>

      <div class="inspector-grid">
        <div class="inspector-field">
          <div class="inspector-field-label">Distancia</div>
          <div class="inspector-field-val">${formatFullDistance(d.distance)}</div>
        </div>
        <div class="inspector-field">
          <div class="inspector-field-label">Constelación</div>
          <div class="inspector-field-val">${d.constellationEs}</div>
        </div>
        <div class="inspector-field">
          <div class="inspector-field-label">Magnitud</div>
          <div class="inspector-field-val">Mag ${d.magnitude}</div>
        </div>
        <div class="inspector-field">
          <div class="inspector-field-label">Descubrimiento</div>
          <div class="inspector-field-val">${d.yearOriginal} (${d.discoverer})</div>
        </div>
      </div>

      <div class="inspector-note">
        💡 <strong>Retardo de la luz:</strong> Los fotones que observamos hoy salieron de ${d.id} hace <strong>${d.distance.toLocaleString('es-ES')} años</strong>.
      </div>

      <button class="btn-open-modal" onclick="window.APP_STATE.openModal('${d.id}')">
        Ver Ficha Completa en Detalle
      </button>
    `);

    drawLaserTo(d);
  }

  // Filtrado y resaltado reactivo
  function highlight(filterType, selectedId) {
    gObjects.selectAll(".astro-node")
      .transition()
      .duration(300)
      .style("opacity", d => {
        if (selectedId && d.id !== selectedId) return 0.15;
        if (filterType && filterType !== "all" && d.type !== filterType) return 0.15;
        return 1;
      })
      .select(".glow-ring")
      .attr("stroke-width", d => (selectedId === d.id) ? 4 : 2)
      .attr("r", d => (selectedId === d.id) ? 24 : 21);

    if (selectedId) {
      const target = window.MESSIER_DATA.find(x => x.id === selectedId);
      if (target) {
        updateInspectorCard(target);
      }
    }
  }

  function resetZoom() {
    svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
  }

  function zoomToRange(minDist, maxDist) {
    const k = Math.min(25, (width - margin.left - margin.right) / (scaleX(maxDist) - scaleX(minDist)));
    const tx = -scaleX(minDist) * k + margin.left;
    svg.transition().duration(800).call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(tx, 0).scale(k)
    );
  }

  function setupControls() {
    // Modo de vista: Cósmica vs Carriles
    d3.select("#btn-v1-mode-cosmic").on("click", function () {
      currentLayoutMode = "cosmic";
      d3.selectAll(".btn-v1-layout").classed("active", false);
      d3.select(this).classed("active", true);
      updateNodePositions();
    });

    d3.select("#btn-v1-mode-lanes").on("click", function () {
      currentLayoutMode = "lanes";
      d3.selectAll(".btn-v1-layout").classed("active", false);
      d3.select(this).classed("active", true);
      updateNodePositions();
    });

    // Presets de Zoom
    d3.select("#btn-v1-preset-all").on("click", resetZoom);
    d3.select("#btn-v1-preset-milky").on("click", () => zoomToRange(400, 100000));
    d3.select("#btn-v1-preset-local").on("click", () => zoomToRange(2000000, 3500000));
    d3.select("#btn-v1-preset-virgo").on("click", () => zoomToRange(10000000, 65000000));

    // Botones Zoom + / -
    d3.select("#btn-v1-zoom-in").on("click", () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.6));
    d3.select("#btn-v1-zoom-out").on("click", () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.6));
    d3.select("#btn-v1-zoom-reset").on("click", resetZoom);
  }

  function createSafeClass(str) {
    return (str || "").replace(/\s+/g, "-").toLowerCase();
  }

  // Exportar al objeto global
  window.Vis1 = {
    init,
    highlight,
    resetZoom,
    selectObject: (id) => {
      const d = window.MESSIER_DATA.find(x => x.id === id);
      if (d) updateInspectorCard(d);
    }
  };
})();
