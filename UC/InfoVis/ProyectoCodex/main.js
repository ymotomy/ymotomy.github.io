const TYPE_ORDER = ["Galaxy", "Globular Cluster", "Open Cluster", "Nebula", "Double star"];
const TYPE_LABELS = {
  "Galaxy": "Galaxias",
  "Globular Cluster": "Cúmulos globulares",
  "Open Cluster": "Cúmulos abiertos",
  "Nebula": "Nebulosas",
  "Double star": "Estrellas dobles"
};
const TYPE_COLORS = {
  "Galaxy": "#f58cc0",
  "Globular Cluster": "#62e7e1",
  "Open Cluster": "#b0e77d",
  "Nebula": "#ffc875",
  "Double star": "#a98bff"
};
const NUMBER_FORMAT = new Intl.NumberFormat("es-CL");
const DISTANCE_FORMAT = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });
const tooltip = d3.select("#tooltip");
let catalog = [];
let selectedMessier = null;
let timelineFilter = "all";
let sizeFilter = "all";

function normalizeType(value) {
  const type = String(value || "").trim().toLowerCase();
  if (type.includes("galaxy")) return "Galaxy";
  if (type.includes("globular")) return "Globular Cluster";
  if (type.includes("open cluster")) return "Open Cluster";
  if (type.includes("double")) return "Double star";
  return "Nebula";
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type;
}

function formatDistance(value) {
  if (value >= 1000000) return DISTANCE_FORMAT.format(value / 1000000) + " millones de a.l.";
  return NUMBER_FORMAT.format(value) + " a.l.";
}

function showTooltip(text, event) {
  tooltip.text(text).classed("visible", true)
    .style("left", (event.clientX + 14) + "px")
    .style("top", (event.clientY + 14) + "px");
}

function hideTooltip() {
  tooltip.classed("visible", false);
}

function handleMarkEvents(selection, onSelect) {
  selection
    .on("mouseenter", function(event, d) {
      const name = d.name || "Sin nombre común";
      showTooltip(d.messier + " · " + name + "\n" + typeLabel(d.type) + " · " + formatDistance(d.distance), event);
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.clientX + 14) + "px").style("top", (event.clientY + 14) + "px");
    })
    .on("mouseleave", hideTooltip)
    .on("click", function(event, d) {
      event.stopPropagation();
      onSelect(d);
    })
    .on("keydown", function(event, d) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(d);
      }
    });
}

function updateSelection(object) {
  selectedMessier = object ? object.messier : null;
  d3.selectAll(".data-mark")
    .classed("is-selected", d => selectedMessier !== null && d.messier === selectedMessier)
    .classed("is-dimmed", d => selectedMessier !== null && d.messier !== selectedMessier);

  const empty = d3.select("#details-empty");
  const card = d3.select("#details-card");
  if (!object) {
    empty.style("display", "flex");
    card.property("hidden", true);
    return;
  }

  empty.style("display", "none");
  card.property("hidden", false);
  d3.select("#detail-image").attr("src", object.image).attr("alt", "Imagen de " + object.messier);
  d3.select("#detail-type").text(typeLabel(object.type));
  d3.select("#detail-title").text(object.name || "Sin nombre común");
  d3.select("#detail-messier").text(object.messier + (object.ngc ? " · " + object.ngc : ""));
  d3.select("#detail-distance").text(formatDistance(object.distance));
  d3.select("#detail-constellation").text(object.constellation || "Sin registro");
  d3.select("#detail-year").text(object.year === null ? "No establecido" : String(object.year));
  d3.select("#detail-discoverer").text(object.discoverer || "Sin registro");
  d3.select("#detail-magnitude").text(object.magnitude === null ? "Sin registro" : String(object.magnitude));
  d3.select("#detail-ngc").text(object.ngc || "Sin registro");
}

function makeClipDefinitions(svg, data, prefix, radius) {
  const defs = svg.append("defs");
  defs.selectAll("clipPath")
    .data(data, d => d.messier)
    .join("clipPath")
    .attr("id", d => prefix + "-" + d.messier)
    .append("circle")
    .attr("r", d => typeof radius === "function" ? radius(d) : radius);
}

