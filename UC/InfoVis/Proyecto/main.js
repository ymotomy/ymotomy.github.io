// CONSTANTES
const MARGIN = {
  top: 70,
  bottom: 70,
  left: 40,
  right: 60,
};

var color = {
  Galaxy: "#f72585",
  "Globular Cluster": "#00fff5",
  "Open Cluster": "#66FF00",
  Nebula: "#d00000",
  "Double star": "#FFD700",
  "Reiniciar Filtro": "white",
};

let object_type = null;
const TIEMPO_TRANSICION = 500;
// FUNCIONES ----------------------------------------------------------------------------------------------------------------------------

function select_Messier(M) {
  console.log(M);
  for (i = 1; i < 111; i++) {
    if (".M" + i != M) {
      d3.selectAll(`.M${i}`)
        .style("filter", "saturate(10%)")
        .style("opacity", "0.1");
    } else {
      d3.selectAll(M).style("filter", "saturate(100%)").style("opacity", "1");
    }
    d3.selectAll(`.line`)
      .style("filter", "saturate10%)")
      .style("opacity", "0.1");
  }
}

function reiniciarElementos() {
  var elementos = [
    "Galaxy",
    "Globular-Cluster",
    "Open-Cluster",
    "Nebula",
    "Double-star",
  ];
  for (let elemento of elementos) {
    d3.selectAll(`.${elemento}`)
      .style("filter", "saturate(100%)")
      .style("opacity", "1");
    d3.selectAll(`.line`)
      .style("filter", "saturate(100%)")
      .style("opacity", "1");
    d3.selectAll(`.img`)
      .style("filter", "saturate(100%)")
      .style("opacity", "1");
    info1.style("visibility", "hidden");
    object_type = null;
  }
}

function ParseoYear(year) {
  if (isNaN(year)) {
    return 1610;
  } else {
    return parseInt(year);
  }
}
function createClass(object) {
  if (object.includes(" ")) {
    return object.replace(" ", "-");
  } else {
    return object;
  }
}
function select_object(clase) {
  console.log(clase);
  var elementos = [
    "Galaxy",
    "Globular-Cluster",
    "Open-Cluster",
    "Nebula",
    "Double-star",
  ];
  elementos = elementos.filter((elemento) => elemento != clase);
  for (let elemento of elementos) {
  d3.selectAll(`.${elemento}`)
    .style("filter", "saturate(40%)")
    .style("opacity", "0.4");}
  d3.selectAll(`.${clase}`)
    .style("filter", "saturate(100%)")
    .style("opacity", "1");
}

// VISUALIZACION 1 ----------------------------------------------------------------------------------------------------------------------
let zoomActual = d3.zoomIdentity;
const radioTierra = 45;
const radioAstro = 50;

const WIDTH1info = 295,
  HEIGHT1info = 300,
  WIDTH1objects = 895,
  HEIGHT1objects = 300;

const SVG1info = d3.select("#vis-1").append("svg").attr("id", "info-1");
d3.select("#vis-1").append("svg").style("width", "20px");
const SVG1objects = d3.select("#vis-1").append("svg").attr("id", "objects-1");
SVG1info.attr("width", WIDTH1info).attr("height", HEIGHT1info);
SVG1objects.attr("width", WIDTH1objects).attr("height", HEIGHT1objects);

const contenedorImagenes = SVG1objects.append("g").attr("class", "img");
const contenedorEjeTiempo = SVG1objects.append("g");

SVG1info.append("g")
  .append("text")
  .attr("x", "10")
  .attr("y", "30")
  .text("Acerca de")
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .style("fill", "white");

const info1 = SVG1info.append("g").style("visibility", "hidden");
const info11 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "105")
  .attr("y", "30")
  .style("font-size", "20px")
  .style("font-weight", "bold"); //Messier
const info12 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "70"); //Common_Name
const info13 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "100"); //NGC
const info14 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "130"); //Year
const info15 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "160"); //OBject_Type
const info16 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "190"); //Constellation
const info17 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "220"); //Distance
const info18 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "250"); //Magnitude
const info19 = info1
  .append("text")
  .attr("class", "txt")
  .attr("x", "10")
  .attr("y", "280"); //Discoverer

