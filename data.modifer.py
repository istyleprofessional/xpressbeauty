import csv
import json
import re
import time
# from PIL import Image
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import requests
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


def run_chrome():

    chrome_options = Options()
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
    service = Service(ChromeDriverManager(
        version='117.0.5938.88',
    ).install())
    driver = webdriver.Chrome(service=service,options=chrome_options)
    return driver


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


def create_images_responsive():
    max_widths = [1200, 800, 500]
    for file_name in os.listdir('./public/images'):
        image_path = f'''./public/images/{file_name}'''
        with Image.open(image_path) as image:
            original_width, original_height = image.size
            file_name = file_name.split('.')[0]
            for max_width in max_widths:
                if original_width > max_width:
                    width_percent = max_width / original_width
                    new_width = int(original_width * width_percent)
                    new_height = int(original_height * width_percent)
                    resized_image = image.resize(
                        (new_width, new_height), Image.ANTIALIAS)
                    resized_image.save(
                        f'''./public/images/{file_name}-{max_width}.webp''')


def adjust_all_images_names():
    driver = run_chrome()
    f = open('unique_products.json', encoding='utf-8')
    data = json.load(f)
    final_data = []
    for d in data:
        folder_name = re.sub('[^A-Za-z0-9]+', '',
                             d['product_name']).replace(' ', '-')
        if not os.path.exists(f'''./public/products-images-2/{folder_name}'''):
            os.makedirs(f'''./public/products-images-2/{folder_name}''')
        try:
            driver.get('https://www.shopempire.ca/')
            driver.find_element(
                By.XPATH, '//input[@class="search-bar__input"]').send_keys(d['product_name'])
            driver.find_element(
                By.XPATH, '//form[@class="search-bar"]').submit()
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, 'lxml')
            products_list = soup.find('div', class_="product-list")
            product_item = products_list.find_all('div', class_="product-item")
        except:
            try:
                driver.get('https://www.empirebarber.ca/')
                driver.find_element(
                    By.XPATH, '//input[@class="search-bar__input"]').send_keys(d['product_name'])
                driver.find_element(
                    By.XPATH, '//form[@class="search-bar"]').submit()
                time.sleep(2)
                soup = BeautifulSoup(driver.page_source, 'lxml')
                products_list = soup.find('div', class_="product-list")
                product_item = products_list.find_all(
                    'div', class_="product-item")
            except Exception as e:
                print(e)
                continue

        for item in product_item:
            product_title = item.find('a', class_="product-item__title").text
            if (d['product_name'] == product_title):
                imgs = item.find_all('img')
                d['imgs'] = []
                for i, img in enumerate(imgs):
                    try:
                        srcs = img['data-srcset'].split(',')
                        data_widths = eval(img['data-widths'])
                        d['data_widths'] = data_widths
                        unique = img['class'][0].split('__')[1]
                        for src in srcs:
                            width = src.lstrip().split(' ')[1]
                            img_data = requests.get(
                                f'''https:{src.lstrip()}''').content
                            with open(f'''./public/products-images-2/{folder_name}/{unique}-{width}.webp''', 'wb') as handler:
                                handler.write(img_data)
                            d['imgs'].append(
                                f'''/products-images-2/{folder_name}-{width}-{i}-{unique}.webp''')
                    except:
                        continue
                final_data.append(d)
                with open('data.json', 'w') as f:
                    json.dump(final_data, f)


def check_empty_folders_in_image_folder():
    for file_name in os.listdir('./public/images'):
        if os.path.isdir(f'''./public/images/{file_name}'''):
            if not os.listdir(f'''./public/images/{file_name}'''):
                print(file_name)


def unique_products():
    for folder in os.listdir('./public/products-images'):
        for file in os.listdir(f'''./public/products-images/{folder}'''):
            if file.split('-')[0] == 'unique':
                print(file)


