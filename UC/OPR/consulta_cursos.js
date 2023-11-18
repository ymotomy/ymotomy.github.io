var facultades = {"Escuela de Ingeniería":
                                      {"IIC3413": "Implementación de Sistemas de Base de Datos",
                                       "IIC2714": "Fundamentos de Procesamiento de Imagenes",
                                       "IIC2222": "Teoria de Automatas y Lenguajes Formales",
                                       "IIC3783": "Procesamiento Avanzado de Imagenes",
                                       "IIC2283": "Diseño y Análisis de Algoritmos",
                                       "IIC3242": "Complejidad Computacional",
                                       "IIC3633": "Sistemas Recomendadores",
                                       "ICS3153": "Optimización Avanzada",
                                       "IIC2142": "Ingenieria de Software",
                                       "IIC3697": "Aprendizaje Profundo",
                                       "ICS113H": "Optimización-Honors",
                                       "IIC2733": "Modelos de Procesos"},

            "Instituto de Ingeniería Matemática y Computacional":
                                       {"IMT2112": "Algoritmos Paralelos en Computación Científica",
                                       "IMT3120": "Fundamentos Matemáticos de Ciencia de Datos",
                                       "IMT2115": "Control de Sistemas Lineales",
                                       "IMT2565": "Optimización Combinatorial",
                                       "IMT2113": "Análisis de Fourier Aplicado",
                                       "IMT2111": "Álgebra Lineal Numérica"},

            "Facultad de Matemáticas":
                                       {"EYP2427": "Minería de Datos e Inteligencia de Negocios",
                                       "EYP3307": "Modelos Lineales Generalizados",
                                       "EYP3437": "Análisis Multivariado",
                                       "MAT2605": "Cálculo Científico I",
                                       "EYP3907": "Series de Tiempo",
                                       "EYP2417": "Muestreo"},
                                       
            "Facultad de Ciencias Biológicas":
                                       {"BIO318E": "Principios de Dinámica Poblacional: Teoría y Aplicaciones",
                                       "BIO295A": "Seminario de Investigacion Departamental",
                                       "BIO110C": "Biología de Organismos y Comunidades",
                                       "BIO141C": "Biología de la Célula",
                                       "BIO231C": "Ecología"},

            "Escuela de Gobierno":   
                                     {"GOB3023": "Taller de Análisis Aplicado de Política Pública",
                                     "GOB3015": "Modelos de Decisión para Políticas Públicas"},

            "Instituto de Geografía":
                                       {"GEO202": "Sistemas de Información Geográfica",
                                       "GEO309": "Percepción Remota Satelital"},

            "Instituto de Astrofísica":
                                       {"AST0212": "Introducción al Análisis de Datos"}
}

function redirigir(sigla) {
    let link = "https://catalogo.uc.cl/index.php?tmpl=component&option=com_catalogo&view=programa&sigla="
    window.open(link + sigla)
}

function generarEnlace() {
    for (facultad of Object.keys(facultades)) {
        document.write('<div class="contenedor">');
        document.write('<div class="facultades">');
        
        document.write('<h2>' + facultad + '</h2>');
        siglas = Object.keys(facultades[facultad]);
        for (sigla of siglas) {
            curso = facultades[facultad][sigla]
            let text = sigla + " - " + curso 
            if (text.length <= 38) {
                document.write('<a name="' + sigla + '" onclick="redirigir(this.name)"><li>' + sigla + ' - ' + curso + '</li></a><br>');
            }
            else{
                document.write('<a name="' + sigla + '" onclick="redirigir(this.name)"><li>' + sigla + ' - ' + curso + '</li></a>'); 
            }};
        
            document.write("</div></div>");
}}