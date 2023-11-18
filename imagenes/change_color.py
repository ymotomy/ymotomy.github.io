from PIL import Image
import os

def new_path(path, color, carpeta=False):
    path = path.split("/")
    if not carpeta:
        path.insert(-1, color)
    else: 
        path[-1] = color
    return ("/").join(path)

def cambiar_color(path, color): 
    imagen = Image.open(path)
    datos_pixeles = imagen.getdata()
    print(datos_pixeles)
    nuevos_pixeles = [hex_to_rgba(color) if pixel != 0 else 0 for pixel in datos_pixeles]
    nueva_imagen = Image.new("RGBA", imagen.size)
    nueva_imagen.putdata(nuevos_pixeles)
    os.makedirs(new_path(path, color, carpeta=True), exist_ok=True)
    nueva_imagen.save(new_path(path, color))

def hex_to_rgba(hex_color):
    # Convierte el valor hexadecimal a RGBA
    rgba = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return rgba

if __name__ == "__main__":
    for imagen in os.listdir("imagenes"):
        tipo = imagen.split(".")[-1]
        if  tipo == "png":
            imagen = "imagenes/" + imagen
            color = "#125E8A"
            color = color.lstrip('#')
            cambiar_color(imagen, color)