function drawDistanceChart(data) {
  const width = 1080;
  const height = 390;
  const margin = { top: 26, right: 30, bottom: 54, left: 160 };
  const plotBottom = height - margin.bottom;
  const svg = d3.select("#distance-chart").html("")
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("role", "img")
    .attr("aria-label", "Gráfico de distancias logarítmicas para los objetos Messier");
  const plotTypes = TYPE_ORDER.filter(type => data.some(d => d.type === type));
  const distanceExtent = d3.extent(data, d => d.distance);
  const x = d3.scaleLog()
    .domain([Math.max(1, distanceExtent[0] * 0.72), distanceExtent[1] * 1.35])
    .range([margin.left, width - margin.right]);
  const y = d3.scalePoint()
    .domain(plotTypes)
    .range([margin.top + 20, plotBottom - 12])
    .padding(0.55);

  const grid = svg.append("g").attr("class", "distance-grid");
  grid.selectAll("line")
    .data(plotTypes)
    .join("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", type => y(type))
    .attr("y2", type => y(type));

  svg.append("g")
    .attr("class", "distance-axis")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y).tickSize(0).tickPadding(14).tickFormat(typeLabel));

  const ticks = x.ticks(6);
  svg.append("g")
    .attr("class", "distance-axis")
    .attr("transform", "translate(0," + plotBottom + ")")
    .call(d3.axisBottom(x).tickValues(ticks).tickFormat(value => {
      if (value >= 1000000) return DISTANCE_FORMAT.format(value / 1000000) + " M";
      if (value >= 1000) return DISTANCE_FORMAT.format(value / 1000) + " mil";
      return NUMBER_FORMAT.format(value);
    }));

  svg.append("text")
    .attr("class", "distance-label")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 12)
    .attr("text-anchor", "middle")
    .text("Distancia desde la Tierra · años luz");

  const offsets = [-17, -9, 0, 9, 17];
  const countByType = new Map();
  const points = data.slice().sort((a, b) => a.distance - b.distance).map(d => {
    const index = countByType.get(d.type) || 0;
    countByType.set(d.type, index + 1);
    return { ...d, laneOffset: offsets[index % offsets.length] };
  });

  makeClipDefinitions(svg, points, "distance-clip", 10);
  const marks = svg.append("g").selectAll("g")
    .data(points, d => d.messier)
    .join("g")
    .attr("class", "data-mark distance-point")
    .attr("transform", d => "translate(" + x(d.distance) + "," + (y(d.type) + d.laneOffset) + ")")
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", d => d.messier + ", " + (d.name || typeLabel(d.type)) + ", " + formatDistance(d.distance));

  marks.append("circle")
    .attr("r", 13)
    .attr("fill", "#0a1422")
    .attr("stroke", d => TYPE_COLORS[d.type])
    .attr("stroke-width", 1.6);
  marks.append("image")
    .attr("href", d => d.image)
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("clip-path", d => "url(#distance-clip-" + d.messier + ")");
  handleMarkEvents(marks, updateSelection);
}

function buildTimelineSeries(data) {
  const dated = data.filter(d => d.year !== null);
  const minYear = d3.min(dated, d => d.year);
  const maxYear = d3.max(dated, d => d.year);
  const years = d3.range(minYear, maxYear + 1);
  return TYPE_ORDER.map(type => {
    const events = dated.filter(d => d.type === type).sort((a, b) => a.year - b.year);
    let cursor = 0;
    let total = 0;
    return {
      key: type,
      values: years.map(year => {
        while (cursor < events.length && events[cursor].year <= year) {
          total += 1;
          cursor += 1;
        }
        return { year, total };
      })
    };
  });
}

function drawTimeline(data) {
  const width = 1080;
  const height = 360;
  const margin = { top: 25, right: 165, bottom: 50, left: 55 };
  const svg = d3.select("#timeline-chart").html("")
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("role", "img")
    .attr("aria-label", "Líneas de descubrimientos acumulados por tipo de objeto");
  const series = buildTimelineSeries(data);
  const years = series[0].values.map(d => d.year);
  const maxCount = d3.max(series, row => d3.max(row.values, d => d.total)) || 1;
  const x = d3.scaleLinear().domain(d3.extent(years)).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, maxCount + 2]).nice().range([height - margin.bottom, margin.top]);
  const plotWidth = width - margin.left - margin.right;

  svg.append("g").attr("class", "timeline-grid")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat(""))
    .call(g => g.select(".domain").remove());

  svg.append("g").attr("class", "timeline-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));

  svg.append("g").attr("class", "timeline-axis")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(9));

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveStepAfter);

  const rows = svg.append("g").selectAll("g")
    .data(series, d => d.key)
    .join("g")
    .attr("class", d => "timeline-series" + (timelineFilter !== "all" && timelineFilter !== d.key ? " is-muted" : ""));

  rows.append("path")
    .attr("class", "timeline-line")
    .attr("d", d => line(d.values))
    .attr("stroke", d => TYPE_COLORS[d.key]);

  rows.append("circle")
    .attr("cx", d => x(d.values[d.values.length - 1].year))
    .attr("cy", d => y(d.values[d.values.length - 1].total))
    .attr("r", 3.5)
    .attr("fill", d => TYPE_COLORS[d.key]);

  rows.append("text")
    .attr("class", "timeline-title-label")
    .attr("x", width - margin.right + 10)
    .attr("y", d => y(d.values[d.values.length - 1].total) + 3)
    .attr("fill", d => TYPE_COLORS[d.key])
    .text(d => typeLabel(d.key));
}

