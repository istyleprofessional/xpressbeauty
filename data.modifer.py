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
import undetected_chromedriver as uc
import boto3
import os

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
                time.sleep(30)
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
                                    'https://xpressbeauty.ca/api/products/update/', data=data, 
                                    headers=headers)
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
                                    'https://xpressbeauty.ca/api/products/update/', data=data, headers=headers)
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
                            headers = {
                                    "Content-Type": "application/json",
                                    # Add any other headers required by the API
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=data, headers=headers)
                        else:
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product_name": d['product_name'],
                                    "variation_id": variant['id'],
                                    "quantity": 0,
                                    "isVariation": False,
                                }
                            headers = {
                                "Content-Type": "application/json",
                                # Add any other headers required by the API
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=data,  headers=headers)
                continue


# updateQuantity()
    
def return_product_if_range(parsed_json, d, url, driver):
    if 'range' in parsed_json['product']['price']['type']:
        d['price']['min'] =parsed_json['product']['price']['min']['sales']['value'] + 5
        d['price']['max'] = parsed_json['product']['price']['max']['sales']['value'] + 5
        d['priceType'] = 'range'
    elif 'tiered' in parsed_json['product']['price']['type']:
        d['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
        d['priceType'] = 'single'
    else:
        if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
            d['price'] = parsed_json['product']['price']['list']['value'] + 5
        elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
            d['price'] = parsed_json['product']['price']['sales']['value'] + 5
        else:
            d['price'] = 0
        # d['price'] = parsed_json['product']['price']['list']['value'] + 5
        d['priceType'] = 'single'
    for variation in d['variations']:
        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variation['variation_id']}&quantity=undefined'''
        try: 
            driver.get(url)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            json_element = soup.find('pre')
            json_data = json_element.get_text()
            parsed_json = json.loads(json_data)
            if 'upc' in parsed_json['product']:
                variation['upc'] = parsed_json['product']['upc']
            if 'price' in parsed_json['product']:
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
        except:
            time.sleep(40)
            driver.get(url)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            json_element = soup.find('pre')
            json_data = json_element.get_text()
            parsed_json = json.loads(json_data)
            if 'upc' in parsed_json['product']:
                variation['upc'] = parsed_json['product']['upc']
            if 'price' in parsed_json['product']:
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
    return d

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
    return d

def upload_image(url, name):
    AWS_ACCESS_KEY_ID = 'AKIAVLKY35Q55R5AN2MF'
    AWS_SECRET_ACCESS_KEY = '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'
    AWS_BUCKET_NAME = 'xpressbeauty'

    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    # download the image from the url and save it in a folder called skin_care
    image_path = f'''./newProductsImages/{name}.webp'''
    with open(image_path, 'wb') as handle:
        response = requests.get(url, stream=True)
        if not response.ok:
            print(response)
        for block in response.iter_content(1024):
            if not block:
                break
            handle.write(block)
    # upload the image to aws s3 bucket make it public
    # s3.upload_file(image_path, AWS_BUCKET_NAME, f'''{name}.jpg''', ExtraArgs={'ACL': 'public-read'})
    s3.upload_file(image_path, AWS_BUCKET_NAME, f'''products-images-2/{name}.webp''', ExtraArgs={'ACL': 'public-read'})
    # delete the image from the folder
    os.remove(image_path)
    # 'https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/'
    # return f'''https://xpressbeauty.s3.amazonaws.com/{name}.jpg'''
    urlToBeReturned = f'''https://xpressbeauty.s3.ca-central-1.amazonaws.com/newProductsImages/{name}.webp'''
    print(urlToBeReturned)
    return urlToBeReturned



def get_last_prices_and_upc():
    with open('./backups/file-7.json', encoding='utf-8') as f:
        data = json.load(f)
        print(len(data))
        driver = uc.Chrome()
        driver.get('https://www.cosmoprofbeauty.ca/')
        time.sleep(40)
        # add cookies to the browser
        
        # with open("C:/Users/User/Downloads/www.cosmoprofbeauty.ca.cookies (41).json", 'r') as cookie_file:
        #     cookies = json.load(cookie_file)
        # for cookie in cookies:
        #     driver.add_cookie(cookie)
        for d in data:
            if "Hair" in ','.join(d['categories']):
                try:
                    if('variations' in d and len(d['variations']) > 0):
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try: 
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_range(parsed_json, d, url, driver)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                        except Exception as e:
                            print(e)
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_range(parsed_json, d, url, driver)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                            continue
                    else:
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try:
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_single(parsed_json, d)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                        except:
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_single(parsed_json, d)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                            continue
                except Exception as e:
                    print(e)
                    time.sleep(60)
                    if('variations' in d and len(d['variations']) > 0):
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try: 
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_range(parsed_json, d, url, driver)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                        except:
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_range(parsed_json, d, url, driver)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                            continue
                    else:
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try:
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_single(parsed_json, d)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                        except:
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            finalProduct = return_product_if_single(parsed_json, d)
                            data = {
                                    "secret": "myTotallySecretKey",
                                    "product": finalProduct,
                                }
                            headers = {
                                    "Content-Type": "application/json",
                            }
                            update = requests.put(
                                'https://xpressbeauty.ca/api/products/update/', data=json.dumps(data), headers=headers)
                            print(update.json())
                            continue
                    continue
                # print remaining products length
        
