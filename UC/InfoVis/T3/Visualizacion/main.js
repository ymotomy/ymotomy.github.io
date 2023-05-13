const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

// Editar tamaños como estime conveniente
const WIDTH1 = 700;
const HEIGHT1 = 400;
const WIDTH2 = 1100;
const HEIGHT2 = 1600;
const TIEMPO_TRANSICION = 800;

const margin = {
  top: 200,
  bottom: 30,
  left: 120,
  right: 30,
};

SVG1.attr("width", WIDTH1).attr("height", HEIGHT1);
SVG2.attr("width", WIDTH2).attr("height", HEIGHT2);
const circulos = SVG1.append("g")
  .attr("id", "circulo")
  .attr("transform", `translate(${0} ${0})`);
const petalo_p = SVG1.append("g")
  .attr("id", "petalo_p")
  .attr("transform", `translate(${0} ${margin.top})`);
const petalo_v = SVG1.append("g")
  .attr("id", "petalo_v")
  .attr("transform", `translate(${0} ${margin.top})`);
const centros = SVG1.append("g")
  .attr("id", "centro")
  .attr("transform", `translate(${0} ${margin.top})`);
const genero = SVG1.append("g")
  .attr("id", "genero")
  .attr("transform", `translate(${0} ${margin.top})`);
const leyenda1 = SVG1.append("g")
  .style("position", "absolute")
  .style("visibility", "hidden");
const fondo1 = leyenda1
  .attr("id", "leyenda1")
  .append("rect")
  .style("fill", "#d9ed92a9")
  .attr("stroke", "#113149")
  .attr("stroke-width", "1")
  .attr("width", 166)
  .attr("height", 70)
  .attr("rx", "4px");
const txt11 = leyenda1.append("text").attr("class", "txt");
const txt12 = leyenda1.append("text").attr("class", "txt");
const txt13 = leyenda1.append("text").attr("class", "txt");
const txt14 = leyenda1.append("text").attr("class", "txt");

function opacar_trebol(clase) {
  var elementos = ["Comedy", "Action", "Romance"];
  elementos = elementos.filter((trebol) => trebol != clase);
  d3.selectAll(`.${elementos[0]}`)
    .style("filter", "saturate(50%)")
    .style("opacity", "0.5");
  d3.selectAll(`.${elementos[1]}`)
    .style("filter", "saturate(50%)")
    .style("opacity", "0.5");
  d3.selectAll(`.${clase}`)
    .style("filter", "saturate(110%)")
    .style("opacity", "1");
}

