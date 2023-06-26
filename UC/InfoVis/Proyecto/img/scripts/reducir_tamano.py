from PIL import Image
import os

def reducir_tamano_imagen(ruta_entrada, ruta_salida, max_ancho, max_alto):
    imagen = Image.open(ruta_entrada)
    ancho, alto = imagen.size

    # Calcula la relación de aspecto
    relacion_aspecto = ancho / float(alto)

    # Redimensiona la imagen manteniendo la relación de aspecto
    if ancho > max_ancho or alto > max_alto:
        if relacion_aspecto > 1:
            nuevo_ancho = max_ancho
            nuevo_alto = int(max_ancho / relacion_aspecto)
        else:
            nuevo_alto = max_alto
            nuevo_ancho = int(max_alto * relacion_aspecto)
        imagen = imagen.resize((nuevo_ancho, nuevo_alto), Image.ANTIALIAS)

    # Guarda la imagen redimensionada en la ruta de salida
    imagen.save(ruta_salida)


for filename in os.listdir():
    name, extension = os.path.splitext(filename)
    file_ = name+extension
    print(file_)
    if extension in ['.jpg', '.png', '.jpeg']:
        reducir_tamano_imagen(file_, file_, 250, 250)
