from bs4 import BeautifulSoup as bs
import requests

#Creamos la clase Curso para guardar la información de los cursos
class Curso:
    def __init__(self, sigla, facultad):
        self.sigla = sigla
        self.nombre = ""
        self.facultad = facultad
        self.primer = False
        self.segundo = False

facultades = {"Escuela de Ingeniería": "IIC ICS",
              "Instituto de Ingeniería Matemática y Computacional": "IMT",
              "Facultad de Matemáticas": "MAT EYP",
              "Facultad de Ciencias Biológicas": "BIO",
              "Escuela de Gobierno": "GOB",
              "Instituto de Geografía": "GEO",
              "Instituto de Astrofísica": "AST"}
              

#Creamos la función se_cursa que recibe un semestre y un curso y retorna True si el curso se cursa
# en ese semestre y False en caso contrario. Además, la función modifica el objeto curso para
# guardar el nombre del curso.
#La función se conecta a la página de la UC y busca la información del curso
def se_cursa(semestre, curso):
    url = f"https://buscacursos.uc.cl/?cxml_semestre=2024-{semestre}&cxml_sigla={curso.sigla}"
    if semestre == 1:
        url = f"https://buscacursos.uc.cl/?cxml_semestre=2025-{semestre}&cxml_sigla={curso.sigla}"
    page = requests.get(url).text
    soup = bs(page, "html.parser")
    if soup.find_all('td', attrs={'class':'tooltipInfoCurso'}):
        curso.nombre = soup.find_all('td', 
                                    attrs={"style":"font-size:13px;text-align:left;"})[1].text
        return True
    return False

#Leemos las siglas de los cursos
with open("siglas.txt", "r") as f:
    aux = f.read().split("\n")

#Creamos una lista de cursos instanciando la clase Curso
cursos = []
for sigla in aux:
    for facultad in facultades:
        if sigla[:3] in facultades[facultad]:
            cursos.append(Curso(sigla, facultad))

#Iteramos sobre los cursos y los semestres para saber si se cursan en el primer o segundo semestre
for curso in cursos:
    for semestre in range(1, 3):
        if se_cursa(semestre, curso):
            if semestre == 1:
                curso.primer = True
            else:
                curso.segundo = True

#Guardamos la información en un archivo csv
with open("semestres.csv", "w", encoding="utf-8") as f:
    f.write("sigla,nombre,facultad,primer,segundo\n")
    for curso in cursos:
        if curso.nombre:
            f.write(f"{curso.sigla},{curso.nombre},{curso.facultad},{curso.primer},{curso.segundo}\n")