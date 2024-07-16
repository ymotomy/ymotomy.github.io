function redirigir(sigla) {
    let link = "https://catalogo.uc.cl/index.php?option=com_catalogo&view=cursoslist&Itemid=378&sigla="
    window.open(link + sigla)
}

function generarEnlace() {
    for (facultad of Object.keys(facultades)) {
        document.write('<div class="contenedor">');
        document.write('<div class="facultades" style="padding-left:40px; padding-right:17px">');
        
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