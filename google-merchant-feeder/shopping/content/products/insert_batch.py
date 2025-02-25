#!/usr/bin/python
#
# Copyright 2016 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Adds several products to the specified account, in a single batch."""

from __future__ import absolute_import
from __future__ import print_function
import json
import sys

from shopping.content import common
from shopping.content.products import sample
# connect to mongoDB
from pymongo import MongoClient


# Number of products to insert.
BATCH_SIZE = 5


def main(argv):
    # Authenticate and construct service.
    service, config, _ = common.init(argv, __doc__)
    merchant_id = config['merchantId']

    client = MongoClient('localhost', 27017)

    db = client['xpressbeauty']
    collection = db['products']
    products = collection.find()
    batch = {
        'entries': [{
            'batchId': i,
            'merchantId': merchant_id,
            'method': 'insert',
            'product':
            {
                'offerId':
                str(product['_id']),
                'title':
                product['product_name'],
                'description':
                product['description'],
                'link':
                product['product_name'].replace(' ', '-'),
                'imageLink':
                product['imgs'][0],
                'contentLanguage':
                "en",
                'targetCountry':
                "CA",
                'channel':
                "online",
                'availability':
                product['quantity_on_hand'] > 0 and 'in stock' or 'out of stock',
                'condition':
                'new',
                'googleProductCategory':
                f'''{product['category'][0]["main"]} > {product['category'][0]["name"]}''',
                'gtin':
                product['upc'],
                'price': {
                    'value': str(product['price']['regular']),
                    'currency': 'CAD'
                },
                'shipping': [{
                    'country': 'US',
                    'service': 'Standard shipping',
                    'price': {
                        'value': '15',
                        'currency': 'USD'
                    }
                }],
            },
        } for i in products[:BATCH_SIZE]

        ],
    }

    request = service.products().custombatch(body=batch)
    result = request.execute()

    if result['kind'] == 'content#productsCustomBatchResponse':
        entries = result['entries']
        for entry in entries:
            product = entry.get('product')
            errors = entry.get('errors')
            if product:
                print('Product "%s" with offerId "%s" was created.' %
                      (product['id'], product['offerId']))
            elif errors:
                print('Errors for batch entry %d:' % entry['batchId'])
                print(json.dumps(errors, sort_keys=True, indent=2,
                                 separators=(',', ': ')))
    else:
        print('There was an error. Response: %s' % result)


if __name__ == '__main__':
    main(sys.argv)