function createClover(dataset) {
  const largo_petalo_p = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.MoviesCount)])
    .range([10, 50]);
  const ancho_petalo_p = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.MoviesCount)])
    .range([8, 20]);
  const largo_petalo_v = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.MoviesVoteAverage)])
    .range([10, 50]);
  const ancho_petalo_v = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.MoviesVoteAverage)])
    .range([8, 20]);
  const escalaPosicion = d3
    .scaleBand()
    .domain([0, 1, 2])
    .range([110, WIDTH1 + 110]);
  const escalaPosicionVertical = d3.scaleBand().domain([0, 1]).range([0, 400]);

  circulos
    .selectAll("circle")
    .data(dataset)
    .join("circle")
    .attr("class", (d, i) => d.Genre)
    .attr("cx", (d, i) => escalaPosicion(i % 3))
    .attr("cy", escalaPosicionVertical(1))
    .attr("r", 100)
    .attr("stroke", "#113149")
    .style("fill", "#00000000")
    .on("click", (event, d, i) => {
      opacar_trebol(d.Genre);
      preprocessingMoviesDataset(d.Genre, false);
    })
    .on("mouseover", function (event, d) {
      txt11.text(`Cantidad de Peliculas: ${d.MoviesCount}`);
      txt12.text(`Votos Promedios: ${d.MoviesVoteAverage}`);
      txt13.text(`Puntaje Promedio: ${d.AverageRating}`);
      txt14.text(`Duracion Promedio: ${d.AverageDuration}`);
      leyenda1.style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      txt11
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt12
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt13
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt14
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      fondo1
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda1.style("visibility", "hidden");
    });
  // https://jsfiddle.net/thatOneGuy/7NReF/36/

  centros
    .selectAll("circle")
    .data(dataset)
    .join("circle")
    .attr("class", (d, i) => d.Genre)
    .attr("cx", (d, i) => escalaPosicion(i % 3))
    .attr("cy", (d, i) => escalaPosicionVertical(0))
    .attr("r", 7)
    .style("fill", "#113149")
    .on("click", function (event, d) {
      opacar_trebol(d.Genre);
      preprocessingMoviesDataset(d.Genre, false);
    })
    .on("mouseover", function (event, d) {
      txt11.text(`Cantidad de Peliculas: ${d.MoviesCount}`);
      txt12.text(`Votos Promedios: ${d.MoviesVoteAverage}`);
      txt13.text(`Puntaje Promedio: ${d.AverageRating}`);
      txt14.text(`Duracion Promedio: ${d.AverageDuration}`);
      leyenda1.style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      txt11
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt12
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt13
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt14
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      fondo1
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda1.style("visibility", "hidden");
    });

  genero
    .selectAll("text")
    .data(dataset)
    .join("text")
    .attr("class", (d, i) => d.Genre)

    .attr("x", (d, i) => escalaPosicion(i % 3) - d["Genre"].length * 4.5)
    .attr("y", (d, i) => escalaPosicionVertical(0) + 150)
    .attr("text-decoration", "underline")
    .text((d) => d["Genre"]);

  petalo_p
    .selectAll("ellipse")
    .data(dataset)
    .join(
      (enter) =>
        enter
          .append("ellipse")
          .attr("class", (d, i) => d.Genre)
          .attr("cx", (d, i) => escalaPosicion(i % 3))
          .attr(
            "cy",
            (d) => escalaPosicionVertical(0) - largo_petalo_p(d.MoviesCount)
          )
          .attr("ry", (d) => largo_petalo_p(d.MoviesCount))
          .attr("rx", (d) => ancho_petalo_p(d.MoviesCount))
          .attr("fill", "#D9ED92")
          .attr("stroke", "#113149"),
      (update) =>
        update
          .transition()
          .duration(TIEMPO_TRANSICION)
          .attr(
            "cy",
            (d) => escalaPosicionVertical(0) - largo_petalo_p(d.MoviesCount)
          )
          .attr("ry", (d) => largo_petalo_p(d.MoviesCount))
          .attr("rx", (d) => ancho_petalo_p(d.MoviesCount)),
      (exit) => exit.remove()
    )
    .on("click", function (event, d) {
      opacar_trebol(d.Genre);
      preprocessingMoviesDataset(d.Genre, false);
    })
    .on("mouseover", function (event, d) {
      txt11.text(`Cantidad de Peliculas: ${d.MoviesCount}`);
      txt12.text(`Votos Promedios: ${d.MoviesVoteAverage}`);
      txt13.text(`Puntaje Promedio: ${d.AverageRating}`);
      txt14.text(`Duracion Promedio: ${d.AverageDuration}`);
      leyenda1.style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      txt11
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt12
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt13
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt14
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      fondo1
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda1.style("visibility", "hidden");
    });

  petalo_v
    .selectAll("ellipse")
    .data(dataset)
    .join(
      (enter) =>
        enter
          .append("ellipse")
          .attr("class", (d, i) => d.Genre)
          .attr("cx", (d, i) => escalaPosicion(i % 3))
          .attr(
            "cy",
            (d) =>
              largo_petalo_v(d.MoviesVoteAverage) + escalaPosicionVertical(0)
          )
          .attr("ry", (d) => largo_petalo_v(d.MoviesVoteAverage))
          .attr("rx", (d) => ancho_petalo_v(d.MoviesVoteAverage))
          .attr("fill", "#52B69A")
          .attr("stroke", "#113149"),
      (update) =>
        update
          .transition()
          .duration(TIEMPO_TRANSICION)
          .attr(
            "cy",
            (d) =>
              largo_petalo_v(d.MoviesVoteAverage) + escalaPosicionVertical(0)
          )
          .attr("ry", (d) => largo_petalo_v(d.MoviesVoteAverage))
          .attr("rx", (d) => ancho_petalo_v(d.MoviesVoteAverage)),
      (exit) => exit.remove()
    )
    .on("click", function (event, d) {
      opacar_trebol(d.Genre);
      preprocessingMoviesDataset(d.Genre, false);
    })
    .on("mouseover", function (event, d) {
      txt11.text(`Cantidad de Peliculas: ${d.MoviesCount}`);
      txt12.text(`Votos Promedios: ${d.MoviesVoteAverage}`);
      txt13.text(`Puntaje Promedio: ${d.AverageRating}`);
      txt14.text(`Duracion Promedio: ${d.AverageDuration}`);
      leyenda1.style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      txt11
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt12
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt13
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt14
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      fondo1
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda1.style("visibility", "hidden");
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////

const disco = SVG2.append("g")
  .attr("id", "disco")
  .style("position", "absolute")
  .style("z-index", "1")
  .attr("transform", `translate(${margin.left} ${margin.top})`);
const centro_disco = SVG2.append("g")
  .attr("id", "centro_disco")
  .style("position", "absolute")
  .style("z-index", "2")
  .attr("transform", `translate(${margin.left} ${margin.top})`);
const caratula = SVG2.append("g")
  .attr("id", "caratula")
  .style("position", "absolute")
  .style("z-index", "3")
  .attr("transform", `translate(${margin.left} ${margin.top})`);
const franja = SVG2.append("g")
  .attr("id", "franja")
  .style("position", "absolute")
  .style("z-index", "4")
  .attr("transform", `translate(${margin.left} ${margin.top})`);
const nombre = SVG2.append("g")
  .attr("id", "nombre")
  .style("position", "absolute")
  .style("z-index", "5")
  .attr("transform", `translate(${margin.left} ${margin.top})`);

const colorTipo = {
  tvMovie: "#ef476f",
  videoGame: "#ffd166",
  movie: "#06d6a0",
  short: "#118ab2",
};
const colorDisco = {
  Good: "#2a9d8f",
  Average: "#e9c46a",
  Bad: "#e76f51",
};

function titulo(txt) {
  if (txt.length > 10) {
    return txt.slice(0, 7) + "...";
  } else {
    return txt;
  }
}
function ancho_fondo2(textos) {
  const larger = d3.max(textos, (t) => t.length);
  return larger * 6.5 + 20;
}

function generador_id(TI, RY, TY, D) {
  const l1 = TI[0];
  const n1 = RY.toString()[2];
  const l2 = TY[0];
  const n2 = D.toString()[1];
  const l3 = TI[-1];
  const n3 = (
    Math.floor(RY.toString()[3]) + Math.floor(D.toString()[0])
  ).toString();
  return l1 + n1 + l2 + n2 + l3 + n3;
}

const leyenda2 = SVG2.append("g")
  .style("position", "absolute")
  .style("visibility", "hidden");
const fondo2 = leyenda2
  .attr("id", "leyenda2")
  .append("rect")
  .style("fill", "#d9ed92a9")
  .attr("stroke", "#113149")
  .attr("stroke-width", "1")
  .attr("height", 110)
  .attr("rx", "4px");
const txt21 = leyenda2.append("text").attr("class", "txt");
const txt22 = leyenda2.append("text").attr("class", "txt");
const txt23 = leyenda2.append("text").attr("class", "txt");
const txt24 = leyenda2.append("text").attr("class", "txt");
const txt25 = leyenda2.append("text").attr("class", "txt");
const txt26 = leyenda2.append("text").attr("class", "txt");
const txt27 = leyenda2.append("text").attr("class", "txt");

function createDVDs(dataset, genre, filter_dataset) {
  // Actualizo nombre de un H4 para saber el género seleccionado
  d3.selectAll("#selected").text(`Genre: ${genre} - Filter: ${filter_dataset}`);

  // FILTRO Y ORDEN
  //-------------------------------------------------------------------------------------------------
  //  "ORDER_BY" indica bajo qué atributo ordenar
  let ORDER_BY = document.getElementById("order-by").selectedOptions[0].value;
  // Filtramos los datos según el genero seleccionado
  var dataset = d3.filter(dataset, (d) => d.Genres.includes(genre));
  // Acotamos los datos a 30
  dataset = dataset.slice(0, 30);
  // Filtramos los datos según rating > 5
  if (filter_dataset) {
    dataset = d3.filter(dataset, (d) => d.Numeric_Rating > 5);
  }
  // ORDENAMOS Alfabeticamente
  if (ORDER_BY == "alphabetically") {
    dataset = dataset.sort((a, b) => {
      let TitleA = a.Title.toLowerCase();
      let TitleB = b.Title.toLowerCase();
      if (TitleA < TitleB) {
        return -1;
      }
      if (TitleA > TitleB) {
        return 1;
      }

      return 0;
    });
  }
  // ORDENAMOS por Fecha de estreno
  else if (ORDER_BY == "antiguedad") {
    dataset = dataset.sort((a, b) => {
      return a.Release_Year - b.Release_Year;
    });
  }
  console.log(dataset);

  //FUNCIONES Y CONSTANTES
  //-------------------------------------------------------------------------------------------------
  const radio_disco = 60;
  const cant_fila = 5;

  const escalaPosicionDisco = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4])
    .range([0, WIDTH2]);
  const escalaPosicionDiscoVertical = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5])
    .range([0, HEIGHT2]);

  const duracion = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.Duration)])
    .range([-(radio_disco - 15), -15]);

  //UBICACION Y CREACION DE FIGURAS
  //-------------------------------------------------------------------------------------------------
  disco
    .selectAll("circle")
    .data(dataset)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("r", radio_disco)
          .attr("fill", (d, i) => colorDisco[d.Category_Rating])
          .attr("stroke", "gray")
          .attr("cx", (d, i) => escalaPosicionDisco(i % cant_fila))
          .attr("cy", (d, i) =>
            escalaPosicionDiscoVertical(Math.trunc(i / cant_fila))
          ),
      (update) =>
        update
          .transition("update")
          .duration(TIEMPO_TRANSICION)
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("r", radio_disco)
          .attr("fill", (d, i) => colorDisco[d.Category_Rating])
          .attr("stroke", "gray")
          .attr("cx", (d, i) => escalaPosicionDisco(i % cant_fila))
          .attr("cy", (d, i) =>
            escalaPosicionDiscoVertical(Math.trunc(i / cant_fila))
          ),
      (exit) => exit.transition().duration(TIEMPO_TRANSICION).remove()
    )
    .on("mouseover", (event, d) => {
      const t1 = `Nombre: ${d.Title}`;
      txt21.text(t1);
      const t2 = `Tipo: ${d.Type}`;
      txt22.text(t2);
      const t3 = `Generos: ${d.Genres}`;
      txt23.text(t3);
      const t4 = `Estreno: ${d.Release_Year}`;
      txt24.text(t4);
      const t5 = `Duracion: ${d.Duration}`;
      txt25.text(t5);
      const t6 = `Rating Categoria: ${d.Category_Rating}`;
      txt26.text(t6);
      const t7 = `Rating: ${d.Numeric_Rating}`;
      txt27.text(t7);
      leyenda2.style("visibility", "visible");
      fondo2.attr("width", ancho_fondo2([t1, t2, t3, t4, t5, t6, t7]));
      d3.selectAll(
        `#${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
      ).attr("class", "T");
      d3.selectAll(`.F`).style("filter", "saturate(25%)");
    })
    .on("mousemove", function (event, d) {
      txt21
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt22
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt23
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt24
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      txt25
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 95 + "px");
      txt26
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 110 + "px");
      txt27
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 125 + "px");
      fondo2
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", (event, d) => {
      leyenda2.style("visibility", "hidden");
      d3.selectAll(`.T`).attr("class", "F");
      d3.selectAll(`.F`).style("filter", "saturate(100%)");
    });

  centro_disco
    .selectAll("circle")
    .data(dataset)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("r", (d) => -duracion(d.Duration))
          .attr("stroke", "black")
          .attr("stroke-width", "3")
          .style("fill", "white")
          .attr("cx", (d, i) => escalaPosicionDisco(i % cant_fila))
          .attr("cy", (d, i) =>
            escalaPosicionDiscoVertical(Math.trunc(i / cant_fila))
          ),
      (update) =>
        update
          .transition("update")
          .duration(TIEMPO_TRANSICION)
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("r", (d) => -duracion(d.Duration))
          .attr("stroke", "black")
          .attr("stroke-width", "3")
          .style("fill", "white")
          .attr("cx", (d, i) => escalaPosicionDisco(i % cant_fila))
          .attr("cy", (d, i) =>
            escalaPosicionDiscoVertical(Math.trunc(i / cant_fila))
          ),
      (exit) => exit.transition().duration(TIEMPO_TRANSICION).remove()
    )
    .on("mouseover", function (event, d) {
      const t1 = `Nombre: ${d.Title}`;
      txt21.text(t1);
      const t2 = `Tipo: ${d.Type}`;
      txt22.text(t2);
      const t3 = `Generos: ${d.Genres}`;
      txt23.text(t3);
      const t4 = `Estreno: ${d.Release_Year}`;
      txt24.text(t4);
      const t5 = `Duracion: ${d.Duration}`;
      txt25.text(t5);
      const t6 = `Rating Categoria: ${d.Category_Rating}`;
      txt26.text(t6);
      const t7 = `Rating: ${d.Numeric_Rating}`;
      txt27.text(t7);
      leyenda2.style("visibility", "visible");
      fondo2.attr("width", ancho_fondo2([t1, t2, t3, t4, t5, t6, t7]));
      d3.selectAll(
        `#${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
      ).attr("class", "T");
      d3.selectAll(`.F`).style("filter", "saturate(25%)");
    })
    .on("mousemove", function (event, d) {
      txt21
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt22
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt23
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt24
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      txt25
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 95 + "px");
      txt26
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 110 + "px");
      txt27
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 125 + "px");
      fondo2
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda2.style("visibility", "hidden");
      d3.selectAll(`.T`).attr("class", "F");
      d3.selectAll(`.F`).style("filter", "saturate(100%)");
    });

  caratula
    .selectAll("rect")
    .data(dataset, (d) => d.Title)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("width", radio_disco * 2)
          .attr("height", radio_disco * 2)
          .attr("fill", "white")
          .attr("stroke", "gray")
          .attr(
            "x",
            (d, i) => escalaPosicionDisco(i % cant_fila) - radio_disco * 2
          )
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) -
              radio_disco
          ),
      (update) =>
        update
          .transition("update")
          .duration(TIEMPO_TRANSICION)
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("width", radio_disco * 2)
          .attr("height", radio_disco * 2)
          .attr("fill", "white")
          .attr("stroke", "gray")
          .attr(
            "x",
            (d, i) => escalaPosicionDisco(i % cant_fila) - radio_disco * 2
          )
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) -
              radio_disco
          ),
      (exit) => exit.transition().duration(TIEMPO_TRANSICION).remove()
    )
    .on("mouseover", function (event, d) {
      const t1 = `Nombre: ${d.Title}`;
      txt21.text(t1);
      const t2 = `Tipo: ${d.Type}`;
      txt22.text(t2);
      const t3 = `Generos: ${d.Genres}`;
      txt23.text(t3);
      const t4 = `Estreno: ${d.Release_Year}`;
      txt24.text(t4);
      const t5 = `Duracion: ${d.Duration}`;
      txt25.text(t5);
      const t6 = `Rating Categoria: ${d.Category_Rating}`;
      txt26.text(t6);
      const t7 = `Rating: ${d.Numeric_Rating}`;
      txt27.text(t7);
      leyenda2.style("visibility", "visible");
      fondo2.attr("width", ancho_fondo2([t1, t2, t3, t4, t5, t6, t7]));
      d3.selectAll(
        `#${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
      ).attr("class", "T");
      d3.selectAll(`.F`).style("filter", "saturate(25%)");
    })
    .on("mousemove", function (event, d) {
      txt21
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt22
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt23
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt24
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      txt25
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 95 + "px");
      txt26
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 110 + "px");
      txt27
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 125 + "px");
      fondo2
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda2.style("visibility", "hidden");
      d3.selectAll(`.T`).attr("class", "F");
      d3.selectAll(`.F`).style("filter", "saturate(100%)");
    });

  franja
    .selectAll("rect")
    .data(dataset, (d) => d.Title)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("width", (radio_disco * 2) / 7)
          .attr("height", radio_disco * 2)
          .attr("fill", (d, i) => colorTipo[d.Type])
          .attr(
            "x",
            (d, i) => escalaPosicionDisco(i % cant_fila) - radio_disco * 2
          )
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) -
              radio_disco
          ),
      (update) =>
        update
          .transition("update")
          .duration(TIEMPO_TRANSICION)
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr("width", (radio_disco * 2) / 7)
          .attr("height", radio_disco * 2)
          .attr("fill", (d, i) => colorTipo[d.Type])
          .attr(
            "x",
            (d, i) => escalaPosicionDisco(i % cant_fila) - radio_disco * 2
          )
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) -
              radio_disco
          ),
      (exit) => exit.transition().duration(TIEMPO_TRANSICION).remove()
    )
    .on("mouseover", function (event, d) {
      const t1 = `Nombre: ${d.Title}`;
      txt21.text(t1);
      const t2 = `Tipo: ${d.Type}`;
      txt22.text(t2);
      const t3 = `Generos: ${d.Genres}`;
      txt23.text(t3);
      const t4 = `Estreno: ${d.Release_Year}`;
      txt24.text(t4);
      const t5 = `Duracion: ${d.Duration}`;
      txt25.text(t5);
      const t6 = `Rating Categoria: ${d.Category_Rating}`;
      txt26.text(t6);
      const t7 = `Rating: ${d.Numeric_Rating}`;
      txt27.text(t7);
      leyenda2.style("visibility", "visible");
      fondo2.attr("width", ancho_fondo2([t1, t2, t3, t4, t5, t6, t7]));
      d3.selectAll(
        `#${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
      ).attr("class", "T");
      d3.selectAll(`.F`).style("filter", "saturate(25%)");
    })
    .on("mousemove", function (event, d) {
      txt21
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt22
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt23
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt24
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      txt25
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 95 + "px");
      txt26
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 110 + "px");
      txt27
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 125 + "px");
      fondo2
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda2.style("visibility", "hidden");
      d3.selectAll(`.T`).attr("class", "F");
      d3.selectAll(`.F`).style("filter", "saturate(100%)");
    });

  nombre
    .selectAll("text")
    .data(dataset, (d) => d.Title)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr(
            "transform",
            (d, i) =>
              `rotate(-45 ${escalaPosicionDisco(i % cant_fila) - 75} ${
                escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) + 10
              })`
          )
          .text((d, i) => titulo(d.Title))
          .attr("x", (d, i) => escalaPosicionDisco(i % cant_fila) - 90)
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) + 20
          ),
      (update) =>
        update
          .transition("texto")
          .duration(TIEMPO_TRANSICION)
          .attr("class", "F")
          .attr(
            "id",
            (d) =>
              `${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
          )
          .attr(
            "transform",
            (d, i) =>
              `rotate(-45 ${escalaPosicionDisco(i % cant_fila) - 75} ${
                escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) + 10
              })`
          )
          .text((d, i) => titulo(d.Title))
          .attr("x", (d, i) => escalaPosicionDisco(i % cant_fila) - 90)
          .attr(
            "y",
            (d, i) =>
              escalaPosicionDiscoVertical(Math.trunc(i / cant_fila)) + 20
          ),
      (exit) =>
        exit
          .transition()
          .duration(TIEMPO_TRANSICION / 3)
          .remove()
    )
    .on("mouseover", function (event, d) {
      const t1 = `Nombre: ${d.Title}`;
      txt21.text(t1);
      const t2 = `Tipo: ${d.Type}`;
      txt22.text(t2);
      const t3 = `Generos: ${d.Genres}`;
      txt23.text(t3);
      const t4 = `Estreno: ${d.Release_Year}`;
      txt24.text(t4);
      const t5 = `Duracion: ${d.Duration}`;
      txt25.text(t5);
      const t6 = `Rating Categoria: ${d.Category_Rating}`;
      txt26.text(t6);
      const t7 = `Rating: ${d.Numeric_Rating}`;
      txt27.text(t7);
      leyenda2.style("visibility", "visible");
      fondo2.attr("width", ancho_fondo2([t1, t2, t3, t4, t5, t6, t7]));
      d3.selectAll(
        `#${generador_id(d.Title, d.Release_Year, d.Type, d.Duration)}`
      ).attr("class", "T");
      d3.selectAll(`.F`).style("filter", "saturate(25%)");
    })
    .on("mousemove", function (event, d) {
      txt21
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 35 + "px");
      txt22
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 50 + "px");
      txt23
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 65 + "px");
      txt24
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 80 + "px");
      txt25
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 95 + "px");
      txt26
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 110 + "px");
      txt27
        .attr("x", event.offsetX - 75 + "px")
        .attr("y", event.offsetY + 125 + "px");
      fondo2
        .attr("x", event.offsetX - 80 + "px")
        .attr("y", event.offsetY + 20 + "px");
    })
    .on("mouseout", () => {
      leyenda2.style("visibility", "hidden");
      d3.selectAll(`.T`).attr("class", "F");
      d3.selectAll(`.F`).style("filter", "saturate(100%)");
    });
}
