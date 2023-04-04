import data2xml from "data2xml";
// const data2xml = require("data2xml");
const convert = data2xml({
  xmlHeader:
    '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n',
});

function fetchRequests(callback: any) {
  buildRequests(callback);
}

/**
 * Called when a qbXML response
 * is returned from QBWC.
 *
 * @param response - qbXML response
 */
function handleResponse(response: any) {
  console.log(response);
}

/**
 * Called when there is an error
 * returned processing qbXML from QBWC.
 *
 * @param error - qbXML error response
 */
function didReceiveError(error: any) {
  console.log(error);
}

export default {
  fetchRequests,
  handleResponse,
  didReceiveError,
};

function buildRequests(callback: any) {
  const requests = [];
  const fetch_product = convert("QBXML", {
    QBXMLMsgsRq: {
      _attr: { onError: "stopOnError" },
      ItemInventoryQueryRq: {
        FullName: "DCFX787B",
      },
    },
  });
  requests.push(fetch_product);

  const add_customer = convert("QBXML", {
    QBXMLMsgsRq: {
      _attr: { onError: "stopOnError" },
      CustomerAddRq: {
        CustomerAdd: {
          Name: "Nick Medonca",
          FirstName: "Nick",
          LastName: "Medonca",
        },
      },
    },
  });
  requests.push(add_customer);
  const buy_product = convert("QBXML", {
    QBXMLMsgsRq: {
      _attr: { onError: "stopOnError" },
      InvoiceAddRq: {
        'InvoiceAdd defMacro="MACROTYPE"': {
          CustomerRef: {
            FullName: "Nick Medonca",
          },
          InventorySiteRef: { FullName: "INVENTORY" },
          Quantity: "2",
          ItemRef: { FullName: "DCFX787B" },
          Desc: "Item description",
          UnitOfMeasure: "",
        },
      },
    },
  });
  // var buy_product = `<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n<QBXML><QBXMLMsgsRq onError="stopOnError"><InvoiceAddRq><InvoiceAdd defMacro="MACROTYPE"><CustomerRef><FullName>Nick Medonca</FullName></CustomerRef><TxnDate>2023-03-31</TxnDate><BillAddress><Addr1>105 hansen road north</Addr1><City>Brampton</City><State>Ontario</State><PostalCode>L6V3c9</PostalCode><Country>Canada</Country></BillAddress><ShipAddress><Addr1>105 hansen road north</Addr1><City>Brampton</City><State>Ontario</State><PostalCode>L6V3c9</PostalCode><Country>Canada</Country></ShipAddress><InvoiceLineAdd><ItemRef><FullName>DCFX787B</FullName></ItemRef><Quantity>2</Quantity><Rate>2</Rate></InvoiceLineAdd></InvoiceAdd></InvoiceAddRq></QBXMLMsgsRq></QBXML>`;
  console.log(buy_product);
  requests.push(buy_product);
  return callback(null, requests);
}
