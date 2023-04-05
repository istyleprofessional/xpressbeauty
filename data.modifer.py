import csv
import json
from PIL import Image
import os

def convert_data_from_csv_to_json():
    json_file = []
    with open(r"C:\scrapping\canada barber\canadabarber.csv", newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            json_file.append({
                'product_name': row['Name'],
                'description': row['Description'].replace('\n', ''),
                'item_no': '',
                'sale_price': row['Sale price'],
                'regular_price': row['Regular price'],
                'category': row['Categories'],
                'image': row['Images'].replace('https://rektech.work/canadabarber/wp-content/uploads/2023/03', '/images'),
                'wholesale_price': row['Meta: wholesale_customer_wholesale_price'],
                'wholesale_sale_price': row['Meta: wholesale_customer_wholesale_sale_price']
            })
    with open('test_data.json', 'w', encoding="utf-8") as f:
        json.dump(json_file, f, ensure_ascii=False)

def convert_images_to_webp_in_json():
    f = open('test_data.json', encoding='utf-8')
    data = json.load(f)
    for d in data:
        d['image'] = f'''{d['image'].split('.')[0]}.webp'''

    with open('test_data.json', 'w', encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


def convert_images_to_webp_in_folder():
    path = r"C:\scrapping\canada barber"
    destination = r"F:\xpressbeauty\public\images"
    os.chmod(destination, 755)
    for file in os.listdir(path):
        if '.jpg' in file:
            image = Image.open(f'''{path}\{file}''')
            name = file.split('.')[0]
            image.save(f'''{destination}\{name}.webp''', format="webp") 

def add_quantity_on_hand_attr():
    f = open('test_data.json', encoding='utf-8')
    data = json.load(f)
    for d in data:
        d['quantity_on_hand'] = '' 

    with open('test_data.json', 'w', encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

def add_sku():
    f = open('test_data.json', encoding='utf-8')
    data = json.load(f)
    for d in data:
        d['sku'] = '' 

    with open('test_data.json', 'w', encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


add_sku()