function createVis1(dataset) {
  const escalaDistance = d3
    .scaleLog()
    .domain([
      d3.min(dataset, (d) => d.Distance),
      d3.max(dataset, (d) => d.Distance),
    ])
    .range([25, WIDTH1objects - MARGIN.left - MARGIN.right]);
  // Eje X
  const ejeX = d3.axisBottom(escalaDistance);
  contenedorEjeTiempo
    .attr("transform", `translate(${MARGIN.left}, ${HEIGHT1objects / 2 + 75})`)
    .call(ejeX);

  contenedorImagenes
    .selectAll("image")
    .data(dataset)
    .enter()
    .append("image")
    .attr("class", (d) => "img " + d.Messier)
    .attr("xlink:href", (d) => "img/" + d.Messier + ".png")
    .attr("x", (d, i) => escalaDistance(d.Distance))
    .attr("y", HEIGHT1objects / 2 - radioAstro * 1.5)
    .attr("width", radioAstro * 2)
    .attr("height", radioAstro * 2)
    .on("click", (event, d) => {
      select_Messier(`.${d.Messier}`);
      info1.style("visibility", "hidden");
      updateInfo(d);
    });

  function updateInfo(d) {
    info12.text(`${d.Name}`);
    info11.text(`${d.Messier}`);
    info13.text(`${d.NGC}`);
    info14.text(`Descubierto en: ${d.Year}`);
    info15.text(`Tipo de Objeto: ${d.Object_Type}`);
    info16.text(`Constelación: ${d.Constellation}`);
    info17.text(`Distancia: ${d.Distance} al`);
    info18.text(`Magnitud: ${d.Magnitude}`);
    info19.text(`Descubierto por: ${d.Discoverer}`);
    info1.style("visibility", "visible");
  }
  contenedorImagenes
    .append("image")
    .attr("xlink:href", "img/earth.png")
    .attr("class", "earth")
    .attr("x", 0) // Ajusta la posición horizontal de la imagen
    .attr("y", HEIGHT1objects / 2 - radioTierra * 1.5) // Ajusta la posición vertical de la imagen
    .attr("width", radioTierra * 2) // Ajusta el ancho de la imagen
    .attr("height", radioTierra * 2) // Ajusta la altura de la imagen
    .on("click", (event) => {
      reiniciarElementos();

      contenedorImagenes
        .selectAll("image")
        .style("filter", "saturate(100%)")
        .style("opacity", "1");
      info1.style("visibility", "hidden");
    });

  const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
    const escalaX = transformacion.k;
    const traslacionX = transformacion.x;

    // Aplicar la transformación solo en el eje X a las imágenes
    contenedorEjeTiempo.call(
      ejeX.scale(transformacion.rescaleX(escalaDistance))
    );
    contenedorImagenes
      .selectAll("image")
      .data(dataset)
      .attr("xlink:href", (d) => "img/" + d.Messier + ".png")
      .attr("x", (d) => escalaX * escalaDistance(d.Distance) + traslacionX)
      .attr("y", HEIGHT1objects / 2 - radioAstro * 1.5) // Mantener la posición vertical fija
      .attr("class", (d) => "img " + d.Messier);
    contenedorImagenes.select(".earth").attr("x", traslacionX); // Actualizar la posición horizontal según la traslación del zoom
  };

  // Inicializar Zoom
  const zoom = d3
    .zoom()
    .extent([
      [0, 0],
      [WIDTH1objects, HEIGHT1objects],
    ])
    .translateExtent([
      [0, 0],
      [WIDTH1objects, HEIGHT1objects],
    ])
    .scaleExtent([1, 150])
    .on("zoom", manejadorZoom);
  SVG1objects.call(zoom);
}

// VISUALIZACION 2 ----------------------------------------------------------------------------------------------------------------------
const WIDTH2 = 800,
  HEIGHT2 = 650,
  WIDTH2info = 295,
  HEIGHT2info = 250;

const SVG2 = d3.select("#vis-2").append("svg").attr("id", "gl");
SVG2.attr("width", WIDTH2).attr("height", HEIGHT2);
d3.select("#vis-2").append("svg").style("width", "20px");
const SVG2info = d3.select("#vis-2").append("svg").attr("id", "info-2");
SVG2info.attr("width", WIDTH2info).attr("height", HEIGHT2info);

const leyendaInfo = [
  "Galaxy",
  "Globular Cluster",
  "Open Cluster",
  "Nebula",
  "Double star",
  "Reiniciar Filtro",
];

const contenedor2 = SVG2.append("g").attr(
  "transform",
  `translate(${MARGIN.left} ${MARGIN.top})`
);

