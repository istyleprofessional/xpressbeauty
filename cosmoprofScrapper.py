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
import boto3


def return_product_if_range(parsed_json, d, url, driver):

    for variation in d['variations']:
        try:
            variation['variation_id'] = variation['id']
        except:
            if not 'id' in variation:
                # remove the product from the json file
                continue


def return_product_if_single(parsed_json, d):
    if 'upc' in parsed_json['product']:
        d['upc'] = parsed_json['product']['upc']
    if 'price' in parsed_json['product']:
        if 'tiered' in parsed_json['product']['price']['type']:
            d['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
        else:
            if parsed_json['product']['price']['list'] != None and 'value' in parsed_json['product']['price']['list'] and parsed_json['product']['price']['list']['value'] != None:
                d['price'] = parsed_json['product']['price']['list']['value'] + 5
            elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                d['price'] = parsed_json['product']['price']['sales']['value'] + 5
            else:
                d['price'] = 0
    d['priceType'] = 'single'
    if 'estimatedQty' in parsed_json['productAvailability']['availability']:
        d['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
    else:
        d['quantity_on_hand'] = 0
    if 'longDescription' in parsed_json['product']:
        d['description'] = parsed_json['product']['longDescription']


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
            print('PRESS & HOLD button found')
            time.sleep(5)
            ActionChains(driver).key_down(Keys.TAB).perform()
            time.sleep(5)
            ActionChains(driver).key_down(Keys.ENTER).pause(10).perform()
            ActionChains(driver).key_up(Keys.ENTER).perform()
            time.sleep(5)
            try:
                WebDriverWait(driver, 50).until(
                    EC.url_contains(url)
                )
            except:
                # delete the cookies
                driver.delete_all_cookies()
                # refresh the page
                driver.refresh()
                time.sleep(5)
                while has_captcha(driver):
                    handle_captcha(driver, url)
                print('Captcha handled successfully')
                login_to_cosmoprof(driver)
                time.sleep(5)
                driver.get(url)
                time.sleep(5)
                while has_captcha(driver):
                    handle_captcha(driver, url)
                print('Captcha handled successfully')
        else:
            print('PRESS & HOLD container not found')
    except:
        print('Error handling captcha')
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


def get_last_prices_and_upc(products):
    with open('./cosmoprof_products_details_with_variation_updated.json', encoding='utf-8') as f:
        updated_datas = []
        driver = uc.Chrome()
        login_to_cosmoprof(driver)
        driver.get('https://www.cosmoprofbeauty.ca/')
        for i, d in enumerate(products):
            try:
                if ('variations' in d and len(d['variations']) > 0):
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['cosmoprof_id']}'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    json_data = json_element.get_text()
                    parsed_json = json.loads(json_data)
                    return_product_if_range(parsed_json, d, url, driver)
                    updated_datas.append(d)
                    print(f'''{i}/{len(products)}''')
                else:
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['cosmoprof_id']}'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    json_data = json_element.get_text()
                    parsed_json = json.loads(json_data)
                    return_product_if_single(parsed_json, d)
                    updated_datas.append(d)
                    print(f'''{i}/{len(products)}''')
            except:
                while has_captcha(driver):
                    handle_captcha(driver)
                continue
        with open('updated_cosmo_products.json', 'w') as f:
            json.dump(updated_datas, f)

            # print remaining products length
# get_last_prices_and_upc()


