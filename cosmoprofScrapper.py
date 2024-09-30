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


def upload_image():
    with open('cosmoprof_products_details_with_variation_updated.json') as f:
        data = f.read()
        data = json.loads(data)

    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    collection = db['products']
    for product in data:
        try:
            # check if the product is already in the db
            dbProduct = collection.find_one(
                {'product_name': product['product_name']})
            if dbProduct != None:
                # check if the product has an image and containes xpressbeauty in the url
                if 'imgs' in dbProduct and len(dbProduct['imgs']) > 0 and 'xpressbeauty' in dbProduct['imgs'][0]:
                    product['imgs'] = dbProduct['imgs']
                    varChecker = []
                    if 'variations' in dbProduct and len(dbProduct['variations']) > 0:
                        for variation in dbProduct['variations']:
                            if 'variation_image' in variation and 'xpressbeauty' in variation['variation_image']:
                                # find the variation in the product and update the image
                                for productVariation in product['variations']:
                                    if productVariation['variation_name'] == variation['variation_name']:
                                        productVariation['variation_image'] = variation['variation_image']
                                varChecker.append(True)
                            else:
                                varChecker.append(False)

                        if not False in varChecker:
                            continue
            if product['product_name'] == 'Big Hit Volumizing Shampoo':
                print('Big Hit Volumizing Shampoo')
            if dbProduct and 'imgs' in dbProduct and len(dbProduct['imgs']) > 0 and 'xpressbeauty' in dbProduct['imgs'][0]:
                continue
            imgUrl = product['product_image']
            name = product['product_name'].replace(' ', '_').replace('/', '_').replace(
                '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_')
            AWS_ACCESS_KEY_ID = os.environ.get('VITE_AWS_ACCESS_KEY_ID')
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
            newImgUrl = urlToBeReturned
            # delete product['product_image']
            del product['product_image']
            # add the new image url to the product
            product['imgs'] = []
            product['imgs'].append(newImgUrl)

        except Exception as e:
            e = e

        if 'variations' in product and len(product['variations']) > 0:
            for variation in product['variations']:
                try:
                    if 'variation_image' in variation and 'xpressbeauty' in variation['variation_image']:
                        continue
                    imgUrl = variation['variation_image']
                    name = f'''{product['product_name']}_{variation['variation_name']}'''.replace(' ', '_').replace('/', '_').replace(
                        '\\', '_').replace('?', '_').replace('&', '_').replace('=', '_').replace('+', '_').replace('%', '_')

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
                    newImgUrl = urlToBeReturned
                    variation['variation_image'] = newImgUrl
                except:
                    continue
        print(
            f'''product no {data.index(product)} out of {len(data)} image done''')
    with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
        json.dump(data, f)


def get_products_ids_details():
    # connect to mongodb
    productsIds = []
    with open('cosmoprof_products_ids.json') as f:
        productsIds = json.load(f)
    products = []
    with open('cosmoprof_products_ids.json') as f:
        productsIds = json.load(f)
        driver = open_browser()
        for productId in productsIds:
            if productId['cosmoprof_id'] == 'CAN-M-046094':
                print('Big Hit Volumizing Conditioner')
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
                product['product_image'] = imageUrl
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
                            image = variationCosmo['images']['swatch'][0]['url']
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
        while True:
            # https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Search-UpdateGrid?cgid=hair-color&start=54&sz=18&isFromPLPFlow=true&selectedUrl=https%3A%2F%2Fwww.cosmoprofbeauty.ca%2Fon%2Fdemandware.store%2FSites-CosmoProf-CA-Site%2Fdefault%2FSearch-UpdateGrid%3Fcgid%3Dhair-color%26start%3D54%26sz%3D18%26isFromPLPFlow%3Dtrue

            catUrl = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Search-UpdateGrid?cgid={category['href']}&start={page * 18}&sz=18&isFromPLPFlow=true&selectedUrl=https%3A%2F%2Fwww.cosmoprofbeauty.ca%2Fon%2Fdemandware.store%2FSites-CosmoProf-CA-Site%2Fdefault%2FSearch-UpdateGrid%3Fcgid%3D{category['href']}%26start%3D{page * 18}%26sz%3D18%26isFromPLPFlow%3Dtrue'''
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
                        'name': parsed_json['ecommerce']['items'][0]['item_category']
                    }
                    product_id['companyName'] = {
                        'name': parsed_json['ecommerce']['items'][0]['item_brand']
                    }
                    products_ids.append(product_id)
                    with open('cosmoprof_products_ids.json', 'w') as f:
                        json.dump(products_ids, f)
                except:
                    continue
            page += 1
    print('Done')
    driver.quit()


def add_products_to_db():
    # connect to mongodb
    with open('cosmoprof_products_details_with_variation_updated.json') as f:
        products = json.load(f)
    # check if product is duplicated by product_name if so update the categories array and remove the duplicated product
    for product in products:
        # check if price is a number not a object
        if type(product['price']) != dict:
            product['price'] = {
                'regular': product['price']
            }
        if 'regular' in product['price'] and product['price']['regular'] == 0:
            # remove the product if the price is 0
            products.remove(product)

        if 'max' in product['price'] and product['price']['max'] == 0:
            # remove the product if the price is 0
            products.remove(product)

        if 'min' in product['price'] and product['price']['min'] == 0:
            # remove the product if the price is 0
            products.remove(product)

    conn = pymongo.MongoClient('mongodb://localhost:27017')
    db = conn['xpressbeauty']
    collection = db['products']
    for product in products:
        collection.find_one_and_update(
            {'product_name': product['product_name']},
            {'$set': product},
            upsert=True
        )
    print('Done')


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


if __name__ == '__main__':
    print('=============== Starting the process ===============')
    # print('=============== Getting the products ids ===============')
    # get_products_ids()
    # print('=============== Got the products ids ===============')
    # time.sleep(2)
    # print('=============== Getting the products details ===============')
    # get_products_ids_details()
    # print('=============== Got the products details ===============')
    # time.sleep(2)
    print('=============== Checking duplicates ===============')
    check_duplicates()
    print('=============== Checked duplicates ===============')
    time.sleep(2)
    print('=============== Uploading the images to s3 ===============')
    upload_image()
    print('=============== Uploaded the images ===============')
    time.sleep(2)
    print('=============== Adding the products to the db ===============')
    add_products_to_db()
    print('=============== Added the products to the db ===============')
    time.sleep(1)
    print('=============== Done ===============')