function drawSizeChart(data) {
  const width = 1080;
  const height = 600;
  const top = 58;
  const bottom = 574;
  const svg = d3.select("#size-chart").html("")
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("role", "img")
    .attr("aria-label", "Comparación de tamaños angulares aparentes de los objetos Messier");

  const laneWidth = width / TYPE_ORDER.length;
  TYPE_ORDER.forEach((type, index) => {
    const centerX = laneWidth * (index + 0.5);
    svg.append("text")
      .attr("class", "lane-label")
      .attr("x", centerX)
      .attr("y", 27)
      .attr("text-anchor", "middle")
      .text(typeLabel(type));
    if (index > 0) {
      svg.append("line")
        .attr("class", "lane-rule")
        .attr("x1", laneWidth * index)
        .attr("x2", laneWidth * index)
        .attr("y1", top)
        .attr("y2", bottom);
    }
  });

  const visibleData = sizeFilter === "all" ? data.slice() : data.filter(d => d.type === sizeFilter);
  const dimensions = visibleData.map(d => Math.max(1, d.dimensions));
  const radius = d3.scaleSqrt()
    .domain(d3.extent(dimensions))
    .range([9, 38])
    .clamp(true);
  const nodes = visibleData.map(d => ({ ...d }));
  const simulation = d3.forceSimulation(nodes)
    .force("x", d3.forceX(d => (TYPE_ORDER.indexOf(d.type) + 0.5) * laneWidth).strength(0.12))
    .force("y", d3.forceY((top + bottom) / 2).strength(0.035))
    .force("charge", d3.forceManyBody().strength(-1.2))
    .force("collision", d3.forceCollide(d => radius(Math.max(1, d.dimensions)) + 2).iterations(2))
    .stop();
  for (let i = 0; i < 230; i += 1) simulation.tick();

  nodes.forEach(d => {
    const r = radius(Math.max(1, d.dimensions));
    const lane = TYPE_ORDER.indexOf(d.type);
    const minX = lane * laneWidth + r + 7;
    const maxX = (lane + 1) * laneWidth - r - 7;
    d.x = Math.max(minX, Math.min(maxX, d.x));
    d.y = Math.max(top + r, Math.min(bottom - r, d.y));
  });

  makeClipDefinitions(svg, nodes, "size-clip", d => radius(Math.max(1, d.dimensions)) * 0.78);
  const marks = svg.append("g").selectAll("g")
    .data(nodes, d => d.messier)
    .join("g")
    .attr("class", "data-mark bubble-node")
    .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", d => d.messier + ", " + (d.name || typeLabel(d.type)) + ", dimensión aparente registrada " + d.dimensions);

  marks.append("circle")
    .attr("r", d => radius(Math.max(1, d.dimensions)))
    .attr("fill", d => TYPE_COLORS[d.type])
    .attr("stroke", d => TYPE_COLORS[d.type])
    .attr("stroke-width", 1.3);
  marks.append("image")
    .attr("href", d => d.image)
    .attr("x", d => -radius(Math.max(1, d.dimensions)) * 0.78)
    .attr("y", d => -radius(Math.max(1, d.dimensions)) * 0.78)
    .attr("width", d => radius(Math.max(1, d.dimensions)) * 1.56)
    .attr("height", d => radius(Math.max(1, d.dimensions)) * 1.56)
    .attr("clip-path", d => "url(#size-clip-" + d.messier + ")");
  handleMarkEvents(marks, updateSelection);
}

function bindFilters(selector, stateSetter, redraw) {
  const buttons = d3.select(selector).selectAll("button");
  buttons.on("click", function() {
    stateSetter(this.dataset.filter);
    buttons
      .classed("active", button => button.dataset.filter === this.dataset.filter)
      .attr("aria-pressed", button => button.dataset.filter === this.dataset.filter ? "true" : "false");
    redraw();
  });
}

function initializeMessierCatalog(rows) {
  catalog = rows.map(row => {
    const yearMatch = /^(\d{4})$/.exec(String(row.year || "").trim());
    return {
      ...row,
      type: normalizeType(row.type),
      year: yearMatch ? Number(yearMatch[1]) : null,
      dimensions: row.dimensions && row.dimensions > 0 ? row.dimensions : 1,
      image: "../Proyecto/img/" + row.messier + ".png"
    };
  }).filter(d => d.messier && d.distance !== null && d.distance > 0);

  const knownYears = catalog.filter(d => d.year !== null).map(d => d.year);
  d3.select("#metric-total").text(catalog.length);
  d3.select("#metric-types").text(TYPE_ORDER.filter(type => catalog.some(d => d.type === type)).length);
  d3.select("#metric-years").text(knownYears.length ? d3.max(knownYears) - d3.min(knownYears) : "—");

  drawDistanceChart(catalog);
  drawTimeline(catalog);
  drawSizeChart(catalog);

  bindFilters("#timeline-filters", value => { timelineFilter = value; }, () => drawTimeline(catalog));
  bindFilters("#size-filters", value => { sizeFilter = value; }, () => drawSizeChart(catalog));
  d3.select("#clear-selection").on("click", () => updateSelection(null));
  d3.select("#data-error").property("hidden", true);
}

window.initializeMessierCatalog = initializeMessierCatalog;
window.addEventListener("scroll", hideTooltip, { passive: true });