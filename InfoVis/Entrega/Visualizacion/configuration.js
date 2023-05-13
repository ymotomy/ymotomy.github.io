////////////////////////////
// NO EDITAR ESTE ARCHIVO //
////////////////////////////
const MoviesURL = 'https://gist.githubusercontent.com/Hernan4444/f24064016a4ae5e52256082006fd3a5f/raw/dc94ce27ed6fd00ee83a26da2eaecd1bb5ea6ce1/movies.json';

function generateDataset() {
    return [
        {
            "Genre": "Comedy",
            "MoviesCount": Math.round(Math.random() * 1000 + 10),
            "MoviesVoteAverage": Math.round(Math.random() * 500 + 10),
            "AverageRating": Math.round((Math.random() * 9 + 1)*100)/100,
            "AverageDuration": Math.round(Math.random() * 180 + 10),
        },
        {
            "Genre": "Romance",
            "MoviesCount": Math.round(Math.random() * 1000 + 10),
            "MoviesVoteAverage": Math.round(Math.random() * 500 + 10),
            "AverageRating": Math.round((Math.random() * 9 + 1)*100)/100,
            "AverageDuration": Math.round(Math.random() * 180 + 10),
        },
        {
            "Genre": "Action",
            "MoviesCount": Math.round(Math.random() * 1000 + 10),
            "MoviesVoteAverage": Math.round(Math.random() * 500 + 10),
            "AverageRating": Math.round((Math.random() * 9 + 1)*100)/100,
            "AverageDuration": Math.round(Math.random() * 180 + 10),
        }
    ]
}

// Cada vez que se oprima el botón se genera datos aletorios
// por catgoría. Luego cargamos nuevamente la visualización.
d3.select("#generate-data")
    .on("click", () => {
        // Dataset ficticio para evaluar transiciones en tamaño
        createClover(generateDataset())
    })

/* Cada vez que se seleccione un género, esta función será llamada
para actualizar la segunda visualización */
let DATASET_MOVIES = [];
function preprocessingMoviesDataset(genre, filter_dataset) {
    opacar_trebol(genre)
    // Si la lista de datos está vacía, descargo el dataset
    // y lo guardo en mi variable externa "DATASET_MOVIES".
    if (DATASET_MOVIES.length == 0) {
        d3.json(MoviesURL).then(dataset => {
            // Como no pongo let antes, sobrescribo la variable anterior.
            DATASET_MOVIES = dataset;
            // Llamo de nuevo a preprocessingMoviesDataset 
            // para que ahora si se ejecute cuando DATASET_MOVIES tenga datos
            preprocessingMoviesDataset(genre, filter_dataset)
        })
        // Hacemos return para que la función no continue su ejecución
        return 0;
    }

    let data = JSON.parse(JSON.stringify(DATASET_MOVIES));

    // Cada vez que se oprime filtrar, se llama nuevamente
    // a preprocessingMoviesDataset con filtro=true
    d3.select("#filter-rating").on("click", (event) => {
        preprocessingMoviesDataset(genre, true);
    })

    // Cada vez que se oprime Restaurar filtro, se llama nuevamente
    // a preprocessingMoviesDataset con filtro=false
    d3.select("#filter-reset").on("click", (event) => {
        preprocessingMoviesDataset(genre, false);
    })

    // Cada vez que cambia el selector de orden, se llama nuevamente
    // a createDVDs para que actualice la visualización
    d3.select("#order-by").on("change", (event) => {
        createDVDs(data, genre, filter_dataset);
    })

    // Llamamos a la segunda función encargada de crear los datos
    createDVDs(data, genre, filter_dataset);
}

// Cargamos primera ver la visualización con datos fijos
createClover(generateDataset())

d3.select("#showCat1").on("click", () => preprocessingMoviesDataset("Comedy", false));
d3.select("#showCat2").on("click", () => preprocessingMoviesDataset("Romance", false));
d3.select("#showCat3").on("click", () => preprocessingMoviesDataset("Action", false));

