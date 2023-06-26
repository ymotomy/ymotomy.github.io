from PIL import Image
import os

if __name__ == '__main__':
    for filename in os.listdir():
        name, extension = os.path.splitext(filename)
        
        if extension in ['.jpg', '.png', '.jpeg']:
            picture = Image.open(filename)
            picture.save(filename, optimize=True, quality=30)
        