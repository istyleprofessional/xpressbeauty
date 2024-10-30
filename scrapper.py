import json
import os
import time
from bs4 import BeautifulSoup
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException, TimeoutException
import boto3
import pymongo
from openai import OpenAI
from pydantic import BaseModel


class CategoryModel(BaseModel):
    main: str
    name: str


def has_captcha(sb):
    try:
        sb.find_element(By.ID, 'px-captcha')
        print("Captcha found")
        return True
    except:
        return False


def handle_captcha(sb, url):
    driver = sb
    try:
        btnContainer = driver.find_element(By.ID, 'px-captcha')
        if btnContainer:
            time.sleep(2)
            ActionChains(driver).key_down(Keys.TAB).perform()
            time.sleep(2)
            ActionChains(driver).key_down(Keys.ENTER).pause(10).perform()
            ActionChains(driver).key_up(Keys.ENTER).perform()
            time.sleep(5)
            try:
                WebDriverWait(driver, 25).until(
                    EC.url_contains(url)
                )
            except:
                # delete the cookies
                driver.delete_all_cookies()
                # refresh the page
                driver.refresh()
                time.sleep(2)
                while has_captcha(driver):
                    handle_captcha(driver, url)
                login_to_cosmoprof(driver)
                time.sleep(2)
                driver.get(url)
                time.sleep(2)
                while has_captcha(driver):
                    handle_captcha(driver, url)
    except:
        handle_captcha(driver)


def login_to_cosmoprof(sb):
    email = 'Royalschoolhairdressing@gmail.com'
    password = 'Royal@234'
    sb.get('https://www.cosmoprofbeauty.ca/login')
    try:
        WebDriverWait(sb, 10).until(
            EC.presence_of_element_located((By.ID, 'login-form-email')))
    except:
        while has_captcha(sb):
            handle_captcha(sb, "https://www.cosmoprofbeauty.ca/login")
    sb.find_element(By.ID, 'login-form-email').send_keys(email)
    sb.find_element(By.ID, 'login-form-password').send_keys(password)
    sb.find_element(By.ID, 'login-btn').click()
    time.sleep(5)
    try:
        WebDriverWait(sb, 10).until(
            # url === https://www.cosmoprofbeauty.ca/
            EC.url_contains('https://www.cosmoprofbeauty.ca/')
        )
    except:
        while has_captcha(sb):
            handle_captcha(sb, "https://www.cosmoprofbeauty.ca/login")
    cookies = sb.get_cookies()
    return cookies


def open_browser():
    driver = uc.Chrome()
    return driver


def upload_image(imgUrl, name):
    try:
        AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = os.environ.get('VITE_AWS_SECRET_KEY')
        AWS_BUCKET_NAME = 'xpressbeauty'
        s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
        # download the image from the url and save it in a folder called skin_care
        image_path = f'''./newProductsImages/{name}.webp'''
        with open(image_path, 'wb') as handle:
            response = requests.get(imgUrl, stream=True)
            for block in response.iter_content(1024):
                if not block:
                    break
                handle.write(block)
        s3.upload_file(image_path, AWS_BUCKET_NAME,
                       f'''products-images-2/{name}.webp''', ExtraArgs={'ACL': 'public-read'})
        os.remove(image_path)
        urlToBeReturned = f'''https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/{name}.webp'''
        return urlToBeReturned
    except Exception as e:
        print(e)
        return ''