def upload_image(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()

    for product in data:
        try:
            for imgUrl in product['imgs']:
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
                    if not response.ok:
                        print(response)
                    for block in response.iter_content(1024):
                        if not block:
                            break
                        handle.write(block)
                s3.upload_file(image_path, AWS_BUCKET_NAME,
                               f'''products-images-2/{name}.webp''', ExtraArgs={'ACL': 'public-read'})
                os.remove(image_path)
                urlToBeReturned = f'''https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/{name}.webp'''
                newImgUrl = urlToBeReturned
                # delete the old image
                product['imgs'].remove(imgUrl)
                product['imgs'].append(newImgUrl)
        except:
            continue


def get_products_ids():
    # connect to mongodb

    productsIds = []
    with open('cosmoprof_products_ids_not_in_details.json') as f:
        productsIds = json.load(f)

    try:
        with open('cosmoprof_products_ids.json') as f:
            productsIds = json.load(f)
        time.sleep(5)
        driver = uc.Chrome()
        # cookies = login_to_cosmoprof(driver)
        products = []
        for productId in productsIds:
            try:
                product = {}
                product['cosmoprof_id'] = productId['cosmoprof_id']
                if driver == None:
                    driver = uc.Chrome()
                driver.get(
                    f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ productId['cosmoprof_id']}''')

                time.sleep(1)
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
                            time.sleep(1)
                        soup = BeautifulSoup(driver.page_source, 'html.parser')
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
                    else:
                        if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
                            product['price']['regular'] = parsed_json['product']['price']['list']['value'] + 5
                        elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                            product['price']['regular'] = parsed_json['product']['price']['sales']['value'] + 5
                        else:
                            product['price']['regular'] = 0
                        # d['price'] = parsed_json['product']['price']['list']['value'] + 5
                        product['priceType'] = 'single'
                    product['variations'] = []
                    product['variation_type'] = parsed_json['product']['variationAttributes'][0]['displayName']
                    for variationCosmo in parsed_json['product']['variationAttributes'][0]['values']:
                        image = variationCosmo['images']['swatch'][0]['url']
                        variation = {}
                        variation['variation_name'] = variationCosmo['displayValue']
                        variation['variation_image'] = image
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variationCosmo['skuID']}&quantity=undefined'''
                        try:
                            driver.get(url)
                            time.sleep(1)
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
                                    driver = uc.Chrome()
                                if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] == None and 'sales' in parsed_json['product']['price'] and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] == None:
                                    # login again and then get the url

                                    login_to_cosmoprof(driver)
                                    driver.get(
                                        f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={
                                            variationCosmo['skuID']
                                        }''')
                                    time.sleep(1)
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
                            if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                                variation['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                            else:
                                variation['quantity_on_hand'] = 0

                            product['variations'].append(variation)
                        except:
                            while has_captcha(driver):
                                handle_captcha(driver, url)
                            continue

                else:
                    if 'price' in parsed_json['product']:
                        if driver == None:
                            driver = uc.Chrome()
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
                            product['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                        else:
                            if parsed_json['product']['price']['list'] != None and 'value' in parsed_json['product']['price']['list'] and parsed_json['product']['price']['list']['value'] != None:
                                product['price'] = parsed_json['product']['price']['list']['value'] + 5
                            elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                                product['price'] = parsed_json['product']['price']['sales']['value'] + 5
                            else:
                                product['price'] = 0
                    product['priceType'] = 'single'
                    if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                        product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                    else:
                        product['quantity_on_hand'] = 0
                    if parsed_json['product']['productType'] == 'master':
                        product['quantity_on_hand'] = 0

                products.append(product)
                # write each product to the file after getting the details inside the loop
                with open('cosmoprof_products_details_with_variation_updated-2.json', 'w') as f:
                    json.dump(products, f)
                print(f'''{productId['cosmoprof_id']}''')
            except Exception as e:
                print(e)
                continue
    except Exception as e:
        print(e)
        with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
            json.dump(products, f)


def getPriceZeroFrom():
    driver = uc.Chrome()
    with open('cosmoprof_products_details_with_variation_updated.json') as f:
        products = json.load(f)
        for product in products:
            if product['price'] == 0:
                driver.get(
                    f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product['cosmoprof_id']}''')
                while has_captcha(driver):
                    handle_captcha(
                        driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product['cosmoprof_id']}''')
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                json_element = soup.find('pre')
                json_data = json_element.get_text()
                parsed_json = json.loads(json_data)

                if 'price' in parsed_json['product']:
                    if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] == None and 'sales' in parsed_json['product']['price'] and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] == None:
                        # login again and then get the url
                        login_to_cosmoprof(driver)
                        driver.get(
                            f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product['cosmoprof_id']}''')
                        while has_captcha(driver):
                            handle_captcha(
                                driver, f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={ product['cosmoprof_id']}''')
                        soup = BeautifulSoup(
                            driver.page_source, 'html.parser')
                        json_element = soup.find('pre')
                        json_data = json_element.get_text()
                        parsed_json = json.loads(json_data)
                    if 'tiered' in parsed_json['product']['price']['type']:
                        product['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                    else:
                        if parsed_json['product']['price']['list'] != None and 'value' in parsed_json['product']['price']['list'] and parsed_json['product']['price']['list']['value'] != None:
                            product['price'] = parsed_json['product']['price']['list']['value'] + 5
                        elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                            product['price'] = parsed_json['product']['price']['sales']['value'] + 5
                        else:
                            product['price'] = 0

                if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                    product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']

                else:
                    product['quantity_on_hand'] = 0

        with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
            json.dump(products, f)

        print('Done')


def getDiffBtwnTwoFiles():
    # open details file and ids file
    with open('cosmoprof_products_details_with_variation_updated.json') as f:
        products_details = json.load(f)
    with open('cosmoprof_products_ids.json') as f:
        products_ids = json.load(f)

        # get the ids that is not in the details file
        ids = []
        for product in products_ids:
            if not any(d['cosmoprof_id'] == product['cosmoprof_id'] for d in products_details):
                ids.append(product)
        with open('cosmoprof_products_ids_not_in_details.json', 'w') as f:
            json.dump(ids, f)
        print('Done')


# getDiffBtwnTwoFiles()
# getPriceZeroFrom()
get_products_ids()