function createVis2(dataset) {
  dataset = dataset.sort((a, b) => {
    return ParseoYear(a.Year) - ParseoYear(b.Year);
  });

  function frecuenciaObjects(object) {
    objects[object] += 1;
    return objects[object];
  }

  //EJE Y------------------------------------------------------------------------------------------
  const escalaY = d3
    .scaleLinear()
    .domain([0, 40])
    .range([HEIGHT2 - 2 * MARGIN.bottom, 0]);
  const ejeY = d3.axisLeft(escalaY);
  SVG2.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
    .call(ejeY)
    .selectAll("line")
    .attr("x1", WIDTH2 - 2 * MARGIN.left)
    .attr("stroke-dasharray", "5")
    .attr("opacity", 0.4);

  // EJE X------------------------------------------------------------------------------------------
  const escalaX = d3
    .scaleLinear()
    .domain([
      d3.min(dataset, (d) => ParseoYear(d.Year)),
      d3.max(dataset, (d) => ParseoYear(d.Year)),
    ])
    .range([0, WIDTH2 - 2 * MARGIN.left]);
  const ejeX = d3.axisBottom(escalaX);
  SVG2.append("g")
    .attr(
      "transform",
      `translate(${MARGIN.left}, ${MARGIN.top + HEIGHT2 - 2 * MARGIN.bottom})`
    )
    .call(ejeX)
    .selectAll("line")
    .attr("y1", -(HEIGHT2 - 2 * MARGIN.bottom))
    .attr("stroke-dasharray", "5")
    .attr("opacity", 0.4);

  contenedor2.raise();
  //AGREGAMOS LOS CIRCULOS-------------------------------------------------------------------------
  var objects = {
    Galaxy: 0,
    "Globular Cluster": 0,
    "Open Cluster": 0,
    Nebula: 0,
    "Double star": 0,
  };
  contenedor2
    .selectAll("rect")
    .data(dataset)
    .join("circle")
    .attr("r", 3)
    .attr("class", (d) => d.Messier + " " + createClass(d.Object_Type))
    .attr("fill", (d) => color[d.Object_Type])
    .attr("cx", (d) => escalaX(ParseoYear(d.Year)))
    .attr("cy", (d) => escalaY(frecuenciaObjects(d.Object_Type)))
    .append("title")
    .text((d) => d.Messier);
  //AGREGAMOS LAS LINEAS---------------------------------------------------------------------------
  var objects = {
    Galaxy: 0,
    "Globular Cluster": 0,
    "Open Cluster": 0,
    Nebula: 0,
    "Double star": 0,
  };
  var line = d3
    .line()
    .x((d) => escalaX(ParseoYear(d.Year)))
    .y((d) => escalaY(frecuenciaObjects(d.Object_Type)))
    .curve(d3.curveLinear);

  var keys = Object.keys(objects);
  for (var i = 0; i < keys.length; i++) {
    contenedor2
      .append("path")
      .data([dataset.filter((d) => d.Object_Type == keys[i])])
      .attr("d", line)
      .attr("class", "line " + createClass(keys[i]))
      .attr("stroke", color[keys[i]])
      .attr("fill", "transparent")
      .attr("stroke-width", 3);
  }
  //AGREGAMOS LOS LABELS---------------------------------------------------------------------------
  SVG2.append("text")
    .attr("x", 20)
    .attr("y", 40)
    .text("Cantidad de Objetos")
    .style("font-family", "Jost")
    .attr("fill", "white");
  SVG2.append("text")
    .attr("x", WIDTH2 - 200)
    .attr("y", 620)
    .text("Año de Descubrimiento")
    .style("font-family", "Jost")
    .attr("fill", "white");

  //AGREGAMOS LA LEYENDA---------------------------------------------------------------------------
  SVG2info.selectAll("circle")
    .data(leyendaInfo)
    .join("circle")
    .attr("id", (d, i) => "circle2")
    .attr("class", (d) => createClass(d))
    .attr("r", 8)
    .attr("cx", 20)
    .attr("cy", (d, i) => 70 + i * 30)
    .attr("fill", (d) => color[d])
    .on("click", (event, d) => {
      console.log(d);
      if (d == "Reiniciar Filtro") {
        reiniciarElementos();
      } else {
        select_object(createClass(d));
        object_type = d;
      }
    });

  SVG2info.selectAll("text")
    .data(leyendaInfo)
    .join("text")
    .attr("x", 40)
    .attr("y", (d, i) => 75 + i * 30)
    .text((d) => d)
    .style("font-family", "Jost")
    .attr("fill", "white");

  SVG2info.append("g")
    .append("text")
    .attr("x", 15)
    .attr("y", 30)
    .html("Selecciona un color para resaltar los")
    .attr("fill", "white")
    .append("tspan")
    .attr("x", 15)
    .attr("dy", "1.2em")
    .text("objetos de ese tipo")
    .attr("fill", "white");
}

