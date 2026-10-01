// ==========================================================================
// VISUALIZACIÓN 3: TAMAÑO DE LOS CUERPOS EN LA ESFERA CELESTE
// Catálogo Messier - ProyectoAntigravity
// ==========================================================================

(function () {
  const containerId = "#vis-3";
  let svg, gContainer, gNodes, gMoon, gLabels;
  let width, height;
  let simulation;
  let currentLayout = "free"; // 'free' (pack), 'clustered' (por tipo), 'ranked' (ordenado)
  let showMoon = true;
  let scaleRadius;
  let activeFilterType = "all";
  let zoomBehavior;

  const baseWidth = 1100;
  const baseHeight = 700;

  // Centros para el modo 'clustered' (5 islas)
  const clusterCenters = {
    "Galaxy": { x: 260, y: 220, label: "Galaxias" },
    "Globular Cluster": { x: 840, y: 220, label: "Cúmulos Globulares" },
    "Open Cluster": { x: 550, y: 460, label: "Cúmulos Abiertos" },
    "Nebula": { x: 250, y: 520, label: "Nebulosas" },
    "Double star": { x: 860, y: 500, label: "Estrellas Dobles" }
  };

  function init() {
    const container = d3.select(containerId);
    container.html("");

    width = baseWidth;
    height = baseHeight;

    svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "vis3-svg");

    const defs = svg.append("defs");

    // Patrón para la Luna Llena
    const moonGrad = defs.append("radialGradient")
      .attr("id", "moon-surface-grad")
      .attr("cx", "40%").attr("cy", "40%")
      .attr("r", "60%");
    moonGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    moonGrad.append("stop").attr("offset", "70%").attr("stop-color", "#d1d5db");
    moonGrad.append("stop").attr("offset", "100%").attr("stop-color", "#9ca3af");

    // Patrones con fotos para cada M
    window.MESSIER_DATA.forEach(d => {
      defs.append("pattern")
        .attr("id", `v3-pat-${d.id}`)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("href", d.image)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("width", 1)
        .attr("height", 1);
    });

    gContainer = svg.append("g").attr("class", "v3-canvas-root");
    gMoon = gContainer.append("g").attr("class", "v3-moon-layer");
    gLabels = gContainer.append("g").attr("class", "v3-labels-layer");
    gNodes = gContainer.append("g").attr("class", "v3-nodes-layer");

    // Escala logarítmica para radios de visualización
    // Rango real de radio angular: ~0.67 arcmin a 62 arcmin
    scaleRadius = d3.scaleLog()
      .domain([0.65, 65])
      .range([10, 56])
      .clamp(true);

    zoomBehavior = d3.zoom()
      .scaleExtent([0.6, 6])
      .on("zoom", (event) => {
        gContainer.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    setupSimulation();
    renderMoonReference();
    setupControls();
  }

  function setupSimulation() {
    const data = window.MESSIER_DATA;

    data.forEach(d => {
      d.skyRadius = scaleRadius(d.radiusArcmin);
      if (!d.x) d.x = width / 2 + (Math.random() - 0.5) * 200;
      if (!d.y) d.y = height / 2 + (Math.random() - 0.5) * 200;
    });

    // Fuerza de colisión
    const forceCollide = d3.forceCollide().radius(d => d.skyRadius + 3).iterations(2);

    simulation = d3.forceSimulation(data)
      .force("charge", d3.forceManyBody().strength(-20))
      .force("collide", forceCollide)
      .alphaDecay(0.02)
      .on("tick", ticked);

    applyLayoutForces();
    renderNodes();
  }

  function applyLayoutForces() {
    gLabels.selectAll("*").remove();

    if (currentLayout === "free") {
      simulation
        .force("center", d3.forceCenter(width / 2, height / 2).strength(0.12))
        .force("x", d3.forceX(width / 2).strength(0.06))
        .force("y", d3.forceY(height / 2).strength(0.06));
    } else if (currentLayout === "clustered") {
      simulation
        .force("center", null)
        .force("x", d3.forceX(d => clusterCenters[d.type] ? clusterCenters[d.type].x : width / 2).strength(0.25))
        .force("y", d3.forceY(d => clusterCenters[d.type] ? clusterCenters[d.type].y : height / 2).strength(0.25));

      // Etiquetas de islas
      Object.keys(clusterCenters).forEach(cat => {
        const center = clusterCenters[cat];
        const color = window.APP_STATE.getColor(cat);

        const group = gLabels.append("g")
          .attr("transform", `translate(${center.x}, ${center.y - 120})`);

        group.append("rect")
          .attr("x", -70)
          .attr("y", -14)
          .attr("width", 140)
          .attr("height", 26)
          .attr("rx", 13)
          .attr("fill", "rgba(10, 16, 40, 0.85)")
          .attr("stroke", color)
          .attr("stroke-width", 1.5);

        group.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 4)
          .attr("fill", "#fff")
          .attr("font-size", "11px")
          .attr("font-weight", "700")
          .text(center.label);
      });
    } else if (currentLayout === "ranked") {
      // Ordenar por tamaño angular descendente
      const sorted = [...window.MESSIER_DATA].sort((a, b) => b.radiusArcmin - a.radiusArcmin);
      const cols = 11;
      const rows = 10;
      const startX = 100;
      const startY = 100;
      const cellW = (width - 160) / cols;
      const cellH = (height - 160) / rows;

      sorted.forEach((d, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        d._targetX = startX + c * cellW;
        d._targetY = startY + r * cellH;
      });

      simulation
        .force("center", null)
        .force("x", d3.forceX(d => d._targetX).strength(0.45))
        .force("y", d3.forceY(d => d._targetY).strength(0.45));
    }

    simulation.alpha(0.6).restart();
  }

  function renderNodes() {
    const data = window.MESSIER_DATA;

    const node = gNodes.selectAll(".sky-node")
      .data(data, d => d.id)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", d => `sky-node sky-node-${d.id}`)
            .style("cursor", "grab")
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
            );

          // Anillo coloreado
          g.append("circle")
            .attr("class", "sky-node-ring")
            .attr("r", d => d.skyRadius + 2.5)
            .attr("fill", "none")
            .attr("stroke", d => window.APP_STATE.getColor(d.type))
            .attr("stroke-width", 2);

          // Círculo con imagen fotográfica
          g.append("circle")
            .attr("class", "sky-node-core")
            .attr("r", d => d.skyRadius)
            .attr("fill", d => `url(#v3-pat-${d.id})`)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

          // Etiqueta de ID
          g.append("text")
            .attr("class", "sky-node-label")
            .attr("text-anchor", "middle")
            .attr("y", d => d.skyRadius > 24 ? 4 : d.skyRadius + 12)
            .attr("fill", "#fff")
            .attr("font-size", d => d.skyRadius > 35 ? "12px" : "10px")
            .attr("font-weight", "700")
            .style("text-shadow", "0 0 4px #000, 0 0 8px #000")
            .text(d => d.id);

          return g;
        },
        update => update,
        exit => exit.remove()
      );

    // Eventos
    node
      .on("mouseenter", (event, d) => {
        showSkyTooltip(event, d);
        d3.select(event.currentTarget).select(".sky-node-ring")
          .attr("stroke-width", 4)
          .attr("r", d.skyRadius + 5);
      })
      .on("mousemove", (event) => {
        window.APP_STATE.updateTooltipPosition(event);
      })
      .on("mouseleave", (event, d) => {
        window.APP_STATE.hideTooltip();
        d3.select(event.currentTarget).select(".sky-node-ring")
          .attr("stroke-width", 2)
          .attr("r", d.skyRadius + 2.5);
      })
      .on("click", (event, d) => {
        window.APP_STATE.setActiveObject(d);
        window.APP_STATE.openModal(d.id);
      });
  }

  function ticked() {
    gNodes.selectAll(".sky-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.2).restart();
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this).style("cursor", "grabbing");
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.select(this).style("cursor", "grab");
  }

  function showSkyTooltip(event, d) {
    const tooltip = d3.select("#custom-tooltip");
    const moonCmp = d.moonRatio >= 1
      ? `<span style="color:#4ade80;">${d.moonRatio}x el tamaño de la Luna Llena</span>`
      : `<span style="color:#94a3b8;">${Math.round(d.moonRatio * 100)}% de la Luna Llena</span>`;

    tooltip.html(`
      <div class="tooltip-header">
        <img src="${d.image}" class="tooltip-img" alt="${d.id}">
        <div>
          <div class="tooltip-title">${d.id}: ${d.nameEs}</div>
          <div class="tooltip-subtitle">${d.typeEs} · ${d.constellationEs}</div>
        </div>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Diámetro angular:</span>
        <span class="tooltip-val">${d.diameterArcmin}' (minutos de arco)</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Comparación con la Luna:</span>
        <span class="tooltip-val">${moonCmp}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Distancia:</span>
        <span class="tooltip-val">${d.distance.toLocaleString('es-ES')} años luz</span>
      </div>
      <div style="font-size: 0.75rem; color: #38bdf8; margin-top: 6px; text-align: center;">
        ✦ Clic para ver ficha astronómica completa ✦
      </div>
    `);
    tooltip.style("display", "block");
    window.APP_STATE.updateTooltipPosition(event);
  }

  // Renderizar la Luna de referencia
  function renderMoonReference() {
    gMoon.selectAll("*").remove();

    if (!showMoon) return;

    // Luna Llena: radio angular ~15.5 arcmin
    const moonRadius = scaleRadius(15.5);

    const moonGroup = gMoon.append("g")
      .attr("class", "moon-reference-node")
      .attr("transform", `translate(${width - 120}, ${height - 120})`)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("drag", function (event) {
          d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
        })
      );

    // Resplandor lunar
    moonGroup.append("circle")
      .attr("r", moonRadius + 8)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4");

    // Disco lunar
    moonGroup.append("circle")
      .attr("r", moonRadius)
      .attr("fill", "url(#moon-surface-grad)")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);

    // Cráteres decorativos
    moonGroup.append("circle").attr("cx", -moonRadius * 0.3).attr("cy", -moonRadius * 0.2).attr("r", moonRadius * 0.22).attr("fill", "rgba(0,0,0,0.15)");
    moonGroup.append("circle").attr("cx", moonRadius * 0.25).attr("cy", moonRadius * 0.3).attr("r", moonRadius * 0.18).attr("fill", "rgba(0,0,0,0.12)");

    // Etiqueta
    moonGroup.append("text")
      .attr("y", moonRadius + 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text("LUNA LLENA (~31')");

    moonGroup.append("text")
      .attr("y", moonRadius + 30)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "9px")
      .text("(Arrastra para comparar)");
  }

  function setupControls() {
    // Layouts
    d3.select("#btn-v3-layout-free").on("click", function () {
      currentLayout = "free";
      d3.selectAll(".btn-v3-layout").classed("active", false);
      d3.select(this).classed("active", true);
      applyLayoutForces();
    });

    d3.select("#btn-v3-layout-clustered").on("click", function () {
      currentLayout = "clustered";
      d3.selectAll(".btn-v3-layout").classed("active", false);
      d3.select(this).classed("active", true);
      applyLayoutForces();
    });

    d3.select("#btn-v3-layout-ranked").on("click", function () {
      currentLayout = "ranked";
      d3.selectAll(".btn-v3-layout").classed("active", false);
      d3.select(this).classed("active", true);
      applyLayoutForces();
    });

    // Toggle Luna
    d3.select("#btn-v3-toggle-moon").on("click", function () {
      showMoon = !showMoon;
      d3.select(this).classed("active", showMoon);
      renderMoonReference();
    });

    // Zoom
    d3.select("#btn-v3-zoom-in").on("click", () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.5));
    d3.select("#btn-v3-zoom-out").on("click", () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.65));
    d3.select("#btn-v3-zoom-reset").on("click", () => svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity));
  }

  function highlight(filterType, selectedId) {
    activeFilterType = filterType || "all";

    gNodes.selectAll(".sky-node")
      .transition()
      .duration(350)
      .style("opacity", d => {
        if (selectedId && d.id !== selectedId) return 0.15;
        if (activeFilterType !== "all" && d.type !== activeFilterType) return 0.15;
        return 1;
      })
      .select(".sky-node-ring")
      .attr("stroke-width", d => (selectedId === d.id) ? 4 : 2)
      .attr("r", d => (selectedId === d.id) ? d.skyRadius + 5 : d.skyRadius + 2.5);
  }

  window.Vis3 = {
    init,
    highlight
  };
})();
