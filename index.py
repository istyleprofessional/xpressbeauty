from PIL import Image
import os

# Path to the folder containing the images
folder_path = "./public/images"

# Loop through all the files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".webp"):
        img_path = os.path.join(folder_path, filename)
        img = Image.open(img_path)

        # Convert the image to RGBA format (if not already in that format)
        img = img.convert("RGBA")

        # Extract the alpha channel
        alpha = img.split()[-1]

        # Set a threshold on the alpha channel to create a binary mask
        mask = Image.eval(alpha, lambda a: 255 if a > 128 else 0)

        # Create a new image with a white background and the same size as the original image
        white_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))

        # Paste the original image onto the white background using the mask
        masked_img = Image.composite(img, white_bg, mask)

        # Save the masked image with the same filename as the original image
        masked_img.save(img_path)
