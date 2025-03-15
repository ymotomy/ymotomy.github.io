let dataset;
let filtered;

d3.csv("semestres.csv").then(function (data) {
    dataset = data;
    filtered = dataset; // Mostrar todo inicialmente
    generarEnlace();  // Llamar a la función con todos los datos al inicio
});

d3.select("#cursos").on('change', (event) => {
    let opcion = event.target.value;
    if (!dataset) return; // Asegurar que los datos están cargados
    
    if (opcion == "todos") {
        filtered = dataset;
    }
    if (opcion == "1er") {
        filtered = dataset.filter(d => d.primer == "True");
    }
    if (opcion == "2do") {
        filtered = dataset.filter(d => d.segundo == "True");
    }
    if (opcion == "ambos") {
        filtered = dataset.filter(d => d.primer == "True" && d.segundo == "True");
    }
    
    generarEnlace(); // Refrescar la vista con los datos filtrados
});