// VISUALIZACION 3 ----------------------------------------------------------------------------------------------------------------------
const WIDTH3 = 1200,
  HEIGHT3 = 900;
const forceStrength = 0.03;

const SVG3 = d3.select("#vis-3").append("svg").attr("id", "cp");
SVG3.attr("width", WIDTH3).attr("height", HEIGHT3);
const contenedor3 = SVG3.append("g").attr("class", "img");
contenedor3.append("g");
function createVis3(dataset, type) {
  // object_type = type;
  if (type != "none") {
    dataset = d3.filter(dataset, (d) => d.Object_Type.includes(type));
  }

  const rmin = d3.min(dataset, (d) => d.Dimensions);
  const rmax = d3.max(dataset, (d) => d.Dimensions);
  const escalaRadio = d3
    .scaleLog()
    .domain([rmin, rmax])
    .range([10, 50])
    .clamp(true);

  function charge(d) {
    return Math.pow(escalaRadio(d.Dimensions), 2.0) * 0.01;
  }

  contenedor3
    .selectAll("pattern")
    .data(dataset, (d) => d.Messier)
    .join(
      (enter) =>
        enter
          .append("pattern")
          .attr("id", (d) => "img" + d.Messier)
          .attr("class", (d) => d.Messier + " " + createClass(d.Object_Type))
          .attr("width", "1")
          .attr("height", "1")
          .attr("patternUnits", "objectBoundingBox")
          .append("image")
          .attr("href", (d) => "img/" + d.Messier + ".png")
          .attr("width", (d) => 2 * escalaRadio(d.Dimensions))
          .attr("height", (d) => 2 * escalaRadio(d.Dimensions))
          .transition()
          .duration(TIEMPO_TRANSICION),
      (update) =>
        update
          .attr("id", (d) => "img" + d.Messier)
          .attr("class", (d) => d.Messier + " " + createClass(d.Object_Type))
          .attr("width", "1")
          .attr("height", "1")
          .attr("patternUnits", "objectBoundingBox")
          .append("image")
          .attr("href", (d) => "img/" + d.Messier + ".png")
          .attr("width", (d) => 2 * escalaRadio(d.Dimensions))
          .attr("height", (d) => 2 * escalaRadio(d.Dimensions))
          .transition()
          .duration(TIEMPO_TRANSICION),
      (exit) => exit.remove()
    )
    .on("click", (event, d) => select_object(createClass(d.Object_Type)));

  var node = contenedor3
    .select("g")
    .selectAll("circle")
    .data(dataset, (d) => d.Messier)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", (d) => d.Messier + " " + createClass(d.Object_Type))
          .attr("r", (d) => escalaRadio(d.Dimensions))
          .attr("cx", WIDTH3 / 2)
          .attr("cy", HEIGHT3 / 2)
          .attr("fill", (d) => "url(#img" + d.Messier + ")")
          .attr("stroke", (d) => color[d.Object_Type])
          .style("stroke-width", 2),
      (update) =>
        update
          .attr("class", (d) => d.Messier + " " + createClass(d.Object_Type))
          .attr("r", (d) => escalaRadio(d.Dimensions))
          .attr("cx", WIDTH3 / 2)
          .attr("cy", HEIGHT3 / 2)
          .attr("fill", (d) => "url(#img" + d.Messier + ")")
          .attr("stroke", (d) => color[d.Object_Type])
          .style("stroke-width", 2),
      (exit) => exit.remove()
    )
    .on("click", (event, d) => select_object(createClass(d.Object_Type)))
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  const simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody().strength(charge))
    .force(
      "center",
      d3
        .forceCenter()
        .x(WIDTH3 / 2)
        .y(HEIGHT3 / 2)
    )
    .force(
      "x",
      d3
        .forceX()
        .strength(0)
        .x(WIDTH3 / 2)
    )
    .force(
      "y",
      d3
        .forceY()
        .strength(0)
        .y(HEIGHT3 / 2)
    )
    .force(
      "collision",
      d3.forceCollide().radius((d) => escalaRadio(d.Dimensions) + 4)
    );

  simulation.nodes(dataset).on("tick", function (d) {
    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  });

  // What happens when a circle is dragged?
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0.1);
    d.fx = null;
    d.fy = null;
  }
  const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
    contenedor3.attr("transform", transformacion);
  };

  // Inicializar Zoom
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .extent([
      [0, 0],
      [WIDTH3, HEIGHT3],
    ])
    .translateExtent([
      [0, 0],
      [WIDTH3, HEIGHT3],
    ])
    .on("zoom", manejadorZoom);
  SVG3.call(zoom);
}

d3.selectAll(".txt").style("fill", "white");