def get_products_ids_details():
    # connect to mongodb
    products = []
    with open('cosmoprof_products_ids.json') as f:
        productsIds = json.load(f)
        driver = open_browser()
        for productId in productsIds:
            try:
                product = {}
                product['cosmoprof_id'] = productId['cosmoprof_id']
                if driver == None:
                    driver = open_browser()
                driver.get(
                    f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')

                while has_captcha(driver):
                    handle_captcha(
                        driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                json_element = soup.find('pre')
                json_data = json_element.get_text()
                parsed_json = json.loads(json_data)
                product['product_name'] = parsed_json['product']['productName']
                if product['product_name'] == 'Rising Star Volumizing Finishing Spray':
                    print(product['product_name'])
                product['category'] = productId['category']
                product['companyName'] = productId['companyName']
                imageUrl = parsed_json['product']['images']['pdpLarge'][0]['url']
                product['imgs'] = []
                product_img = upload_image(imageUrl, product['product_name'].replace(' ', '_').replace('/', '_').replace(
                    '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_'))
                product['imgs'].append(product_img)
                if 'longDescription' in parsed_json['product']:
                    product['description'] = parsed_json['product']['longDescription']

                if 'upc' in parsed_json['product']:
                    product['upc'] = parsed_json['product']['upc']
                product['price'] = {}
                if parsed_json['product']['productType'] == 'master':
                    if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] == None and 'sales' in parsed_json['product']['price'] and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] == None:
                        # login again and then get the url
                        login_to_cosmoprof(driver)
                        driver.get(
                            f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                        while has_captcha(driver):
                            handle_captcha(
                                driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                        soup = BeautifulSoup(
                            driver.page_source, 'html.parser')
                        json_element = soup.find('pre')
                        json_data = json_element.get_text()
                        parsed_json = json.loads(json_data)

                    if 'range' in parsed_json['product']['price']['type']:
                        product['price'] = {}
                        product['price']['min'] = parsed_json['product']['price']['min']['sales']['value'] + 5
                        product['price']['max'] = parsed_json['product']['price']['max']['sales']['value'] + 5
                        product['priceType'] = 'range'
                    elif 'tiered' in parsed_json['product']['price']['type']:
                        product['price']['regular'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                        product['priceType'] = 'single'
                        if product['price']['regular'] == 0:
                            continue
                    else:
                        if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
                            product['price']['regular'] = parsed_json['product']['price']['list']['value'] + 5
                        elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                            product['price']['regular'] = parsed_json['product']['price']['sales']['value'] + 5
                        else:
                            product['price']['regular'] = 0
                        # d['price'] = parsed_json['product']['price']['list']['value'] + 5
                        if product['price']['regular'] == 0:
                            continue
                        product['priceType'] = 'single'
                    product['variations'] = []
                    product['variation_type'] = parsed_json['product']['variationAttributes'][0]['displayName']
                    for variationCosmo in parsed_json['product']['variationAttributes'][0]['values']:
                        # image = variationCosmo['images']['swatch'][0]['url']
                        if 'images' in variationCosmo:
                            image = upload_image(variationCosmo['images']['swatch'][0]['url'],
                                                 f'''{product['product_name']}_{variation['variation_name']}'''.replace(' ', '_').replace('/', '_').replace(
                                '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_'))

                        else:
                            image = ''
                        variation = {}
                        variation['variation_name'] = variationCosmo['displayValue']
                        variation['variation_image'] = image
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variationCosmo['skuID']}&quantity=undefined'''
                        try:
                            driver.get(url)
                            while has_captcha(driver):
                                handle_captcha(driver, url)
                            soup = BeautifulSoup(
                                driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)

                            variation['variation_id'] = variationCosmo['skuID']
                            if 'upc' in parsed_json['product']:
                                variation['upc'] = parsed_json['product']['upc']
                            if 'price' in parsed_json['product']:
                                if driver == None:
                                    driver = open_browser()
                                if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] == None and 'sales' in parsed_json['product']['price'] and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] == None:
                                    # login again and then get the url

                                    login_to_cosmoprof(driver)
                                    driver.get(
                                        f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={
                                            variationCosmo['skuID']
                                        }''')
                                    while has_captcha(driver):
                                        handle_captcha(
                                            driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                                    soup = BeautifulSoup(
                                        driver.page_source, 'html.parser')
                                    json_element = soup.find('pre')
                                    json_data = json_element.get_text()
                                    parsed_json = json.loads(json_data)
                                if 'tiered' in parsed_json['product']['price']['type']:
                                    variation['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                                else:
                                    if parsed_json['product']['price']['list'] != None and 'value' in parsed_json['product']['price']['list'] and parsed_json['product']['price']['list']['value'] != None:
                                        variation['price'] = parsed_json['product']['price']['list']['value'] + 5
                                    elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                                        variation['price'] = parsed_json['product']['price']['sales']['value'] + 5
                                    else:
                                        variation['price'] = 0
                                if variation['price'] == 0:
                                    continue
                            if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                                variation['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                            else:
                                variation['quantity_on_hand'] = 0

                            product['variations'].append(variation)
                        except WebDriverException as e:
                            driver.quit()
                            driver = None
                            driver = open_browser()
                            continue
                        except TimeoutException as e:
                            driver.quit()
                            driver = None
                            driver = open_browser()
                            continue
                        except:
                            while has_captcha(driver):
                                handle_captcha(driver, url)
                            continue

                else:
                    if 'price' in parsed_json['product']:
                        if driver == None:
                            driver = open_browser()
                        if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] == None and 'sales' in parsed_json['product']['price'] and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] == None:
                            # login again and then get the url
                            login_to_cosmoprof(driver)
                            driver.get(
                                f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                            while has_captcha(driver):
                                handle_captcha(
                                    driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')
                            soup = BeautifulSoup(
                                driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                        if 'tiered' in parsed_json['product']['price']['type']:
                            product['price']['regular'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                        else:
                            if parsed_json['product']['price']['list'] != None and 'value' in parsed_json['product']['price']['list'] and parsed_json['product']['price']['list']['value'] != None:
                                product['price']['regular'] = parsed_json['product']['price']['list']['value'] + 5
                            elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                                product['price']['regular'] = parsed_json['product']['price']['sales']['value'] + 5
                            else:
                                product['price']['regular'] = 0
                        if product['price']['regular'] == 0:
                            continue
                    product['priceType'] = 'single'
                    if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                        product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                    else:
                        product['quantity_on_hand'] = 0
                    if parsed_json['product']['productType'] == 'master':
                        product['quantity_on_hand'] = 0

                if 'categories' in product:
                    product['categories'] = []
                    product['categories'].append(product['category'])
                    del product['category']
                if 'companyName' in product:
                    product['companyName'] = {
                        'name':
                        # First letter to uppercase
                        product['companyName']['name'][0].upper(
                        ) + product['companyName']['name'][1:].lower()
                    }
                if 'price' in product:
                    if type(product['price']) != dict:
                        product['price'] = {
                            'regular': product['price']
                        }
                    if 'regular' in product['price'] and product['price']['regular'] == 0:
                        # remove the product if the price is 0
                        continue

                    if 'max' in product['price'] and product['price']['max'] == 0:
                        # remove the product if the price is 0
                        continue

                    if 'min' in product['price'] and product['price']['min'] == 0:
                        # remove the product if the price is 0
                        continue

                if 'variations' in product and len(product['variations']) > 0:
                    for variation in product['variations']:
                        if 'price' in variation:
                            if variation['price'] == 0:
                                product['variations'].remove(variation)

                products.append(product)
                # write each product to the file after getting the details inside the loop
                with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
                    json.dump(products, f)
                print(
                    f'''product no {products.index(product)} out of {len(productsIds)} ''')
            except WebDriverException as e:
                driver.quit()
                driver = None
                driver = open_browser()
                continue
            except TimeoutException as e:
                driver.quit()
                driver = None
                driver = open_browser()
                continue
            except Exception as e:
                continue


def get_products_ids():
    categories = [
        {
            'name': 'Hair Color',
            'href': 'hair-color'
        },
        {
            'name': 'Hair Care',
            'href': 'hair'
        },
        {
            'name': 'Nails',
            'href': 'nails'
        },
        {
            'name': 'Professional Tools',
            'href': 'professional-tools'
        },
        {
            'name': 'Skin and Body',
            'href': 'skin-and-body'
        },
        {
            'name': 'Salon Essentials',
            'href': 'salon-essentials'
        }
    ]
    driver = open_browser()

    products_ids = []
    for category in categories:
        page = 0
        driver.get(f'''https://www.cosmoprofbeauty.ca/{category['href']}''')
        while has_captcha(driver):
            handle_captcha(
                driver, f'''https://www.cosmoprofbeauty.ca/{category['href']}''')
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        menu_div = soup.select(f'a[href*="/{category["href"]}/"]')

        sub_categories = []
        if len(menu_div) > 0:
            for menu in menu_div:
                try:
                    sub_category = {}
                    sub_category['name'] = menu['data-name']
                    if sub_category['name'] == None:
                        continue
                    sub_category['href'] = menu['href']
                    sub_category['href'] = sub_category['href'].split('/')[-1]
                    sub_categories.append(sub_category)
                except:
                    continue
        if len(sub_categories) > 0:
            for sub_category in sub_categories:

                while True:
                    catUrl = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Search-UpdateGrid?cgid={sub_category['href']}&start={page * 18}&sz=18&isFromPLPFlow=true&selectedUrl=https%3A%2F%2Fwww.cosmoprofbeauty.ca%2Fon%2Fdemandware.store%2FSites-CosmoProf-CA-Site%2Fdefault%2FSearch-UpdateGrid%3Fcgid%3D{sub_category['href']}%26start%3D{page * 18}%26sz%3D18%26isFromPLPFlow%3Dtrue'''
                    driver.get(catUrl)
                    while has_captcha(driver):
                        handle_captcha(driver, catUrl)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    products = soup.find_all('div', class_='product-tile')
                    if len(products) == 0:
                        break
                    for product in products:
                        try:
                            json_data = product['data-ga4tile']
                            # "{'event':'view_item','event_location':'quickview','ecommerce':{'currency':'CAD','items':[{'price':0,'affiliation':'Cosmoprof','item_category':'Bleach & Lighteners','item_sub_brand':'Blondor','item_id':'CAN-M-813010','item_name':'Blondor Multi Blonde Powder','item_brand':'Wella','item_list_name':'plp','item_variant':'CAN-M-813010'}]}}"
                            cleaned_json_data = json_data.replace("'", '"')
                            parsed_json = json.loads(cleaned_json_data)
                            product_id = {}
                            # {'event':'view_item','event_location':'quickview','ecommerce':{'currency':'CAD','items':[{'price':8.78,'affiliation':'Cosmoprof','item_category':'Permanent','item_id':'CAN-M-635020','item_name':'CHI Ionic Permanent Shine Crème Hair Color','item_brand':'CHI','item_list_name':'plp','item_variant':'CAN-M-635020'}]}}
                            product_id['cosmoprof_id'] = parsed_json['ecommerce']['items'][0]['item_id']
                            product_id['category'] = {
                                'main': category['name'],
                                'name': sub_category['name']
                            }
                            product_id['companyName'] = {
                                'name':
                                # First letter to uppercase
                                parsed_json['ecommerce']['items'][0]['item_brand'][0].upper(
                                ) + parsed_json['ecommerce']['items'][0]['item_brand'][1:].lower()
                            }
                            products_ids.append(product_id)
                            with open('cosmoprof_products_ids.json', 'w') as f:
                                json.dump(products_ids, f)
                        except:
                            continue
                    page += 1
    print('Done')
    driver.quit()


def check_duplicates():
    with open('cosmoprof_products_details_with_variation_updated.json') as f:
        products = json.load(f)
    seen = set()
    duplicates = []
    for product in products:
        if product['product_name'] in seen:
            duplicates.append(product)
        else:
            seen.add(product['product_name'])

        if 'category' in product:
            product['categories'] = []
            product['categories'].append(product['category'])
            del product['category']

    # merge the duplicates into one product and append the categories to the categories array
    for duplicate in duplicates:
        for product in products:
            if product['product_name'] == duplicate['product_name']:
                product['categories'].append(duplicate['categories'][0])
        products.remove(duplicate)
    with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
        json.dump(products, f)


def get_canard_products():
    mainCatUrl = "https://canrad.com/categories"
    response = requests.get(mainCatUrl, headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    categories = response.json()['Categories']
    brands = json.load(open('brands.json'))
    categoriesToCheck = [brand['name'] for brand in brands]
    productsToSave = []

    for category in categories:
        if category['Name'].lower().replace(' ', '').replace('-', '').replace('_', '').replace('.', '') not in categoriesToCheck:
            if 'SubCategories' in category and len(category['SubCategories']) > 0:
                subCategories = category['SubCategories']
                for subCategory in subCategories:
                    if 'Deal' in subCategory['Name']:
                        continue
                    subUrl = f'''https://canrad.com/categories/{subCategory['CategoryID']}/ccrd/products'''
                    response = requests.get(subUrl, headers={
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    })
                    canradProducts = response.json()
                    canradProducts = canradProducts['Products'] if 'Products' in canradProducts else [
                    ]
                    if not canradProducts or len(canradProducts) == 0:
                        continue
                    for canradProduct in canradProducts:
                        product = {
                            'product_name': canradProduct['ItemName'],
                            'description': canradProduct['Description'].replace('<[^>]*>', ''),
                            'categories': subCategory['Name'],
                            'companyName': {
                                'name': category['Name']
                            },
                            'price': {
                                'regular': canradProduct['Price']
                            },
                            'sale_price': {
                                'sale': canradProduct['SpecialPriceDiscount']
                            },
                            'quantity_on_hand': int(canradProduct['OnHandQuantity']),
                            'upc': canradProduct['UPC'],
                            'item_id': canradProduct['ItemID'],

                        }
                        if 'ImageURL' in canradProduct:
                            product["imgs"] = []
                            product["imgs"].append(canradProduct['ImageURL'])
                        productsToSave.append(product)
                    time.sleep(2)
            print(len(productsToSave))
    with open('canrad_products.json', 'w') as f:
        json.dump(productsToSave, f)


def ai_model_to_well_categories():
    with open('cosmoprof_products_details_with_variation_updated-3.json', 'r', encoding='utf-8') as f:
        cosmo_products = json.load(f)
    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    categories_collection = db['categories']
    categories_collection.delete_many({})
    cleanCategories = {}

    for product in cosmo_products:
        if 'categories' in product:
            cleanCategories[product['categories'][0]
                            ['name']] = product['categories'][0]['main']
    finalCategories = []
    for key in cleanCategories:
        finalCategories.append({
            'main': cleanCategories[key],
            'name': key
        })

    categories_collection.insert_many(finalCategories)

    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']

    with open('canrad_products.json') as f:
        products = json.load(f)

        # using the openai api to get the compare the categories and get the best match for each product
        openai = OpenAI()

        for canardProduct in products:
            # get the best match for the product category from the categories in the db using the openai api
            db_categories = categories_collection.find()
            # convert it to string json format
            db_categories = db_categories.to_list()
            message = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f'''
                    **** from those categories {db_categories} which one is the best match for the product {canardProduct}?
                    **** The category main can't be same as category name.
                    **** Only if you don't find a match in the db, you can generate a new name but not the main category.
                    **** Just choose the best match from the categories in the db. 
                    '''},
                {"role": "assistant",
                 "content": "I think the best match for this product is:"}
            ]

            completion = openai.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=message,
                response_format=CategoryModel,

            )
            category = completion.choices[0].message.parsed
            finalCategory = {
                'main': category.main,
                'name': category.name
            }
            categories_collection.find_one_and_update(
                {'name': finalCategory['name']},
                {'$set': finalCategory},
                upsert=True
            )
            canardProduct['categories'] = []
            canardProduct['categories'].append(finalCategory)
            # clean the product name
            canardProduct['product_name'] = canardProduct['product_name'].replace('@', '').replace('<[^>]*>', '').replace('?', '').replace('&', '').replace(
                '=', '').replace('+', '').replace('%', '').replace('/', '').replace('\\', '').replace('!', '').replace('"', '').replace('*', '').split('-')[0].strip()

            for img in canardProduct['imgs']:
                canardProduct['imgs'].remove(img)
                canardProduct['imgs'].append(upload_image(img, canardProduct['product_name'].replace('@', '').replace(' ', '_').replace('"', '').replace('/', '_').replace(
                    '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_')))
            # clean the description
            canardProduct['description'] = canardProduct['description'].replace('@', '').replace('<[^>]*>', '').replace('?', '').replace('&', '').replace(
                '=', '').replace('+', '').replace('%', '').replace('/', '').replace('\\', '').replace('*', '').replace('"', '').replace('!', '').strip()
            # add the product to the db

            # print number of products done
            print(
                f'''product no {products.index(canardProduct)} out of {len(products)}''')

        with open('canrad_products.json', 'w') as f:
            json.dump(products, f)


def update_db():
    cosmo_products = json.load(
        open('cosmoprof_products_details_with_variation_updated-3.json',
             'r', encoding='utf-8')
    )
    canrad_products = json.load(open('canrad_products.json'))
    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    product_collection = db['products']
    categories_collection = db['categories']

    product_collection.delete_many({})

    for product in cosmo_products:
        product_collection.insert_one(product)
    for product in canrad_products:
        product_collection.insert_one(product)

    categories_collection.delete_many({})
    for product in cosmo_products:
        if 'categories' in product:
            categories_collection.find_one_and_update(
                {'name': product['categories'][0]['name']},
                {'$set': product['categories'][0]},
                upsert=True
            )
    for product in canrad_products:
        if 'categories' in product:
            categories_collection.find_one_and_update(
                {'name': product['categories'][0]['name']},
                {'$set': product['categories'][0]},
                upsert=True
            )

    conn.close()
    print('Done')


if __name__ == '__main__':
    # print('Starting the process')
    # print('============ Getting cosmoprof products ids =============')
    # get_products_ids()
    # print('============ Got cosmoprof products ids =============')
    # print('============ Getting Cosmo Products Details =============')
    # get_products_ids_details()
    # print('============ Got Cosmo Products Details =============')
    # print('============ Checking duplicates =============')
    # check_duplicates()
    # print('============ Checked duplicates =============')
    # print('============ Getting the Canard Products =============')
    # get_canard_products()
    # print('============ Got Canrad products =============')
    print('============ Ai Getting the categories =============')
    ai_model_to_well_categories()
    print('============ Ai Got the categories =============')
    print('============ Adding the products to the db =============')
    update_db()
    print('============ Added the products to the db =============')
    print('============ Done ============')