def delete_images_attr():
    with open('./data.json') as f:
        data = json.load(f)
    for d in data:
        del d['image']
    with open('data_1.json', 'w') as f:
        json.dump(data, f)


def keep_trimmers_clippers():
    with open('./backups/products.json', encoding='utf-8') as f:
        data = json.load(f)
    final_data = []
    for d in data:
        if 'trimmer' in d['category'].lower() or 'clipper' in d['category'].lower():
            final_data.append(d)
    with open('data_1.json', 'w') as f:
        json.dump(final_data, f)


def add_brand_to_products():
    driver = run_chrome()
    f = open('data_1.json', encoding='utf-8')
    data = json.load(f)
    final_data = []
    source = ""
    for d in data:
        driver.get('https://www.shopempire.ca/')
        try:
            driver.find_element(
                By.XPATH, '//input[@class="search-bar__input"]').send_keys(d['product_name'])
            driver.find_element(
                By.XPATH, '//form[@class="search-bar"]').submit()
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, 'lxml')
            products_list = soup.find('div', class_="product-list")
            product_item = products_list.find_all('div', class_="product-item")
            source = "https://www.shopempire.ca"
        except:
            try:
                driver.get('https://www.empirebarber.ca/')
                driver.find_element(
                    By.XPATH, '//input[@class="search-bar__input"]').send_keys(d['product_name'])
                driver.find_element(
                    By.XPATH, '//form[@class="search-bar"]').submit()
                time.sleep(2)
                soup = BeautifulSoup(driver.page_source, 'lxml')
                products_list = soup.find('div', class_="product-list")
                product_item = products_list.find_all(
                    'div', class_="product-item")
                source = "https://www.empirebarber.ca"
            except Exception as e:
                print(e)
                continue

        for item in product_item:
            product_title = item.find('a', class_="product-item__title")
            if (d['product_name'] == product_title.text):
                try:
                    driver.get(f'''{source}{product_title['href']}''')
                    brand = driver.find_element(
                        By.XPATH, '//div[@class="product-meta__reference"]').text
                    d['brand'] = brand
                    final_data.append(d)
                except:
                    continue
        with open('data_2.json', 'w') as f:
            json.dump(final_data, f)


def get_all_unique_brands_from_product_file():
    f = open('./backups/product-data-4.json', encoding='utf-8')
    data = json.load(f)
    brands = []
    for d in data:
        brands.append(d['companyName'])
    brands = list(set(brands))
    with open('brands.json', 'w') as f:
        json.dump(brands, f)


def get_all_unique_categories_from_product_file():
    f = open('./backups/products-data.json', encoding='utf-8')
    data = json.load(f)
    categories = set()

    for d in data:
        category = d['category'].split(',')[1].strip()
        categories.add((category, d['category'].split(',')[0].strip()))

    categories_list = [{'name': category[0], 'main': category[1]}
                       for category in categories]

    with open('categories.json', 'w') as f:
        json.dump(categories_list, f)


def get_id_for_each_variation():
    driver = run_chrome()
    f = open('./backups/products-data.json', encoding='utf-8')
    data = json.load(f)
    for d in data:
        if 'variations' in d:
            driver.get(f'''https://www.cosmoprofbeauty.ca/''')
            driver.implicitly_wait(10)
            # time.sleep(10)
            search_input = driver.find_element(
                By.XPATH, '//input[@class="nav-search-input"]')
            search_input.send_keys(d['product_name'])