# get_last_prices_and_upc()



def get_skin_body():
    driver = uc.Chrome()
    driver.get('https://www.cosmoprofbeauty.ca/')
    time.sleep(40)
    driver.get('https://www.cosmoprofbeauty.ca/facial-skin-care')
    # keep scrolling down until all products are loaded 
    # Get scroll height
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        # Scroll down to bottom
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        # Wait to load page
        time.sleep(10)
        # Calculate new scroll height and compare with last scroll height
        new_height = driver.execute_script(
            "return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    products_divs = soup.find_all('div', class_='availabilityInitComplete')
    products_to_be_sent = []
    for product_div in products_divs:
        data_pid = product_div['data-pid']
        # check if pid contains -M- 
        if '-M-' in data_pid:
            continue
        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={data_pid}'''
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        json_element = soup.find('pre')
        json_data = json_element.get_text()
        parsed_json = json.loads(json_data)
        productJson = {}
        return_product_if_single(parsed_json, productJson)
        productJson['product_name'] = parsed_json['product']['productName']
        productJson['description'] = parsed_json['product']['longDescription']
        images = []
        productJson['imgs'] = []
        for image in parsed_json['product']['images']['pdpLarge']:
            images.append(image['url'])
        # upload images to aws s3 bucket
        for i, image in enumerate(images):
            # remove all spaces from the product name and special characters
            imageName = productJson['product_name'].replace(' ', '').replace('/', '').replace('\\', '').replace('?', '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')
            imgUrl = upload_image(image, f'''{imageName}-{i}''')
            productJson['imgs'].append(imgUrl)
        print(productJson)
        productJson['category'] = [{
            "main": "Skin",
            "name": "Skin Care"
        }]
        productJson['brand'] = parsed_json['product']['manufacturerName']
        products_to_be_sent.append(productJson)
    data = {
            "secret": "myTotallySecretKey",
            "products": products_to_be_sent,
        }
    headers = {
            "Content-Type": "application/json",
    }
    update = requests.post(
        'https://xpressbeauty.ca/api/uploadNewProducts/', data=json.dumps(data), headers=headers)
    print(update.json())
    

# get_skin_body()

def get_all_categories_from_cosomoprof():
    page = requests.get('https://www.cosmoprofbeauty.ca/', headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(page.content, 'html.parser')
    categories = soup.find_all('a', class_='nav-link')
    all_categories = []
    for category in categories:
        category_object = {}
        if category.text == 'Hair Colour':
            sub_categories = category.find_next('ul').find_all('a')
            for sub_category in sub_categories:
                if(sub_category.text == '\xa0Find a Store'):
                    continue
                if('\n' in sub_category.text):
                    continue
                if('Customer Service' in sub_category.text):
                    continue
                if('Quick Order' in sub_category.text):
                    continue
                category_object['main'] = category.text
                category_object['name'] = sub_category.text
                category_object['url'] = sub_category['href']
                all_categories.append(category_object)
                category_object= {}
        elif category.text == 'Hair Care':
            sub_categories = category.find_next('ul').find_all('a')
            for sub_category in sub_categories:
                if(sub_category.text == '\xa0Find a Store'):
                    continue
                if('\n' in sub_category.text):
                    continue
                if('Customer Service' in sub_category.text):
                    continue
                if('Quick Order' in sub_category.text):
                    continue
                category_object['main'] = category.text
                category_object['name'] = sub_category.text
                category_object['url'] = sub_category['href']
                all_categories.append(category_object)
                category_object= {}
        elif category.text == 'Skin & Body':
            sub_categories = category.find_next('ul').find_all('a')
            for sub_category in sub_categories:
                if(sub_category.text == '\xa0Find a Store'):
                    continue
                if('\n' in sub_category.text):
                    continue
                if('Customer Service' in sub_category.text):
                    continue
                if('Quick Order' in sub_category.text):
                    continue
                category_object['main'] = category.text
                category_object['name'] = sub_category.text
                category_object['url'] = sub_category['href']
                all_categories.append(category_object)
                category_object= {}
        elif category.text == 'Nails':
            sub_categories = category.find_next('ul').find_all('a')
            for sub_category in sub_categories:
                if(sub_category.text == '\xa0Find a Store'):
                    continue
                if('\n' in sub_category.text):
                    continue
                if('Customer Service' in sub_category.text):
                    continue
                if('Quick Order' in sub_category.text):
                    continue
                category_object['main'] = category.text
                category_object['name'] = sub_category.text
                category_object['url'] = sub_category['href']
                all_categories.append(category_object)
                category_object= {}
    print(all_categories)
    with open('cosmoprof_categories.json', 'w') as f:
        json.dump(all_categories, f)


# get_all_categories_from_cosomoprof()

def get_all_products_ids_for_each_cat_cosmoprof():
    driver = uc.Chrome() 
    products=[]
    with open('cosmoprof_categories.json', 'r') as f:
        categories = json.load(f)
        for category in categories:
            try:
                driver.get(f'''https://www.cosmoprofbeauty.ca{category['url']}''')
                time.sleep(5)
                last_height = driver.execute_script("return document.body.scrollHeight")
                while True:
                    # Scroll down to bottom
                    driver.execute_script(
                        "window.scrollTo(0, document.body.scrollHeight);")
                    # Wait to load page
                    time.sleep(15)
                    # Calculate new scroll height and compare with last scroll height
                    new_height = driver.execute_script(
                        "return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                    last_height = new_height
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                products_divs = soup.find_all('div', class_='product-tile')
                for product_div in products_divs:
                    data_pid = product_div['data-product-item-id']
                    products.append({
                        "id": data_pid,
                        "category": {
                            "main": category['main'],
                            "name": category['name']
                        }
                    })
            except Exception as e:
                time.sleep(60)
                driver.get(f'''https://www.cosmoprofbeauty.ca{category['url']}''')
                time.sleep(5)
                last_height = driver.execute_script("return document.body.scrollHeight")
                while True:
                    # Scroll down to bottom
                    driver.execute_script(
                        "window.scrollTo(0, document.body.scrollHeight);")
                    # Wait to load page
                    time.sleep(15)
                    # Calculate new scroll height and compare with last scroll height
                    new_height = driver.execute_script(
                        "return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                    last_height = new_height
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                products_divs = soup.find_all('div', class_='product-tile')
                for product_div in products_divs:
                    data_pid = product_div['data-product-item-id']
                    products.append({
                        "id": data_pid,
                        "category": {
                            "main": category['main'],
                            "name": category['name']
                        }
                    })
    with open('cosmoprof_products_ids_cat.json', 'w') as f:
        json.dump(products, f)
# get_all_products_ids_for_each_cat_cosmoprof()
        
def get_duplicates_from_cosmoprof_new_file_by_id():
    with open('cosmoprof_products_ids_cat.json', 'r') as f:
        data = json.load(f)
        # check if there are any duplicates by id and append the category to the categories array
        ids = []
        for d in data:
            found = False
            for item in ids:
                if item['id'] == d['id']:
                    item['categories'].append(d['category'])
                    found = True
                    break
            if not found:
                ids.append({
                    "id": d['id'],
                    "categories": [d['category']]
                })
    with open('cosmoprof_products_ids_cat_no_duplicates.json', 'w') as f:
        json.dump(ids, f)

# get_duplicates_from_cosmoprof_new_file_by_id()
        
def get_all_details_for_each_product_from_cosmoprof_api():
    driver = uc.Chrome()
    driver.get('https://www.cosmoprofbeauty.ca/')
    time.sleep(40)
    final_products = []
    with open('cosmoprof_products_ids_cat_no_duplicates.json', 'r') as f:
        data = json.load(f)
        for d in data:
            try:
                driver.get(f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}''')
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                json_element = soup.find('pre')
                json_data = json_element.get_text()
                parsed_json = json.loads(json_data)
                productJson = {}
                productJson['cosmoprof_id'] = d['id']
                productJson['product_name'] = parsed_json['product']['productName']
                productJson['companyName'] = {
                    'name': parsed_json['product']['manufacturerName']
                }
                if(parsed_json['product']['price']['type'] == 'range'):
                    productJson['price'] = {
                        "min": parsed_json['product']['price']['min']['sales']['value'] + 7,
                        "max": parsed_json['product']['price']['max']['sales']['value'] + 7
                    }
                    productJson['priceType'] = 'range'
                elif(parsed_json['product']['price']['type'] == 'tiered'):
                    productJson['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 7
                    productJson['priceType'] = 'single'
                else:
                    if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
                        productJson['price'] = parsed_json['product']['price']['list']['value'] + 7
                    elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                        productJson['price'] = parsed_json['product']['price']['sales']['value'] + 7
                    else:
                        productJson['price'] = 0
                    productJson['priceType'] = 'single'
                productJson['variations'] = []
                if 'variationAttributes' in parsed_json['product'] and parsed_json['product']['variationAttributes'] != None and len(parsed_json['product']['variationAttributes']) > 0:
                    productJson['variation_type'] =  parsed_json['product']['variationAttributes'][0]['displayName']
      
                    for variation in parsed_json['product']['variationAttributes'][0]['values']:
                        if(parsed_json['product']['variationAttributes'][0]['values'] == "Size"):
                            productJson['variations']= {
                                "variation_name": variation['displayValue'],
                            } 
                        elif(parsed_json['product']['variationAttributes'][0]['values'] == "Color"):
                            variant_img = []
                            for i, img in enumerate(variation['images']['swatch']):
                                if 'url' not in img:
                                    continue
                                imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{variation['id'].replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{i}'''
                                imgUrl = upload_image(img['url'], imageName)
                                variant_img.append(imgUrl)
                            productJson['variations'].append({
                                "variation_name": variation['displayValue'],
                                "variation_image": variant_img
                            })
                productJson['imgs'] = []
                for i, image in enumerate(parsed_json['product']['images']['pdpLarge']):
                    imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{i}-{i}'''
                    imgUrl = upload_image(image['url'], imageName)
                    productJson['imgs'].append(imgUrl)
                productJson['description'] = parsed_json['product']['longDescription']
                productJson['directions'] = parsed_json['product']['directions']
                productJson['ingredients'] = parsed_json['product']['ingredients']
                productJson['categories'] = d['categories']
                productJson['upc'] = parsed_json['product']['upc']

            except Exception as e:
                print(e)
                time.sleep(10)
                driver.get(f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}''')
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                json_element = soup.find('pre')
                json_data = json_element.get_text()
                parsed_json = json.loads(json_data)
                productJson = {}
                productJson['cosmoprof_id'] = d['id']
                productJson['product_name'] = parsed_json['product']['productName']
                productJson['companyName'] = {
                    'name': parsed_json['product']['manufacturerName']
                }
                if(parsed_json['product']['price']['type'] == 'range'):
                    productJson['price'] = {
                        "min": parsed_json['product']['price']['min']['sales']['value'] + 7,
                        "max": parsed_json['product']['price']['max']['sales']['value'] + 7
                    }
                    productJson['priceType'] = 'range'
                elif(parsed_json['product']['price']['type'] == 'tiered'):
                    productJson['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 7
                    productJson['priceType'] = 'single'
                else:
                    if parsed_json['product']['price']['list'] != None and parsed_json['product']['price']['list']['value'] != None:
                        productJson['price'] = parsed_json['product']['price']['list']['value'] + 7
                    elif parsed_json['product']['price']['sales'] != None and 'value' in parsed_json['product']['price']['sales'] and parsed_json['product']['price']['sales']['value'] != None:
                        productJson['price'] = parsed_json['product']['price']['sales']['value'] + 7
                    else:
                        productJson['price'] = 0
                    productJson['priceType'] = 'single'
                productJson['variations'] = []
                if 'variationAttributes' in parsed_json['product'] and parsed_json['product']['variationAttributes'] != None and  len(parsed_json['product']['variationAttributes']) > 0:
                    productJson['variation_type'] =  parsed_json['product']['variationAttributes'][0]['displayName']
                    for variation in parsed_json['product']['variationAttributes'][0]['values']:
                        if(parsed_json['product']['variationAttributes'][0]['values'] == "Size"):
                            productJson['variations']= {
                                "variation_name": variation['displayValue'],
                            } 
                        elif(parsed_json['product']['variationAttributes'][0]['values'] == "Color"):
                            variant_img = []
                            for i, img in enumerate(variation['images']['swatch']):
                                if 'url' not in img:
                                    continue
                                imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{variation['id'].replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{i}'''
                                imgUrl = upload_image(img['url'], imageName)
                                variant_img.append(imgUrl)
                            productJson['variations'].append({
                                "variation_name": variation['displayValue'],
                                "variation_image": variant_img
                            })
                productJson['imgs'] = []
                for i, image in enumerate(parsed_json['product']['images']['pdpLarge']):
                    imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace('*', '').replace('"', '').replace('<', '').replace(os.sep, '').replace('>', '').replace('|', '').replace(':', '')}-{i}-{i}'''
                    imgUrl = upload_image(image['url'], imageName)
                    productJson['imgs'].append(imgUrl)
                productJson['description'] = parsed_json['product']['longDescription']
                productJson['directions'] = parsed_json['product']['directions']
                productJson['ingredients'] = parsed_json['product']['ingredients']
                productJson['categories'] = d['categories']
                productJson['upc'] = parsed_json['product']['upc']

            final_products.append(productJson)
    with open('cosmoprof_products_details.json', 'w') as f:
        json.dump(final_products, f)
                    
            # print pretty json
    

get_all_details_for_each_product_from_cosmoprof_api()