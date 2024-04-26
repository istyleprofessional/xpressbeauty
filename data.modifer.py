import json
import time
from bs4 import BeautifulSoup
import requests
import undetected_chromedriver as uc
import boto3
import os
from selenium.webdriver.support.ui import WebDriverWait

    
def return_product_if_range(parsed_json, d, url, driver):

    if 'longDescription' in parsed_json['product']:
        d['description'] = parsed_json['product']['longDescription']  
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
        try:
            variation['variation_id'] = variation['id']
        except:
            if not 'id' in variation:
                # remove the product from the json file
                continue
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
            try:
                url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variation['variation_id'][:-1]}&quantity=undefined'''
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
                # remove the variation from the array
                d['variations'].remove(variation)
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

    # if 'promotions' in parsed_json['product'] and parsed_json['product']['promotions'] != None and len(parsed_json['product']['promotions']) > 1:
    #     for promotion in parsed_json['product']['promotions']:
    #         if 'id' in promotion and promotion['id'] == 'BigBottle':
    #             d['sale_price'] = d['price'] - (d['price'] * 0.3)
    # return d

def upload_image(url, name):
    AWS_ACCESS_KEY_ID = os.environ.get('VITE_AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('VITE_AWS_SECRET_KEY')
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
    s3.upload_file(image_path, AWS_BUCKET_NAME, f'''products-images-2/{name}.webp''', ExtraArgs={'ACL': 'public-read'})
    os.remove(image_path)
    urlToBeReturned = f'''https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/{name}.webp'''
    print(urlToBeReturned)
    return urlToBeReturned


def get_last_prices_and_upc():
    with open('./backups/file-7.json', encoding='utf-8') as f:
        datas = json.load(f)
        updated_datas = []
        print(len(datas))
        driver = uc.Chrome()
        driver.get('https://www.cosmoprofbeauty.ca/')
        time.sleep(40)
        for i, d in enumerate(datas):
            if not "tool" in ','.join(d['categories']).lower():
                try:
                    if('variations' in d and len(d['variations']) > 0):
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try: 
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            return_product_if_range(parsed_json, d, url, driver)
                            updated_datas.append(d)
                            print(f'''{i}/{len(datas)}''')
                        except Exception as e:
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            return_product_if_range(parsed_json, d, url, driver)
                            updated_datas.append(d)
                            print(f'''{i}/{len(datas)}''')
                            continue
                    else:
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                        try:
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            return_product_if_single(parsed_json, d)
                            updated_datas.append(d)
                            print(f'''{i}/{len(datas)}''')
                        except:
                            time.sleep(40)
                            driver.get(url)
                            soup = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soup.find('pre')
                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            return_product_if_single(parsed_json, d)
                            updated_datas.append(d)
                            print(f'''{i}/{len(datas)}''')
                            continue
                except Exception as e:
                    print(e)
                    # if('variations' in d and len(d['variations']) > 0):
                    #     url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                    #     try: 
                    #         driver.get(url)
                    #         soup = BeautifulSoup(driver.page_source, 'html.parser')
                    #         json_element = soup.find('pre')
                    #         json_data = json_element.get_text()
                    #         parsed_json = json.loads(json_data)
                    #         return_product_if_range(parsed_json, d, url, driver)
                    #         updated_datas.append(d)
                    #         print(f'''{i}/{len(datas)}''')
                    #     except:
                    #         time.sleep(40)
                    #         driver.get(url)
                    #         soup = BeautifulSoup(driver.page_source, 'html.parser')
                    #         json_element = soup.find('pre')
                    #         json_data = json_element.get_text()
                    #         parsed_json = json.loads(json_data)
                    #         return_product_if_range(parsed_json, d, url, driver)
                    #         print(f'''{i}/{len(datas)}''')
                    #         updated_datas.append(d)    
                    #         continue
                    # else:
                    #     url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['id']}'''
                    #     try:
                    #         driver.get(url)
                    #         soup = BeautifulSoup(driver.page_source, 'html.parser')
                    #         json_element = soup.find('pre')
                    #         json_data = json_element.get_text()
                    #         parsed_json = json.loads(json_data)
                    #         return_product_if_single(parsed_json, d)
                    #         print(f'''{i}/{len(datas)}''')
                    #         updated_datas.append(d)
                    #     except:
                    #         time.sleep(40)
                    #         driver.get(url)
                    #         soup = BeautifulSoup(driver.page_source, 'html.parser')
                    #         json_element = soup.find('pre')
                    #         json_data = json_element.get_text()
                    #         parsed_json = json.loads(json_data)
                    #         return_product_if_single(parsed_json, d)
                    #         print(f'''{i}/{len(datas)}''')
                    #         updated_datas.append(d)
                    #         continue
                    continue
        with open('updated_cosmo_products.json', 'w') as f:
            json.dump(updated_datas, f)
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
                last_height = driver.execute_script("return document.body.scrollHeight")
                while True:
                    # Scroll down to bottom
                    driver.execute_script(
                        "window.scrollTo(0, document.body.scrollHeight);")
                    # Wait to load page
                    # time.sleep(15)
                    # Calculate new scroll height and compare with last scroll height
                    try:
                        WebDriverWait(driver, 10).until(
                            # wait until the height changes
                            lambda driver: driver.execute_script("return document.body.scrollHeight") != last_height
                        )
                    except Exception as e:
                        print(e)
                    
                    new_height = driver.execute_script(
                        "return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                    last_height = new_height
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                products_divs = soup.find_all('div', class_='product-tile')
                for product_div in products_divs:
                    try:
                        data_brand = product_div.find('a', class_='pdp-link__brand').text
                    except:
                        data_brand = ''
                    data_pid = product_div['data-product-item-id']
                    products.append({
                        "id": data_pid,
                        "category": {
                            "main": category['main'],
                            "name": category['name']
                        },
                         "companyName": { 
                            "name": data_brand
                        }
                    })
            except Exception as e:
                driver.get(f'''https://www.cosmoprofbeauty.ca{category['url']}''')
                time.sleep(5)
                last_height = driver.execute_script("return document.body.scrollHeight")
                while True:
                    # Scroll down to bottom
                    driver.execute_script(
                        "window.scrollTo(0, document.body.scrollHeight);")
                    # Wait to load page
                    try:
                        WebDriverWait(driver, 10).until(
                            # wait until the height changes
                            lambda driver: driver.execute_script("return document.body.scrollHeight") != last_height
                        )
                    except Exception as e:
                        print(e)
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
                    try:
                        data_brand = product_div['pdp-link__brand']
                    except:
                        data_brand = ''
                    products.append({
                        "id": data_pid,
                        "category": {
                            "main": category['main'],
                            "name": category['name']
                        },
                        "companyName": { 
                            "name": data_brand
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
                    "categories": [d['category']],
                    "companyName": {
                        "name": d['companyName']['name']
                    }
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
                        if(parsed_json['product']['variationAttributes'][0]['attributeId'] == "size"):
                            productJson['variations']= {
                                "variation_name": variation['displayValue'],
                            } 
                        elif(parsed_json['product']['variationAttributes'][0]['attributeId'] == "color"):
                            variant_img = []
                            variant_id = ''
                            for i, img in enumerate(variation['images']['swatch']):
                                if 'url' not in img:
                                    continue
                                imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{variation['id'].replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{i}'''
                                imgUrl = upload_image(img['url'], imageName)
                                variant_id = img['url'].split('/')[-1].split('?')[0].split('.')[0]
                                # get only the number format of the variant id
                                variant_id = ''.join(filter(str.isdigit, variant_id))
                                # get the last slash in the url and remove the query string
                                variant_img.append(imgUrl)
                            productJson['variations'].append({
                                "variation_name": variation['displayValue'],
                                "variation_image": variant_img,
                                "id": f'''CAN-{variant_id}'''
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
                        if(parsed_json['product']['variationAttributes'][0]['attributeId'] == "size"):
                            productJson['variations']= {
                                "variation_name": variation['displayValue'],
                            } 
                        elif(parsed_json['product']['variationAttributes'][0]['attributeId'] == "color"):
                            variant_img = []
                            for i, img in enumerate(variation['images']['swatch']):
                                if 'url' not in img:
                                    continue
                                imageName = f'''{productJson['product_name'].replace(' ', '').replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{variation['id'].replace('/', '').replace('?', '').replace(os.sep, '').replace('*', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '').replace(':', '')}-{i}'''
                                imgUrl = upload_image(img['url'], imageName)
                                variant_id = img['url'].split('/')[-1].split('?')[0].split('.')[0]
                                # get only the number format of the variant id
                                variant_id = ''.join(filter(str.isdigit, variant_id))
                                # get the last slash in the url and remove the query string
                                variant_img.append(imgUrl)
                            productJson['variations'].append({
                                "variation_name": variation['displayValue'],
                                "variation_image": variant_img,
                                "id": f'''CAN-{variant_id}'''
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
    

# get_all_details_for_each_product_from_cosmoprof_api()

def get_variant_details_from_json_file():
    driver = uc.Chrome()
    driver.get('https://www.cosmoprofbeauty.ca/')
    time.sleep(40)
    with open('cosmoprof_products_details.json' , 'r') as f:
        json_data = json.load(f)
        # filter only products with variations length greater than 0
        totalNumberOfProducts = [d for d in json_data if 'variations' in d and len(d['variations']) > 0]
        for i, d in enumerate(json_data):
            # get index of the d
            try:
                if d['variations'] and len(d['variations']) > 0:
                    # check if all the variations has id attribute if not then delete the product

                    checker = [v for v in d['variations'] if 'id' in v]
                    if len(checker) == 0:
                        json_data.remove(d)
                        continue
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['cosmoprof_id']}'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    jsons_data = json_element.get_text()
                    parsed_json = json.loads(jsons_data)
                    return_product_if_range(parsed_json, d, url, driver)
                    print(f'''{i}/{len(totalNumberOfProducts)}''')
            except Exception as e:
                print(e)
                time.sleep(10)
                if d['variations'] and len(d['variations']) > 0:
                    checker = [v for v in d['variations'] if 'id' in v]
                    if len(checker) == 0:
                        json_data.remove(d)
                        continue
                    url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={d['cosmoprof_id']}'''
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, 'html.parser')
                    json_element = soup.find('pre')
                    jsons_data = json_element.get_text()
                    parsed_json = json.loads(jsons_data)
                    return_product_if_range(parsed_json, d, url, driver)
                    print(f'''{i}/{len(totalNumberOfProducts)}''')
                    continue
        with open('cosmoprof_products_details_with_variation_updated.json', 'w') as f:
            json.dump(json_data, f)

get_variant_details_from_json_file()

def get_all_offers_from_cosmoProf():
    driver = uc.Chrome()
    objects = []
    driver.get('https://www.cosmoprofbeauty.ca/promotions')
    soap = BeautifulSoup(driver.page_source, 'html.parser')
    offers = soap.find_all('div', class_='promo-tile')
    for offer in offers:
        offerObject = {}
        offer_a_tag = offer.find('a')
        offerObject['name'] = offer_a_tag.text.replace('\n', '').replace('  ', '').strip()
        offerObject['url'] = offer_a_tag['href']
        driver.get(f'''https://www.cosmoprofbeauty.ca{offerObject['url']}''')
        time.sleep(10)
        # scroll all way down to get all the products
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            # Scroll down to bottom
            driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);")
            # Wait to load page
            time.sleep(20)
            # Calculate new scroll height and compare with last scroll height
            new_height = driver.execute_script(
                "return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        soap = BeautifulSoup(driver.page_source, 'html.parser')
        products_divs = soap.find_all('div', class_='product-tile')
        offerObject['products'] = []
        for product_div in products_divs:
            data_pid = product_div['data-product-item-id']
            product_object = {}
            product_object['id'] = data_pid
            offerObject['products'].append(product_object)
        for product in offerObject['products']:
            driver.get(f'''https://www.cosmoprofbeauty.ca/{product['id']}.html''')
            time.sleep(2)
            soap = BeautifulSoup(driver.page_source, 'html.parser')
            # find if there is a div with data-attr = size
            # find any secuirty check word
            if 'SECURITY' in soap.text:
                time.sleep(20)
                driver.get(f'''https://www.cosmoprofbeauty.ca/{product['id']}.html''')
                soap = BeautifulSoup(driver.page_source, 'html.parser')
            size_div = soap.find('div', {'data-attr': 'size'})
            color_div = soap.find('div', class_='color-container')
            if size_div != None:
                product['variation_type'] = 'Size'
                product['variations'] = []
                sizes = size_div.find_all('button', class_='select-size')
                for size in sizes:
                    product['variations'].append({
                        "variation_id": size['id']
                    })
            elif color_div != None:
                product['variation_type'] = 'Color'
                product['variations'] = []
                colors = color_div.find_all('div', class_='swatch-line')
                for color in colors:
                    product['variations'].append({
                        "variation_id": color['data-pid']
                    })
            else:
                product['variation_type'] = 'Single'

        
        objects.append(offerObject)
   
    with open('cosmo-offers.json', 'w') as f:
        json.dump(objects, f)


# get_all_offers_from_cosmoProf()


def get_all_offers_from_cosmoProf_from_json_file():
    driver = uc.Chrome()
    driver.get('https://www.cosmoprofbeauty.ca/login')
    time.sleep(40)

    objects = []
    with open('cosmo-offers.json', 'r') as f:
        offers = json.load(f)
        for offer in offers:
            for product in offer['products']:
                if(product['variation_type'] != "Single"):
                    for variation in product['variations']:
                        try:
                            url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={variation['variation_id']}'''
                            driver.get(url)
                            soap = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soap.find('pre')

                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            variation['name'] = parsed_json['product']['productName']
                            variation['upc'] = parsed_json['product']['upc']
                            if 'price' in parsed_json['product']:
                                if 'tiered' in parsed_json['product']['price']['type']:
                                    variation['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                                else:
                                    if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] != None:
                                        variation['price'] = parsed_json['product']['price']['list']['value']
                                    if 'sales' in parsed_json['product']['price'] and parsed_json['product']['price']['sales'] != None:
                                        variation['sale_price'] = parsed_json['product']['price']['sales']['value']
                            if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                                variation['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                            else:
                                variation['quantity_on_hand'] = 0
                            if 'pdpLarge' in parsed_json['product']['images'] and len(parsed_json['product']['images']['pdpLarge']) > 0:
                                variation['variation_image'] = parsed_json['product']['images']['pdpLarge'][0]['url']
                        except:
                            time.sleep(20)
                            driver.get(url)
                            soap = BeautifulSoup(driver.page_source, 'html.parser')
                            json_element = soap.find('pre')

                            json_data = json_element.get_text()
                            parsed_json = json.loads(json_data)
                            variation['name'] = parsed_json['product']['productName']
                            variation['upc'] = parsed_json['product']['upc']
                            if 'price' in parsed_json['product']:
                                if 'tiered' in parsed_json['product']['price']['type']:
                                    variation['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                                else:
                                    if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] != None:
                                        variation['price'] = parsed_json['product']['price']['list']['value']
                                    if 'sales' in parsed_json['product']['price'] and parsed_json['product']['price']['sales'] != None:
                                        variation['sale_price'] = parsed_json['product']['price']['sales']['value']

                            if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                                variation['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                            else:
                                variation['quantity_on_hand'] = 0
                            if 'pdpLarge' in parsed_json['product']['images'] and len(parsed_json['product']['images']['pdpLarge']) > 0:
                                variation['variation_image'] = parsed_json['product']['images']['pdpLarge'][0]['url']
                else:
                    try:
                        url = f'''https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid={product['id']}'''
                        driver.get(url)
                        soap = BeautifulSoup(driver.page_source, 'html.parser')
                        json_element = soap.find('pre')
                        json_data = json_element.get_text()
                        parsed_json = json.loads(json_data)
                        product['name'] = parsed_json['product']['productName']
                        product['upc'] = parsed_json['product']['upc']
                        if 'price' in parsed_json['product']:
                            if 'tiered' in parsed_json['product']['price']['type']:
                                product['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                            else:
                                if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] != None:
                                    product['price'] = parsed_json['product']['price']['list']['value']
                                if 'sales' in parsed_json['product']['price'] and parsed_json['product']['price']['sales'] != None:
                                    product['sale_price'] = parsed_json['product']['price']['sales']['value']
                        if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                            product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                        else:
                            product['quantity_on_hand'] = 0
                        if 'pdpLarge' in parsed_json['product']['images'] and len(parsed_json['product']['images']['pdpLarge']) > 0:
                            product['image'] = parsed_json['product']['images']['pdpLarge'][0]['url']
                    except:
                        time.sleep(20)
                        driver.get(url)
                        soap = BeautifulSoup(driver.page_source, 'html.parser')
                        json_element = soap.find('pre')

                        json_data = json_element.get_text()
                        parsed_json = json.loads(json_data)
                        product['name'] = parsed_json['product']['productName']
                        product['upc'] = parsed_json['product']['upc']
                        if 'price' in parsed_json['product']:
                            if 'tiered' in parsed_json['product']['price']['type']:
                                product['price'] = parsed_json['product']['price']['tiers'][0]['price']['sales']['value'] + 5
                            else:
                                if 'list' in parsed_json['product']['price'] and parsed_json['product']['price']['list'] != None:
                                    product['price'] = parsed_json['product']['price']['list']['value']
                                if 'sales' in parsed_json['product']['price'] and parsed_json['product']['price']['sales'] != None:
                                    product['sale_price'] = parsed_json['product']['price']['sales']['value']
                        if 'estimatedQty' in parsed_json['productAvailability']['availability']:
                            product['quantity_on_hand'] = parsed_json['productAvailability']['availability']['estimatedQty']
                        else:
                            product['quantity_on_hand'] = 0
                        if 'pdpLarge' in parsed_json['product']['images'] and len(parsed_json['product']['images']['pdpLarge']) > 0:
                            product['image'] = parsed_json['product']['images']['pdpLarge'][0]['url']

            objects.append(offer)
    with open('cosmo-offers-final.json', 'w') as f:
        json.dump(objects, f)

# get_all_offers_from_cosmoProf_from_json_file()


def get_brands_name_and_variation_name_for_offers():
    driver = uc.Chrome()
    with open('./cosmo-offers-final.json', 'r') as f:
        data = json.load(f)
        for offer in data:
            for product in offer['products']:
                driver.get(f'''https://www.cosmoprofbeauty.ca/{product['id']}.html''')
                soap = BeautifulSoup(driver.page_source, 'html.parser')
                if 'SECURITY' in soap.text:
                    driver.get(f'''https://www.cosmoprofbeauty.ca/{product['id']}.html''')
                    soap = BeautifulSoup(driver.page_source, 'html.parser')
        
                # find a tag with class pdp-brand
                brand = soap.findAll('a', class_='pdp-brand')
                if len(brand) > 0:
                    # get last index of the brand array
                    product['brand'] = brand[len(brand) - 1].text.replace('\n', '').strip()
                else:
                    product['brand'] = ''
                # get variation name
                size_div = soap.find('div', {'data-attr': 'size'})
                color_div = soap.find('div', class_='color-container')
                if size_div != None:
                    for variation in product['variations']:
                        for size in size_div.find_all('button', class_='select-size'):
                            if variation['variation_id'] == size['id']:
                                variation['variation_name'] = size.text.replace('\n', '').strip()
                elif color_div != None:
                    for variation in product['variations']:
                        for color in color_div.find_all('div', class_='swatch-line'):
                            if variation['variation_id'] == color['data-pid']:
                                variation['variation_name'] = color.text.replace('\n', '').strip()

    with open('cosmo-offers-final-2.json', 'w') as f:
        json.dump(data, f)
                

# get_brands_name_and_variation_name_for_offers()
