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
"""This example adds a datafeed to a specified account."""

from __future__ import print_function
import sys

from content import common
from content.datafeeds import sample


def main(argv):
    # Authenticate and construct service.
    service, config, _ = common.init(argv, __doc__)
    merchant_id = config['merchantId']

    name = 'feed%s' % common.get_unique_id()
    datafeed = sample.create_datafeed_sample(config, name)

    # Add datafeed.
    request = service.datafeeds().insert(merchantId=merchant_id, body=datafeed)

    result = request.execute()

    print('Datafeed with name "%s" and ID %s was created.' %
          (result['name'], result['id']))


if __name__ == '__main__':
    main(sys.argv)
