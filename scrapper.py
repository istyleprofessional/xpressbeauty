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


class BrandModel(BaseModel):
    name: str


# BaseModel for the brand a


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
            # get element that is focused
            focused = driver.switch_to.active_element
            # check if the focused element is the captcha
            if focused.get_attribute('id') == 'px-captcha':
                time.sleep(2)
                ActionChains(driver).key_down(Keys.ENTER).pause(10).perform()
                ActionChains(driver).key_up(Keys.ENTER).perform()
                time.sleep(5)
            else:
                driver.delete_all_cookies()
                driver.refresh()
                time.sleep(2)
            try:
                WebDriverWait(driver, 25).until(
                    EC.url_contains(url)
                )
            except:
                driver.delete_all_cookies()
                driver.refresh()
                time.sleep(2)
    except Exception as e:
        print(f"Error in handle_captcha: {e}")


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
    chrome_options = uc.ChromeOptions()
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    driver = uc.Chrome(options=chrome_options)
    return driver


def upload_image(imgUrl, name, product_name):
    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    products_collection = db['cosmoprof_products_details']
    if 'xpressbeauty' in imgUrl:
        return imgUrl
    if '_' in product_name:
        productName = product_name.split('_')[0]
        variation_name = product_name.split('_')[1]
        product = products_collection.find_one(
            {'product_name': productName, 'variations.variation_name': variation_name})
        if product:
            for variation in product['variations']:
                if variation['variation_name'] == variation_name:
                    if 'imgs' in variation:
                        if imgUrl in variation['imgs']:
                            if 'xpressbeauty' in imgUrl:
                                return imgUrl
            if 'imgs' in product:
                if imgUrl in product['imgs'][0]:
                    if 'xpressbeauty' in imgUrl:
                        return imgUrl
    else:
        product = products_collection.find_one({'product_name': product_name})
        if product:
            if 'imgs' in product:
                if imgUrl in product['imgs'][0]:
                    if 'xpressbeauty' in imgUrl:
                        return imgUrl
    try:
        AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_KEY')
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


