from PIL import Image, ImageDraw

def recortar_imagen_circular(imagen):
    # Abre la imagen
    im = Image.open(imagen)

    # Obtén las dimensiones de la imagen
    ancho, alto = im.size

    # Calcula el tamaño del cuadrado recortado
    if ancho > alto:
        diferencia = (ancho - alto) // 2
        cuadrado = (diferencia, 0, ancho - diferencia, alto)
    else:
        diferencia = (alto - ancho) // 2
        cuadrado = (0, diferencia, ancho, alto - diferencia)

    # Recorta la imagen en el cuadrado
    im = im.crop(cuadrado)


    # Crea una máscara en blanco del mismo tamaño que la imagen
    mascara = Image.new('L', im.size, 0)

    # Crea un objeto de dibujo en la máscara
    draw = ImageDraw.Draw(mascara)

    # Dibuja un círculo blanco en la máscara del mismo tamaño que la imagen
    draw.ellipse((0, 0, im.size[0], im.size[1]), fill=255)

    # Crea una nueva imagen recortando la original utilizando la máscara
    imagen_recortada = Image.new('RGBA', im.size)
    imagen_recortada.paste(im, mask=mascara)

    # Guarda la imagen recortada
    imagen_recortada.save((imagen[:-4] + '.png'), optimize=True, quality=40)

# Llama a la función con la ruta de la imagen que deseas recortar

for i in range(1, 111):
    recortar_imagen_circular(f'M{i}.jpg')