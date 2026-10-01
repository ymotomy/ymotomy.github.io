// ==========================================================================
// VISUALIZACIÓN 2: CRONOLOGÍA DE DESCUBRIMIENTOS ASTRONÓMICOS
// Catálogo Messier - ProyectoAntigravity
// ==========================================================================

(function () {
  const containerId = "#vis-2";
  let svg, gBase, gGrid, gAreas, gLines, gBars, gMilestones, gCrosshair, gAxisX, gAxisY;
  let width, height;
  let scaleX, scaleY;
  let currentMode = "cumulative"; // 'cumulative' o 'annual'
  let activeCategory = "all";

  const margin = { top: 60, right: 35, bottom: 65, left: 65 };
  const baseWidth = 840;
  const baseHeight = 520;

  const categories = ["Galaxy", "Globular Cluster", "Open Cluster", "Nebula", "Double star"];

  // Hitos astronómicos
  const milestones = [
    { year: 1610, title: "Telescopio Astronómico", desc: "Galileo y Peiresc usan el telescopio para descubrir nebulosas (M42)." },
    { year: 1758, title: "El Cometa Halley y M1", desc: "Messier descubre M1 buscando el cometa Halley; decide crear su catálogo." },
    { year: 1764, title: "Gran Campaña de Messier", desc: "Charles Messier descubre 38 objetos en un solo año de observaciones febriles." },
    { year: 1774, title: "Primer Catálogo Oficial", desc: "Se publica la primera edición de 45 objetos en las Memorias de la Academia." },
    { year: 1781, title: "Edición Final con Méchain", desc: "Se alcanza hasta M103 con las valiosas aportaciones de Pierre Méchain." }
  ];

  // Datos procesados por año
  let timelineYears = [];
  let dataByYear = {}; // { year: { total: n, byType: { Galaxy: n, ... }, items: [] } }
  let cumulativeData = {}; // { year: { total: n, byType: { Galaxy: n, ... } } }

  function processData() {
    const raw = window.MESSIER_DATA;
    dataByYear = {};
    cumulativeData = {};

    // Años entre 1610 y 1782
    const minYear = 1610;
    const maxYear = 1782;

    for (let y = minYear; y <= maxYear; y++) {
      dataByYear[y] = {
        year: y,
        total: 0,
        byType: { Galaxy: 0, "Globular Cluster": 0, "Open Cluster": 0, Nebula: 0, "Double star": 0 },
        items: []
      };
    }

    raw.forEach(d => {
      const y = Math.max(minYear, Math.min(maxYear, d.year));
      if (!dataByYear[y]) {
        dataByYear[y] = {
          year: y,
          total: 0,
          byType: { Galaxy: 0, "Globular Cluster": 0, "Open Cluster": 0, Nebula: 0, "Double star": 0 },
          items: []
        };
      }
      dataByYear[y].total += 1;
      dataByYear[y].byType[d.type] = (dataByYear[y].byType[d.type] || 0) + 1;
      dataByYear[y].items.push(d);
    });

    timelineYears = Object.keys(dataByYear).map(Number).sort((a, b) => a - b);

    // Calcular acumulados
    let runningTotal = 0;
    let runningByType = { Galaxy: 0, "Globular Cluster": 0, "Open Cluster": 0, Nebula: 0, "Double star": 0 };

    timelineYears.forEach(y => {
      runningTotal += dataByYear[y].total;
      categories.forEach(cat => {
        runningByType[cat] += dataByYear[y].byType[cat] || 0;
      });

      cumulativeData[y] = {
        year: y,
        total: runningTotal,
        byType: { ...runningByType }
      };
    });
  }

  function init() {
    processData();

    const container = d3.select(containerId);
    container.html("");

    width = baseWidth;
    height = baseHeight;

    svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "vis2-svg");

    // Defs para gradientes
    const defs = svg.append("defs");
    categories.forEach(cat => {
      const color = window.APP_STATE.getColor(cat);
      const grad = defs.append("linearGradient")
        .attr("id", `area-grad-${createSafeClass(cat)}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.35);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.0);
    });

    // Grupos
    gGrid = svg.append("g").attr("class", "v2-grid");
    gAreas = svg.append("g").attr("class", "v2-areas");
    gBars = svg.append("g").attr("class", "v2-bars");
    gLines = svg.append("g").attr("class", "v2-lines");
    gMilestones = svg.append("g").attr("class", "v2-milestones");
    gAxisX = svg.append("g").attr("class", "v2-axis-x");
    gAxisY = svg.append("g").attr("class", "v2-axis-y");
    gCrosshair = svg.append("g").attr("class", "v2-crosshair").style("pointer-events", "none");

    scaleX = d3.scaleLinear()
      .domain([1610, 1782])
      .range([margin.left, width - margin.right]);

    renderChart();
    renderLegend();
    setupControls();
  }

  function renderChart() {
    const usableHeight = height - margin.top - margin.bottom;

    // Escala Y según modo
    if (currentMode === "cumulative") {
      scaleY = d3.scaleLinear()
        .domain([0, 42]) // Máximo acumulado por categoría (~40 galaxias)
        .range([height - margin.bottom, margin.top]);
    } else {
      scaleY = d3.scaleLinear()
        .domain([0, 40]) // En 1764 hubo ~38 descubrimientos en total
        .range([height - margin.bottom, margin.top]);
    }

    // Eje X
    const axisX = d3.axisBottom(scaleX)
      .tickFormat(d => d.toString())
      .ticks(10)
      .tickSizeInner(-usableHeight)
      .tickPadding(12);

    gAxisX.attr("transform", `translate(0, ${height - margin.bottom})`)
      .transition().duration(500)
      .call(axisX);

    gAxisX.selectAll("line")
      .attr("stroke", "rgba(255, 255, 255, 0.08)")
      .attr("stroke-dasharray", "3 4");
    gAxisX.selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "11px");

    // Eje Y
    const axisY = d3.axisLeft(scaleY)
      .ticks(6)
      .tickSizeInner(-(width - margin.left - margin.right))
      .tickPadding(10);

    gAxisY.attr("transform", `translate(${margin.left}, 0)`)
      .transition().duration(500)
      .call(axisY);

    gAxisY.selectAll("line")
      .attr("stroke", "rgba(255, 255, 255, 0.08)")
      .attr("stroke-dasharray", "3 4");
    gAxisY.selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "11px");

    // Título de Eje Y
    gAxisY.selectAll(".y-axis-label").remove();
    gAxisY.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + usableHeight / 2))
      .attr("y", -45)
      .attr("fill", "var(--text-muted)")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(currentMode === "cumulative" ? "Cuerpos Acumulados" : "Descubrimientos en el Año");

    // Renderizar según modo
    if (currentMode === "cumulative") {
      gBars.selectAll("*").remove();
      renderCumulativeLines();
    } else {
      gLines.selectAll("*").remove();
      gAreas.selectAll("*").remove();
      renderAnnualBars();
    }

    renderMilestones();
    setupCrosshair();
  }

  function renderCumulativeLines() {
    const usableYears = timelineYears;

    categories.forEach(cat => {
      const color = window.APP_STATE.getColor(cat);
      const catClass = createSafeClass(cat);
      const catData = usableYears.map(y => ({ year: y, val: cumulativeData[y].byType[cat] || 0 }));

      // Generador de línea
      const lineGen = d3.line()
        .x(d => scaleX(d.year))
        .y(d => scaleY(d.val))
        .curve(d3.curveMonotoneX);

      // Generador de área
      const areaGen = d3.area()
        .x(d => scaleX(d.year))
        .y0(scaleY(0))
        .y1(d => scaleY(d.val))
        .curve(d3.curveMonotoneX);

      // Área rellena
      let area = gAreas.select(`.area-${catClass}`);
      if (area.empty()) {
        area = gAreas.append("path")
          .attr("class", `area-path area-${catClass}`)
          .attr("fill", `url(#area-grad-${catClass})`);
      }
      area.datum(catData)
        .transition().duration(600)
        .attr("d", areaGen)
        .style("opacity", activeCategory === "all" || activeCategory === cat ? 0.7 : 0.08);

      // Línea trazada
      let line = gLines.select(`.line-${catClass}`);
      if (line.empty()) {
        line = gLines.append("path")
          .attr("class", `line-path line-${catClass}`)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2.8);
      }
      line.datum(catData)
        .transition().duration(600)
        .attr("d", lineGen)
        .style("opacity", activeCategory === "all" || activeCategory === cat ? 1 : 0.1);

      // Puntos en años clave (años con descubrimientos reales de esta categoría)
      const pointsData = usableYears.filter(y => (dataByYear[y].byType[cat] || 0) > 0)
        .map(y => ({ year: y, val: cumulativeData[y].byType[cat], countThisYear: dataByYear[y].byType[cat] }));

      const dots = gLines.selectAll(`.dot-${catClass}`)
        .data(pointsData, d => d.year);

      dots.enter().append("circle")
        .attr("class", `dot dot-${catClass}`)
        .attr("r", 4)
        .attr("fill", "#05081c")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .merge(dots)
        .transition().duration(600)
        .attr("cx", d => scaleX(d.year))
        .attr("cy", d => scaleY(d.val))
        .style("opacity", activeCategory === "all" || activeCategory === cat ? 1 : 0.1);

      dots.exit().remove();
    });
  }

  function renderAnnualBars() {
    const yearsWithDiscoveries = timelineYears.filter(y => dataByYear[y].total > 0);

    const barWidth = 14;

    const groups = gBars.selectAll(".year-bar-group")
      .data(yearsWithDiscoveries, d => d);

    const groupsEnter = groups.enter().append("g")
      .attr("class", "year-bar-group");

    const merged = groupsEnter.merge(groups)
      .attr("transform", y => `translate(${scaleX(y) - barWidth / 2}, 0)`);

    // Barras apiladas por año
    merged.each(function (year) {
      const g = d3.select(this);
      g.selectAll("*").remove();

      let currentYVal = 0;
      categories.forEach(cat => {
        const count = dataByYear[year].byType[cat] || 0;
        if (count > 0) {
          const y1 = currentYVal;
          const y2 = currentYVal + count;
          currentYVal = y2;

          const color = window.APP_STATE.getColor(cat);
          const barH = scaleY(0) - scaleY(count);
          const topY = scaleY(y2);

          g.append("rect")
            .attr("x", 0)
            .attr("y", topY)
            .attr("width", barWidth)
            .attr("height", Math.max(2, barH))
            .attr("fill", color)
            .attr("rx", 3)
            .attr("opacity", activeCategory === "all" || activeCategory === cat ? 0.9 : 0.15);
        }
      });

      // Etiqueta de cantidad total sobre la barra
      if (dataByYear[year].total >= 3) {
        g.append("text")
          .attr("x", barWidth / 2)
          .attr("y", scaleY(dataByYear[year].total) - 5)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "10px")
          .attr("font-weight", "700")
          .text(dataByYear[year].total);
      }
    });

    groups.exit().remove();
  }

  function renderMilestones() {
    gMilestones.selectAll("*").remove();

    milestones.forEach(m => {
      const x = scaleX(m.year);
      const group = gMilestones.append("g")
        .attr("class", "milestone-flag")
        .attr("transform", `translate(${x}, ${margin.top - 20})`)
        .style("cursor", "pointer")
        .on("mouseenter", (event) => {
          showMilestoneTooltip(event, m);
        })
        .on("mouseleave", () => {
          window.APP_STATE.hideTooltip();
        });

      // Línea punteada hacia abajo
      group.append("line")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", height - margin.bottom - margin.top + 20)
        .attr("stroke", "rgba(0, 240, 255, 0.45)")
        .attr("stroke-dasharray", "2 3");

      // Marcador diamante
      group.append("polygon")
        .attr("points", "0,-8 7,0 0,8 -7,0")
        .attr("fill", "var(--color-globular)")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

      // Año
      group.append("text")
        .attr("y", -14)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-accent)")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .text(m.year);
    });
  }

  function showMilestoneTooltip(event, m) {
    const tooltip = d3.select("#custom-tooltip");
    tooltip.html(`
      <div style="font-weight: 700; color: var(--color-globular); font-size: 0.95rem; margin-bottom: 4px;">
        🏛️ Hito Histórico (${m.year})
      </div>
      <div style="font-weight: 600; color: #fff; margin-bottom: 6px;">${m.title}</div>
      <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">${m.desc}</div>
    `);
    tooltip.style("display", "block");
    window.APP_STATE.updateTooltipPosition(event);
  }

  // Crosshair interactivo al mover el mouse
  function setupCrosshair() {
    // Línea vertical
    gCrosshair.selectAll("*").remove();

    const crosshairLine = gCrosshair.append("line")
      .attr("class", "crosshair-line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "rgba(0, 240, 255, 0.6)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 3")
      .style("opacity", 0);

    const overlay = svg.append("rect")
      .attr("class", "interaction-overlay")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    overlay
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const year = Math.round(scaleX.invert(mx));
        const clampedYear = Math.max(1610, Math.min(1782, year));

        const xPos = scaleX(clampedYear);
        crosshairLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .style("opacity", 1);

        showYearTooltip(event, clampedYear);
      })
      .on("mouseleave", function () {
        crosshairLine.style("opacity", 0);
        window.APP_STATE.hideTooltip();
      });
  }

  function showYearTooltip(event, year) {
    const yrData = dataByYear[year] || { total: 0, byType: {}, items: [] };
    const cumData = cumulativeData[year] || { total: 0, byType: {} };

    const itemsSummary = yrData.items.length > 0
      ? `<div style="margin-top: 6px; font-size: 0.78rem; color: #94a3b8; max-height: 80px; overflow-y: auto;">
          <strong>Descubiertos en ${year}:</strong> ${yrData.items.map(d => d.id).join(', ')}
         </div>`
      : `<div style="margin-top: 4px; font-size: 0.78rem; color: #64748b;">(Sin descubrimientos registrados este año)</div>`;

    let breakdownHtml = "";
    categories.forEach(cat => {
      const color = window.APP_STATE.getColor(cat);
      const count = yrData.byType[cat] || 0;
      const cum = cumData.byType[cat] || 0;
      if (cum > 0 || count > 0) {
        breakdownHtml += `
          <div class="tooltip-row">
            <span class="tooltip-label" style="display:flex; align-items:center; gap:6px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${color};"></span>
              ${window.APP_STATE.getTypeLabel(cat)}
            </span>
            <span class="tooltip-val">+${count} (Tot: ${cum})</span>
          </div>
        `;
      }
    });

    const tooltip = d3.select("#custom-tooltip");
    tooltip.html(`
      <div style="font-family: var(--font-title); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
        Año ${year}
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Descubrimientos del año:</span>
        <span class="tooltip-val" style="color: var(--color-globular);">${yrData.total}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Total acumulado:</span>
        <span class="tooltip-val">${cumData.total} / 110</span>
      </div>
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06);">
        ${breakdownHtml}
      </div>
      ${itemsSummary}
    `);
    tooltip.style("display", "block");
    window.APP_STATE.updateTooltipPosition(event);
  }

  function renderLegend() {
    const container = d3.select("#vis2-legend-list");
    container.html("");

    categories.forEach(cat => {
      const color = window.APP_STATE.getColor(cat);
      const total = window.MESSIER_DATA.filter(d => d.type === cat).length;
      const label = window.APP_STATE.getTypeLabel(cat);

      const item = container.append("button")
        .attr("class", `legend-item-btn legend-btn-${createSafeClass(cat)}`)
        .html(`
          <div class="legend-left">
            <span class="legend-swatch" style="background: ${color}; box-shadow: 0 0 8px ${color};"></span>
            <span>${label}</span>
          </div>
          <span class="legend-count">${total}</span>
        `)
        .on("click", () => {
          if (activeCategory === cat) {
            activeCategory = "all";
            window.APP_STATE.setActiveCategory("all");
          } else {
            activeCategory = cat;
            window.APP_STATE.setActiveCategory(cat);
          }
        });
    });

    // Botón reiniciar
    container.append("button")
      .attr("class", "legend-item-btn")
      .style("margin-top", "8px")
      .style("justify-content", "center")
      .style("color", "var(--text-accent)")
      .text("⟲ Mostrar Todas las Categorías")
      .on("click", () => {
        activeCategory = "all";
        window.APP_STATE.setActiveCategory("all");
      });
  }

  function setupControls() {
    d3.select("#btn-v2-mode-cumulative").on("click", function () {
      currentMode = "cumulative";
      d3.selectAll(".btn-v2-mode").classed("active", false);
      d3.select(this).classed("active", true);
      renderChart();
    });

    d3.select("#btn-v2-mode-annual").on("click", function () {
      currentMode = "annual";
      d3.selectAll(".btn-v2-mode").classed("active", false);
      d3.select(this).classed("active", true);
      renderChart();
    });
  }

  function highlight(filterType, selectedId) {
    activeCategory = filterType || "all";

    d3.selectAll(".legend-item-btn").classed("active", false);
    if (activeCategory !== "all") {
      d3.select(`.legend-btn-${createSafeClass(activeCategory)}`).classed("active", true);
    }

    if (currentMode === "cumulative") {
      categories.forEach(cat => {
        const catClass = createSafeClass(cat);
        const isActive = activeCategory === "all" || activeCategory === cat;
        gLines.select(`.line-${catClass}`).transition().duration(300).style("opacity", isActive ? 1 : 0.08);
        gAreas.select(`.area-${catClass}`).transition().duration(300).style("opacity", isActive ? 0.7 : 0.04);
        gLines.selectAll(`.dot-${catClass}`).transition().duration(300).style("opacity", isActive ? 1 : 0.08);
      });
    } else {
      renderAnnualBars();
    }
  }

  function createSafeClass(str) {
    return (str || "").replace(/\s+/g, "-").toLowerCase();
  }

  window.Vis2 = {
    init,
    highlight
  };
})();