def get_product_id_details(product_id, driver=None, conn=None):
    # connect to mongodb

    # check if exist connect to the db
    if conn == None:
        conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    products_collection = db['cosmoprof_products_details']
    if driver == None:
        driver = open_browser()
    try:
        product = {}
        product['cosmoprof_id'] = product_id['cosmoprof_id']
        if driver == None:
            driver = open_browser()
        driver.get(
            f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')

        while has_captcha(driver):
            handle_captcha(
                driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        json_element = soup.find('pre')
        json_data = json_element.get_text()
        parsed_json = json.loads(json_data)
        product['product_name'] = parsed_json['product']['productName']
        if product['product_name'] == 'Rising Star Volumizing Finishing Spray':
            print(product['product_name'])
        product['categories'] = product_id['categories']
        product['companyName'] = product_id['companyName']
        imageUrl = parsed_json['product']['images']['pdpLarge'][0]['url']
        product['imgs'] = []
        product_img = upload_image(imageUrl, product['product_name'].replace(' ', '_').replace('/', '_').replace(
            '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_'), product['product_name'])
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
                    f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
                while has_captcha(driver):
                    handle_captcha(
                        driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
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
                    return None
            else:
                if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
                    product['price']['regular'] = parsed_json['product']['price']['list']['value'] + 5
                elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                    product['price']['regular'] = parsed_json['product']['price']['sales']['value'] + 5
                else:
                    product['price']['regular'] = 0
                # d['price'] = parsed_json['product']['price']['list']['value'] + 5
                if product['price']['regular'] == 0:
                    return None
                product['priceType'] = 'single'
            product['variations'] = []
            product['variation_type'] = parsed_json['product']['variationAttributes'][0]['displayName']

            for variationCosmo in parsed_json['product']['variationAttributes'][0]['values']:
                variation = {}
                variation['variation_name'] = variationCosmo['displayValue']
                # image = variationCosmo['images']['swatch'][0]['url']
                if 'images' in variationCosmo:
                    image = upload_image(variationCosmo['images']['swatch'][0]['url'],
                                         f'''{product['product_name']}_{variation['variation_name']}'''.replace(' ', '_').replace('/', '_').replace(
                        '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_'), product['product_name'] + '_' + variation['variation_name'])

                else:
                    image = ''

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
                                    driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
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
                    time.sleep(2)
                    continue
                except TimeoutException as e:
                    driver.quit()
                    driver = None
                    driver = open_browser()
                    time.sleep(2)
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
                        f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
                    while has_captcha(driver):
                        handle_captcha(
                            driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product_id['cosmoprof_id']}''')
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
                    return None
            product['priceType'] = 'single'
            if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
            else:
                product['quantity_on_hand'] = 0
            if parsed_json['product']['productType'] == 'master':
                product['quantity_on_hand'] = 0

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
                return None

            if 'max' in product['price'] and product['price']['max'] == 0:
                # remove the product if the price is 0
                return None

            if 'min' in product['price'] and product['price']['min'] == 0:
                # remove the product if the price is 0
                return None

        if 'variations' in product and len(product['variations']) > 0:
            for variation in product['variations']:
                if 'price' in variation:
                    if variation['price'] == 0:
                        product['variations'].remove(variation)

        exisiting_product = products_collection.find_one(
            {'product_name': product['product_name']})
        if exisiting_product != None:
            product['categories'].append(exisiting_product['categories'][0])
        try:
            product["secret"] = "P@ssword0"
            # serverResSalonClub = requests.post(
            #     'https://salonclub.ca/api/update-products', json=product)
            # print(serverResSalonClub.json())
            serverResXpressBeauty = requests.post(
                'https://xpressbeauty.ca/api/update-products', json=product)
            print(serverResXpressBeauty.json())

            # write it in json file
    #  append the product to the json file
            with open('new-products-file.json', 'a') as f:
                json.dump(product, f)
                f.write(',')

        except Exception as e:
            print(e)
        return product
    except WebDriverException as e:
        driver.quit()
        driver = None
        driver = open_browser()
        time.sleep(2)
        return None
    except TimeoutException as e:
        driver.quit()
        driver = None
        driver = open_browser()
        time.sleep(2)
        return None
    except Exception as e:
        print(e)
        return None


def get_cosmoprof_products():
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
        },
        {
            'name': 'Holiday',
            'href': 'holiday'
        },
    ]
    driver = open_browser()

    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    products_ids_collection = db['cosmoprof_products_ids']
    products_ids_collection.delete_many({})
    # categories_collection = db['cleaned_categories']
    # categories_collection.delete_many({})
    # brands_collection = db['cleaned_brands']
    # brands_collection.delete_many({})
    for category in categories:

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
        if len(sub_categories) > 0 or category['name'] == 'Holiday':
            if category['name'] == 'Holiday':
                sub_categories = [{'name': 'Holiday', 'href': 'holiday'}]
            for sub_category in sub_categories:
                page = 0
                products_ids = []
                while True:
                    catUrl = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Search-UpdateGrid?cgid={sub_category['href']}&start={page * 18}&sz=18&isFromPLPFlow=true&selectedUrl=https%3A%2F%2Fwww.cosmoprofbeauty.ca%2Fon%2Fdemandware.store%2FSites-CosmoProf-CA-Site%2Fdefault%2FSearch-UpdateGrid%3Fcgid%3D{sub_category['href']}%26start%3D{page * 18}%26sz%3D18%26isFromPLPFlow%3Dtrue'''
                    try:
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
                                cleaned_json_data = json_data.replace("'", '"')
                                parsed_json = json.loads(cleaned_json_data)
                                product_id = {}
                                product_id['cosmoprof_id'] = parsed_json['ecommerce']['items'][0]['item_id']
                                product_id['categories'] = [
                                    {
                                        'main': category['name'],
                                        'name': sub_category['name']
                                    }
                                ]
                                product_id['companyName'] = {
                                    'name':
                                    parsed_json['ecommerce']['items'][0]['item_brand'][0].replace('#', '').upper(
                                    ) + parsed_json['ecommerce']['items'][0]['item_brand'][1:].replace('#', '').lower()
                                }
                                products_ids.append(product_id)
                                products_ids_collection.find_one_and_update(
                                    {'cosmoprof_id': product_id['cosmoprof_id']},
                                    {'$set': product_id},
                                    upsert=True
                                )
                            except:
                                continue
                    except WebDriverException as e:
                        driver.quit()
                        driver = None
                        driver = open_browser()
                        time.sleep(2)
                        driver.get(catUrl)
                        continue
                    except TimeoutException as e:
                        driver.quit()
                        driver = None
                        driver = open_browser()
                        time.sleep(2)
                        driver.get(catUrl)
                        continue
                    page += 1
                for product_id in products_ids:
                    get_product_id_details(product_id, driver, conn)

    print('Done')
    driver.quit()
    conn.close()


# def check_brand_name(product):
#     openai = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     brands_collection = db['cleaned_brands']
#     message = [
#         {"role": "system", "content": "You are a helpful assistant."},
#         {"role": "user", "content": f'''
#             **** if the brand name {product['companyName']['name']} is not in the {brands_collection.find().to_list()} generate a new name otherwise choose the best match.
#             **** Just choose the best match from the brands in the db.
#             **** Only if you don't find a match in the db, you can generate a new name.
#             '''},
#         {"role": "assistant",
#             "content": "I think the best match for this product is:"}
#     ]

#     completion = openai.beta.chat.completions.parse(
#         model="gpt-4o-2024-08-06",
#         messages=message,
#         response_format=BrandModel

#     )
#     brand = completion.choices[0].message.parsed
#     finalBrand = {
#         'name':
#             # First letter to uppercase
#             brand.name[0].upper(
#             ) + brand.name[1:].lower()
#     }
#     brands_collection.find_one_and_update(
#         {'name': finalBrand['name']},
#         {'$set': finalBrand},
#         upsert=True
#     )
#     product['companyName'] = {
#         'name':
#         # first letter to uppercase
#         finalBrand['name'][0].upper(
#         ) + finalBrand['name'][1:].lower()
#     }
#     return product


# def check_duplicates():
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     products_collection = db['cosmoprof_products_details']
#     products = products_collection.find({}).to_list()

#     seen = set()
#     duplicates = []
#     for product in products:
#         if product['product_name'] in seen:
#             duplicates.append(product)
#         else:
#             seen.add(product['product_name'])

#         if 'category' in product:
#             product['categories'] = []
#             product['categories'].append(product['category'])
#             del product['category']

#     # merge the duplicates into one product and append the categories to the categories array
#     for duplicate in duplicates:
#         for product in products:
#             if product['product_name'] == duplicate['product_name']:
#                 product['categories'].append(duplicate['categories'][0])
#         products.remove(duplicate)
#     for product in products:
#         products_collection.find_one_and_update(
#             {'product_name': product['product_name']},
#             {'$set': product},
#             upsert=True
#         )
#     conn.close()


# def get_canard_products():
#     mainCatUrl = "https://canrad.com/categories"
#     response = requests.get(mainCatUrl, headers={
#         'Content-Type': 'application/json',
#         'Accept': 'application/json'
#     })
#     categories = response.json()['Categories']
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     canard_collection = db['canrad_products']
#     brand_collection = db['cleaned_brands']

#     canard_collection.delete_many({})
#     total = 0
#     for category in categories:
#         if 'SubCategories' in category and len(category['SubCategories']) > 0:
#             subCategories = category['SubCategories']
#             for subCategory in subCategories:

#                 productsToSave = []
#                 if 'Deal' in subCategory['Name']:
#                     continue
#                 subUrl = f'''https://canrad.com/categories/{subCategory['CategoryID']}/ccrd/products'''
#                 response = requests.get(subUrl, headers={
#                     'Content-Type': 'application/json',
#                     'Accept': 'application/json'
#                 })
#                 canradProducts = response.json()
#                 canradProducts = canradProducts['Products'] if 'Products' in canradProducts else [
#                 ]
#                 if not canradProducts or len(canradProducts) == 0:
#                     continue
#                 for canradProduct in canradProducts:
#                     product = {
#                         'product_name': canradProduct['ItemName'],
#                         'description': canradProduct['Description'].replace('<[^>]*>', ''),
#                         'companyName': {
#                             'name':
#                             # first letter to uppercase
#                             category['Name'][0].upper(
#                             ) + category['Name'][1:].lower()
#                         },
#                         'price': {
#                             'regular': canradProduct['Price']
#                         },
#                         'sale_price': {
#                             'sale': canradProduct['SpecialPriceDiscount']
#                         },
#                         'quantity_on_hand': int(canradProduct['OnHandQuantity']),
#                         'upc': canradProduct['UPC'],
#                         'item_id': canradProduct['ItemID'],

#                     }
#                     brand_collection.find_one_and_update(
#                         {'name': product['companyName']['name']},
#                         {'$set': product['companyName']},
#                         upsert=True
#                     )
#                     # product = check_brand_name(product)
#                     if 'ImageURL' in canradProduct:
#                         product["imgs"] = []
#                         product["imgs"].append(canradProduct['ImageURL'])
#                     product = ai_model_to_well_categories(product)
#                     productsToSave.append(product)
#                     #  print number of products scraped out of the total
#                     print(f'''{len(productsToSave) + total} Saved''')
#                 total += 15
#                 canard_collection.insert_many(productsToSave)
#                 time.sleep(2)


# def ai_model_to_well_categories(product):
#     openai = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     categories_collection = db['cleaned_categories']
#     message = [
#         {"role": "system", "content": "You are a helpful assistant."},
#         {"role": "user", "content": f'''
#             **** from those categories {categories_collection.find().to_list()} which one is the best match for the product {product}?
#             **** The category main can't be same as category name.
#             **** Only if you don't find a match in the db, you can generate a new name but not the main category.
#             **** Just choose the best match from the categories in the db.
#             '''},
#         {"role": "assistant",
#             "content": "I think the best match for this product is:"}
#     ]

#     completion = openai.beta.chat.completions.parse(
#         model="gpt-4o-2024-08-06",
#         messages=message,
#         response_format=CategoryModel,

#     )
#     category = completion.choices[0].message.parsed
#     finalCategory = {
#         'main': category.main,
#         'name': category.name
#     }
#     categories_collection.find_one_and_update(
#         {'name': finalCategory['name']},
#         {'$set': finalCategory},
#         upsert=True
#     )
#     # check if the categories has holiday or no
#     if 'category' in product and 'name' in product['category'] and 'Holiday' in product['category']['name']:
#         product['categories'] = []
#         product['categories'].append(product['category'])
#         product['categories'].append(finalCategory)
#     else:
#         product['categories'] = []
#         product['categories'].append(finalCategory)
#     if 'category' in product:
#         del product['category']
#     # clean the product name
#     product['product_name'] = product['product_name'].replace('@', '').replace('<[^>]*>', '').replace('?', '').replace('&', '').replace(
#         '=', '').replace('+', '').replace('%', '').replace('/', '').replace('\\', '').replace('!', '').replace('"', '').replace('*', '').split('-')[0].strip()
#     if 'product_image' in product:
#         product['imgs'] = []
#         product['imgs'].append(product['product_image'])
#         del product['product_image']

#     image_uploaded_url = upload_image(product['imgs'][0], product['product_name'].replace('@', '').replace(' ', '_').replace('"', '').replace('/', '_').replace(
#         '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_'), product['product_name'])
#     for img in product['imgs']:
#         product['imgs'].remove(img)
#         product['imgs'].append(image_uploaded_url)

#     # clean the description
#     product['description'] = product['description'].replace('@', '').replace('<[^>]*>', '').replace('?', '').replace('&', '').replace(
#         '=', '').replace('+', '').replace('%', '').replace('/', '').replace('\\', '').replace('*', '').replace('"', '').replace('!', '').strip()
#     # add the product to the db

#     return product


# def map_cosmoprof_categories():
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     products_ids = db['cosmoprof_products_ids'].find({}).to_list()
#     products_details = db['cosmoprof_products_details']
#     products_details.update_many({}, {'$unset': {'categories': []}})
#     products_details.update_many({}, {'$set': {'categories': []}})
#     for product_id in products_ids:

#         exist_prod_details = db['cosmoprof_products_details'].find_one(
#             {'cosmoprof_id': product_id['cosmoprof_id']})

#         if exist_prod_details:
#             exist_prod_details['categories'].append(
#                 product_id['categories'][0])
#             products_details.find_one_and_update(
#                 {'cosmoprof_id': product_id['cosmoprof_id']},
#                 {'$set': exist_prod_details}
#             )


# def update_db():
#     conn = pymongo.MongoClient('mongodb://localhost:27017')
#     db = conn['xpressbeauty']
#     product_collection = db['products']
#     categories_collection = db['categories']
#     cosmo_products = db['cosmoprof_products_details'].find({}).to_list()
#     canrad_products = db['canrad_products'].find({}).to_list()
#     clean_brands_collection = db['cleaned_brands']
#     brands_collection = db['brands']
#     brands_collection.delete_many({})
#     for brand in clean_brands_collection.find({}):
#         brands_collection.find_one_and_update(
#             {'name': brand['name']},
#             {'$set': brand},
#             upsert=True
#         )

#     product_collection.delete_many({})

#     for product in cosmo_products:
#         # delete the product _id
#         del product['_id']
#         product_collection.find_one_and_update(
#             {'product_name': product['product_name']},
#             {'$set': product},
#             upsert=True
#         )

#     for product in canrad_products:
#         # delete the product _id
#         del product['_id']
#         product_collection.find_one_and_update(
#             {'product_name': product['product_name']},
#             {'$set': product},
#             upsert=True
#         )

#     categories_collection.delete_many({})
#     clean_categories = db['cleaned_categories']
#     for category in clean_categories.find({}):
#         categories_collection.find_one_and_update(
#             {'name': category['name']},
#             {'$set': category},
#             upsert=True
#         )

#     conn.close()
#     print('Done')


if __name__ == '__main__':
    print('============ Starting =============')

    print('============ Getting cosmoprof products ids =============')
    get_cosmoprof_products()
    print('============ Got cosmoprof products ids =============')

    # print('============ Checking duplicates =============')
    # check_duplicates()
    # print('============ Checked duplicates =============')

    # print('============ Getting the Canard Products =============')
    # get_canard_products()
    # print('============ Got Canrad products =============')

    # print('============ Mapping the cosmoprof categories =============')
    # map_cosmoprof_categories()
    # print('============ Mapped the cosmoprof categories =============')

    print('============ Done ============')
