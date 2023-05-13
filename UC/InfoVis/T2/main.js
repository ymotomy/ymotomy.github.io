//VARIABLES CONSTANTES-----------------------------------------------------------------------------
HERRAMIENTAS_DATABASE =
  "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas.json";
TUPLAS_DATABASE =
  "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas_en_comun.csv";
const WIDTH = 800;
const HEIGHT = 600;
const MARGIN = {
  top: 70,
  bottom: 60,
  right: 40,
  left: 60,
};
const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;
const RADIOCIRCLE = 9;
const svg = d3.select("#vis").attr("width", WIDTH).attr("height", HEIGHT);
// COMPLETAR CON CÓDIGO JS y D3.JS NECESARIO

//FUNCIONES----------------------------------------------------------------------------------------
function parseo_csv(d) {
  return {
    nodo_1: parseInt(d.nodo_1),
    nodo_2: parseInt(d.nodo_2),
    usuarios_en_comun: parseInt(d.usuarios_en_comun),
  };
}

function posicion_circulo(id) {
  let circle = document.getElementById(id);
  let position = circle.getBBox();
  let x = position.x;
  let y = position.y;
  return [x + RADIOCIRCLE, y + RADIOCIRCLE];
}

//CONTENEDOR Y TEXTO-------------------------------------------------------------------------------
const contenedor = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.left} ${MARGIN.top})`);
svg
  .append("text")
  .attr("x", 20)
  .attr("y", 40)
  .text("Personas que utilizan acutalmente esta herramienta")
  .style("font-family", "Arial");
svg
  .append("text")
  .attr("x", 430)
  .attr("y", 580)
  .text("Personas que desean utilizar esta herramienta")
  .style("font-family", "Arial");

//FUNCION PRINCIPAL--------------------------------------------------------------------------------
function joinDeDatos(datos) {
  const csv = datos[0];
  const json = datos[1];

  //EJE Y------------------------------------------------------------------------------------------
  const max_y = d3.max(json, (d) => d.trabajando);
  const escalaY = d3
    .scaleLinear()
    .domain([0, max_y + 3000])
    .range([HEIGHTVIS, 0]);
  const ejeY = d3.axisLeft(escalaY);
  svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
    .call(ejeY)
    .selectAll("line")
    .attr("x1", WIDTHVIS)
    .attr("stroke-dasharray", "5")
    .attr("opacity", 0.5);

  //EJE X------------------------------------------------------------------------------------------
  const max_x = d3.max(json, (d) => d.desean);
  const escalaX = d3
    .scaleLinear()
    .domain([0, max_x + 3000])
    .range([0, WIDTHVIS]);
  const ejeX = d3.axisBottom(escalaX);
  svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${HEIGHTVIS + MARGIN.top})`)
    .call(ejeX)
    .selectAll("line")
    .attr("y1", -HEIGHTVIS)
    .attr("stroke-dasharray", "5")
    .attr("opacity", 0.5);

  //ESCALA DEL ANCHO DE LAS CONEXIONES-------------------------------------------------------------
  const max_ancho_conexion = d3.max(csv, (d) => d.usuarios_en_comun);
  const escalaConexion = d3
    .scaleLinear()
    .domain([0, max_ancho_conexion])
    .range([1, RADIOCIRCLE]);

  contenedor.raise();

  //AGREGAMOS LOS CIRCULOS-------------------------------------------------------------------------
  const categoria = {
    Lenguaje: "#8dd3c7",
    Tecnologias: "#feffb2",
    "Base de Datos": "#bfbbdb",
    Frameworks: "#fa8072",
  };

  contenedor
    .selectAll("rect")
    .data(json)
    .join("circle")
    .attr("cx", (d) => escalaX(d.desean))
    .attr("cy", (d) => escalaY(d.trabajando))
    .attr("r", RADIOCIRCLE)
    .attr("stroke", "black")
    .attr("fill", (d) => categoria[d.categoria])
    .attr("alt", (d) => d.name)
    .attr("id", (d) => d.id)
    .append("title")
    .text((d) => d.name);
  //AGREGAMOS LAS CONEXIONES-----------------------------------------------------------------------
  contenedor
    .selectAll("rect")
    .data(csv)
    .join("line")
    .attr("class", "conexion")
    .attr("x1", (d) => posicion_circulo(d.nodo_1)[0])
    .attr("y1", (d) => posicion_circulo(d.nodo_1)[1])
    .attr("x2", (d) => posicion_circulo(d.nodo_2)[0])
    .attr("y2", (d) => posicion_circulo(d.nodo_2)[1])
    .style("stroke-width", (d) => escalaConexion(d.usuarios_en_comun))
    .append("title")
    .text((d) => d.usuarios_en_comun);
  contenedor.selectAll("circle").raise();
  //No se me ocurrio como poder optimizar esto):
  svg
    .append("rect")
    .attr("x", 75)
    .attr("y", 80)
    .attr("width", 165)
    .attr("height", 115)
    .attr("rx", 0)
    .attr("ry", 0)
    .style("fill", "#8d786180");
  svg
    .append("circle")
    .attr("cx", 100)
    .attr("cy", 100)
    .attr("r", RADIOCIRCLE)
    .attr("stroke", "black")
    .attr("fill", categoria["Lenguaje"]);
  svg.append("text").attr("x", 120).attr("y", 105).text("Lenguaje");

  svg
    .append("circle")
    .attr("cx", 100)
    .attr("cy", 125)
    .attr("r", RADIOCIRCLE)
    .attr("stroke", "black")
    .attr("fill", categoria["Frameworks"]);
  svg.append("text").attr("x", 120).attr("y", 130).text("Frameworks");

  svg
    .append("circle")
    .attr("cx", 100)
    .attr("cy", 150)
    .attr("r", RADIOCIRCLE)
    .attr("stroke", "black")
    .attr("fill", categoria["Base de Datos"]);
  svg.append("text").attr("x", 120).attr("y", 155).text("Base de Datos");

  svg
    .append("circle")
    .attr("cx", 100)
    .attr("cy", 175)
    .attr("r", RADIOCIRCLE)
    .attr("stroke", "black")
    .attr("fill", categoria["Tecnologias"]);
  svg.append("text").attr("x", 120).attr("y", 180).text("Tecnologias");
}
////////////////////////////////////////////
////                                    ////
////          CODIGO A EJECUTAR         ////
////                                    ////
////////////////////////////////////////////
Promise.all([
  d3.csv(TUPLAS_DATABASE, parseo_csv),
  d3.json(HERRAMIENTAS_DATABASE),
])
  .then((datos) => {
    console.log(datos);
    joinDeDatos(datos);
  })
  .catch((error) => console.log(error));