def add_product_price():
    f = open(
        'F:/xpress_beauty/xpress_beauty/backups/products-data-2.json', encoding='utf-8')
    data = json.load(f)
    try:
        for d in data:
            if 'Hair' in d['category']:
                url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67',
                    'cookie': "_gcl_aw=GCL.1685118180.CjwKCAjwscGjBhAXEiwAswQqNOii9os3IlRhx4ZZ-PCdrwNoroz9U-A564RdOBSehOWd8oC_XJUKvBoCaVgQAvD_BwE; _gcl_dc=GCL.1685118180.CjwKCAjwscGjBhAXEiwAswQqNOii9os3IlRhx4ZZ-PCdrwNoroz9U-A564RdOBSehOWd8oC_XJUKvBoCaVgQAvD_BwE; _gac_UA-5524974-27=1.1685118181.CjwKCAjwscGjBhAXEiwAswQqNOii9os3IlRhx4ZZ-PCdrwNoroz9U-A564RdOBSehOWd8oC_XJUKvBoCaVgQAvD_BwE; _pxhd=5d83a582cafe4fc5a0cc9c40660e685ec81438bd08bc10a9c4b8fd4a2552485b:8be490b5-1ce4-11ee-bdcc-0fb4e2c02927; _gcl_au=1.1.1931615855.1688747844; _fbp=fb.1.1688747844366.1885430396; __cq_uuid=ac0cjm5TENOJleEqa8op1oQajN; _pxvid=8be490b5-1ce4-11ee-bdcc-0fb4e2c02927; QuantumMetricUserID=8c9059b697fa8292710373015a84a84d; loginRememberMe=false; _gid=GA1.2.945417200.1688997545; QuantumMetricSessionID=830a90bf216879d2e6f676af032cdab7; dwanonymous_60557644c23bbf654391d7a2f0c3d5b5=acHtUnn4RAKBkcUpOm5RruVDaa; cqcid=acHtUnn4RAKBkcUpOm5RruVDaa; __cq_dnt=0; dw_dnt=0; pxcts=3e990ea4-1f49-11ee-9aba-77496e634572; dwsid=FrJIS_ey8w024XpB72fYhZ_XbXdAizLqBscB2VM7eBgxS5o1Pi139C3SCufdOmPj_p6uNcJjEzsGZixR-3suMA==; dwac_ba948fb989cc8c4ca46cbdd013=Uke5RhCBJTlAMTf7ZgAvSngnmf_aJZcqnAk%3D|dw-only|03156718|SCHAL-Sourcecode|CAD|false|US%2FCentral|true; cquid=xHV5ST02Wrha5zkDodyTlqmlsYP24yDmm/UicVbFR7U=|ed76c39713bee3f7bb2dfc7ee8a2c7f6c660598ed635de775b881c9cecd8768b|ed76c39713bee3f7bb2dfc7ee8a2c7f6c660598ed635de775b881c9cecd8768b; sid=XNha-_DzkmklgcDWFgDVONW9f8dHylOOFac; __cq_bc=%7B%22bdjl-CosmoProf-CA%22%3A%5B%7B%22id%22%3A%22CAN-013869%22%7D%2C%7B%22id%22%3A%22CAN-M-703007%22%7D%2C%7B%22id%22%3A%22CAN-M-046052%22%7D%2C%7B%22id%22%3A%22CAN-M-635020%22%7D%2C%7B%22id%22%3A%22CAN-M-662098%22%2C%22sku%22%3A%22CAN-019868%22%7D%2C%7B%22id%22%3A%22CAN-M-813010%22%2C%22sku%22%3A%22CAN-815700%22%7D%5D%7D; _ga_KRX40SQC5X=GS1.1.1689011007.1.1.1689011979.0.0.0; _ga=GA1.2.1661309140.1689011008; __cq_seg=0~0.64!1~0.11!2~-0.06!3~0.39!4~-0.17!5~0.08!6~0.54!7~-0.07!8~0.28!9~0.03; _px3=c9d3b4241b6e100555ec297703f6db6bb385aa2102cedb8cd094efbc76b07f2d:nT7vrh7/MRYmoLqRhS2wRxN+XEL+F8yxjxr4/CTId2+KcoWUGjKZBAo3+2ufPzBIkViGehdMwE7ORKhg78EhTg==:1000:HVOzH8SrW5tFw2A5ViK+y84rL8O7t4t8LHm/dX5atf7bKaqp7OBmWbGI+xhrD/u7QcxnccCUyx1betkqzfmaz46iaTtAxq4L8nBr6VxnkC1hOsuVbkm0tSZDFV3LElqsQDdmNwv3/rCAwaty/xt25YTKGqR+kpAbLKtY1EE0SAAkdX++Q4JNY7VuqNvFu4NYeVKiALg46srzTgYCUnZVFA=="
                }
                response = requests.get(url, headers=headers)
                res = response.json()
                time.sleep(5)
                if res['product']['price']['type'] == "range":
                    d['price'] = f'''${res['product']['price']['min']['sales']['value']}-${res['product']['price']['max']['sales']['value']}'''
                else:
                    d['price'] = f'''${res['product']['price']['list']['value']}'''
                if 'variations' in d:
                    for variation in d['variations']:
                        if 'variation_id' in variation:
                            url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variation['variation_id']}&quantity=undefined'''
                            response = requests.get(url, headers=headers)
                            time.sleep(5)
                            res = response.json()
                            variation['price'] = res['product']['price']['list']['value']
                print(d)
        with open('data_3.json', 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(e)
        with open('data_3.json', 'w') as f:
            json.dump(data, f)

        # print(response.json())


def make_mainPrice_not_string():
    with open('F:/xpress_beauty/xpress_beauty/file.json', encoding='utf-8') as f:
        data = json.load(f)
    try:
        for d in data:
            if 'price' in d:
                if ('-' in d['price'] or d['price'] == '$null'):
                    d['priceType'] = 'range'
                    continue
                prices = float(d['price'].replace('$', ''))
                d['price'] = format(prices, '.2f')
        with open('file_1.json', 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(d)
        print(e)


def adjust_tools_price():
    with open('F:/xpress_beauty/xpress_beauty/file_1.json', encoding='utf-8') as f:
        data = json.load(f)
    try:
        for d in data:
            if 'Tools,Trimmers' in d['category'] or 'Tools,Clippers' in d['category']:
                if '\n' in d['regular_price']:
                    regularPrice = d['regular_price'].split('\n')[1]
                    salePrice = d['regular_price'].split('\n')[0]
                    regularPrice = float(regularPrice.replace('$', ''))
                    salePrice = float(salePrice.replace('$', ''))
                    d['regular_price'] = format(regularPrice, '.2f')
                    d['sale_price'] = format(salePrice, '.2f')
                    del d['wholesale_price']
                    del d['wholesale_sale_price']
                elif '$' in d['regular_price']:
                    regularPrice = d['regular_price']
                    regularPrice = float(regularPrice.replace('$', ''))
                    d['regular_price'] = format(regularPrice, '.2f')
                    del d['wholesale_price']
                    del d['wholesale_sale_price']
        with open('file_1.json', 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(d)
        print(e)


def adjust_tools_sale_regular_prices():
    with open('F:/xpress_beauty/xpress_beauty/file_1.json', encoding='utf-8') as f:
        data = json.load(f)
    try:
        for d in data:
            if 'Tools,Trimmers' in d['category'] or 'Tools,Clippers' in d['category']:
                if d['sale_price'] == d['regular_price']:
                    d['sale_price'] = ''
        with open('file_1.json', 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(d)
        print(e)


def adjust_variation_prices():
    with open('F:/xpress_beauty/xpress_beauty/file_1.json', encoding='utf-8') as f:
        data = json.load(f)
    try:
        for d in data:
            if 'variations' in d:
                for variation in d['variations']:
                    if isinstance(variation['price'], str) and '$' in variation['price'] and '$null' not in variation['price']:
                        price = float(variation['price'].replace('$', ''))
                        variation['price'] = format(price, '.2f')
                    elif isinstance(variation['price'], float):
                        variation['price'] = format(variation['price'], '.2f')
        with open('file_1.json', 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(d)
        print(e)

def updateQuantity():
    with open('./backups/file-7.json', encoding='utf-8') as f:
        data = json.load(f)
        print(len(data))
        path = r"C:\chromedriver-win64\chromedriver.exe"
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
        driver = webdriver.Chrome(service=Service(path), options=chrome_options)
        for d in data:
            try:
                if "Hair" in ','.join(d['categories']):
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-AvailabilityJson?pids={d['id']}&page=pdp'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    json_data = json_element.get_text()
                    parsed_json = json.loads(json_data)
                    if len(parsed_json['productVariant']) > 0:
                        for variant in parsed_json['productVariant']:
                            if "estimatedQty" in variant['availability']:
                                new_quantity = variant['availability']['estimatedQty']
                                data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": new_quantity,
                                    "isVariation": True,
                                }
                                headers = {
                                    "Content-Type": "application/json",
                                    # Add any other headers required by the API
                                }
                                update = requests.put(
                                    'https://xpressbeauty.ca/api/products/update/', json=data, headers=headers)
                                print(update.json())
                                print(variant['id'])
                            else:
                                data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": 0,
                                    "isVariation": True,
                                }
                                headers = {
                                    "Content-Type": "application/json",
                                    # Add any other headers required by the API
                                }
                                update = requests.put(
                                    'https://xpressbeauty.ca/api/products/update/', json=data, headers=headers)
                                print(update.json())
                                print(variant['id'])
                    else:
                        if "estimatedQty" in parsed_json['products'][0]['availability']:
                            new_quantity = parsed_json['products'][0]['availability']['estimatedQty']
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": parsed_json['products'][0]['id'],
                                    "quantity": new_quantity,
                                    "isVariation": False,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                                    # Add any other headers required by the API
                                }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', json=data, headers=headers)
                            print(update.json())
                        else:
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": parsed_json['products'][0]['id'],
                                    "quantity": 0,
                                    "isVariation": False,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                                    # Add any other headers required by the API
                                }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', json=data, headers=headers)
                            print(update.json())
            except Exception as e:
                print(e)
                driver.quit()
                driver = webdriver.Chrome(service=Service(path), options=chrome_options)
                driver.delete_all_cookies()
                delete_cache(driver)
                time.sleep(15)
                if "Hair" in ','.join(d['categories']):
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-AvailabilityJson?pids={d['id']}&page=pdp'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    json_data = json_element.get_text()
                    parsed_json = json.loads(json_data)
                    if len(parsed_json['productVariant']) > 0:
                        for variant in parsed_json['productVariant']:
                            if "estimatedQty" in variant['availability']:
                                new_quantity = variant['availability']['estimatedQty']
                                data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": new_quantity,
                                    "isVariation": True,
                                }
                                update = requests.put(
                                    'https://xpressbeauty.ca/api/products/update/', data=data)
                                print(update.json())
                            else:
                                data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": 0,
                                    "isVariation": True,
                                }
                                update = requests.put(
                                    'https://xpressbeauty.ca/api/products/update/', data=data)
                                print(update.json())
                    else:
                        if "estimatedQty" in parsed_json['products'][0]['availability']:
                            new_quantity = parsed_json['products'][0]['availability']['estimatedQty']
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": new_quantity,
                                    "isVariation": False,
                                }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=data)
                            print(update.json())
                        else:
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": 0,
                                    "isVariation": False,
                                }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=data)
                            print(update.json())
                continue
        
def delete_cache(driver):
    driver.execute_script("window.open('');")
    time.sleep(2)
    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(2)
    driver.get('chrome://settings/clearBrowserData') # for old chromedriver versions use cleardriverData
    time.sleep(2)
    actions = ActionChains(driver) 
    actions.send_keys(Keys.TAB * 3 + Keys.DOWN * 3) # send right combination
    actions.perform()
    time.sleep(2)
    actions = ActionChains(driver) 
    actions.send_keys(Keys.TAB * 4 + Keys.ENTER) # confirm
    actions.perform()
    time.sleep(5) # wait some time to finish

updateQuantity()
# 6446da122dcb930801f43cd9
