import csv
import time
from bs4 import BeautifulSoup
import tkinter as tk
from tkinter import *
from tkinter import ttk
from tkinter import filedialog
import requests
import re
from urllib.parse import urlparse, urlunparse, urlencode, parse_qs


def get_data(path, searchs_by):
    for search_by in searchs_by.split(','):
        with open(path, 'w', newline='', encoding='utf8') as outcsv:
            writer = csv.DictWriter(
                outcsv, fieldnames=["place_name", "address", "phone", "domain_name", "email"])
            writer.writeheader()
            outcsv.close()

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        search_url = f"https://www.google.com/search?q={search_by.replace(' ', '+')}"
        browser = requests.get(search_url, headers=headers)

        time.sleep(5)

        html = browser.text
        soup = BeautifulSoup(html, "lxml")
        g_links = soup.find_all('g-more-link')
        more_business_g_link = ""
        for link in g_links:
            if link.text == 'More businesses':
                more_business_g_link = link
                break
        a = more_business_g_link.findNext('a')
        browser = requests.get(a['href'], headers=headers)

        next_available = True
        while next_available:

            time.sleep(5)
            soup = BeautifulSoup(browser.text, "lxml")
            all_cards = soup.find_all(
                'div', {'data-test-id': 'organic-list-card'})
            if len(all_cards) == 0:
                break

            for card in all_cards:
                try:
                    time.sleep(5)
                    card_slide_url = 'https://www.google.com' + \
                        card['data-profile-url-path']
                    card_slide = requests.get(card_slide_url, headers=headers)

                    soup1 = BeautifulSoup(card_slide.text, "lxml")

                    main_div = soup1.find(
                        'div', {'aria-labelledby': "overview"})

                    excel_row = {}
                    try:
                        nameElm = soup1.select('c-wiz[data-name]')
                        excel_row['place_name'] = nameElm[0].attrs["data-name"]
                    except:
                        excel_row['place_name'] = ""

                    try:
                        excel_row['address'] = main_div.find(
                            'a', {'aria-label': "Address"}).text
                    except:
                        excel_row['address'] = ""

                    try:
                        phoneElm = main_div.select('a[data-phone-number]')
                        excel_row['phone'] = phoneElm[0].attrs["data-phone-number"]
                    except:
                        excel_row['phone'] = ""

                    try:
                        website_div = main_div.find(
                            'div', {'class', "Gx8NHe"}).text
                        excel_row['domain_name'] = website_div.replace(
                            'http://', '').replace('https://', '').replace('www.', '').replace('/', '')
                    except:
                        excel_row['domain_name'] = ""

                    try:
                        sub_div = main_div.find('a', {'class': "iPF7ob"})
                        website_url = sub_div.get('href')
                        website = requests.get(website_url, headers=headers)
                        time.sleep(3)

                        web_text = website.text
                        regexToMatchEmail = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        email = re.search(regexToMatchEmail, web_text)
                        excel_row['email'] = email[0]

                    except:
                        excel_row['email'] = ""

                    with open(path, 'a', newline='', encoding='utf8') as outcsv:
                        writer = csv.writer(outcsv)
                        writer.writerow([excel_row['place_name'], excel_row['address'],
                                        excel_row['phone'], excel_row['domain_name'], excel_row['email']])
                        outcsv.close()

                except:
                    continue

            try:
                parsed_url = urlparse(browser.url)
                query_params = parse_qs(parsed_url.query)
                if 'lci' not in query_params:
                    query_params['lci'] = 20
                else:
                    lci_num = int(query_params['lci'][0])
                    query_params['lci'] = lci_num + 20

                new_query_string = urlencode(query_params, doseq=True)
                updated_url = urlunparse(
                    parsed_url._replace(query=new_query_string))
                browser = requests.get(updated_url, headers=headers)

            except Exception as e:
                print(e)
                next_available = False


filePath = ''
search = ''


def googleRun():

    window = tk.Tk()
    window.geometry("450x150")
    window.title("Google Data Scraper")

    def getFilePath():
        global filePath
        filePath = filedialog.askopenfilename(
            title="Select an Excel file",
            filetypes=(("Excel files", "*.csv"), ("All files", "*.*"))
        )
        E.insert(0, filePath)

    def saveSearch():
        global search
        search = searchBox.get().strip()

    def search_data():
        saveSearch()
        get_data(filePath, search)

    def shutDownBrowser():
        window.quit()

    E = Entry(window, textvariable=filePath, width=50)
    E.grid(column=1, row=0, columnspan=4, padx=5, pady=5, sticky=tk.W)
    excel_file = ttk.Button(
        window, text="Choose excel file:", command=getFilePath)
    excel_file.grid(column=0, row=0, padx=5, pady=5, sticky=tk.W)

    searchLabel = tk.Label(window, text="Enter search: ")
    searchLabel.grid(column=0, row=1, padx=5, pady=0, sticky=tk.W)
    searchBox = Entry(window, textvariable=search, width=50)
    searchBox.grid(column=1, row=1, columnspan=4,
                   padx=5, pady=5, sticky="nsew")

    submitButton = tk.Button(window, text="Submit",
                             bg="green", command=search_data, fg="white")
    submitButton.grid(column=4, row=3, padx=5, pady=5, sticky=tk.E)

    exitButton = tk.Button(window, text="Exit", bg="red",
                           command=shutDownBrowser, fg="white")
    exitButton.grid(column=4, row=4, padx=5, pady=5, sticky=tk.E)

    window.mainloop()
