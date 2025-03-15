function redirigir(sigla) {
    let link = "https://catalogo.uc.cl/index.php?option=com_catalogo&view=cursoslist&Itemid=378&sigla="
    window.open(link + sigla)
}

function generarEnlace() {
    let contenedor = d3.select("#contenedor");
    contenedor.html(""); // Limpiar el contenido antes de actualizar

    // Agrupar cursos por facultad
    let facultadesMap = {};
    filtered.forEach(curso => {
        if (!facultadesMap[curso.facultad]) {
            facultadesMap[curso.facultad] = [];
        }
        facultadesMap[curso.facultad].push(curso);
    });

    // Crear contenedor por facultad y agregar cursos
    for (let facultad in facultadesMap) {
        // Se agrega la clase 'facultades' directamente para aplicar el CSS
        let facultadDiv = contenedor.append("div")
            .attr("class", "facultades")
            // .style("opacity", 0) // Inicialmente invisible
            // .transition().duration(500) // Transición de opacidad
            // .style("opacity", 1);

        // Título de la facultad
        facultadDiv.append("h2").text(facultad);

        // Lista de cursos
        let lista = facultadDiv.append("ul");

        // Se agrega la transición a los cursos
        let items = lista.selectAll("li")
            .data(facultadesMap[facultad], d => d.sigla);

        // Eliminar elementos que ya no están presentes
        items.exit().transition().duration(500).style("opacity", 0).remove();

        // Agregar los nuevos elementos con transición
        let enter = items.enter().append("li")
            .append("a")
            .attr("name", d => d.sigla)
            .attr("onclick", d => `redirigir('${d.sigla}')`)
            .text(d => `${d.sigla} - ${d.nombre}`)
            .style("opacity", 0)
            .transition().duration(500).style("opacity", 1);

        // Actualizar los elementos existentes
        items.transition().duration(500)
            .style("opacity", 1)
            .text(d => `${d.sigla} - ${d.nombre}`);
    }
}