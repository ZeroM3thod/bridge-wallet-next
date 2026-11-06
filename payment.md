POSTBangladesh PayIn
https://{{host}}/v1/Collect
Bodyurlencoded
mchId

1000

merchant Id
currency

BDT

currency code
out_trade_no

20211012151100001

merchant order number
pay_type

BKASH

payment type（BKASH,NAGAD,ROCKET,BKASH-C , NAGAD-C）
money

100

order amount，integer
attach

Additional data, callback as is
notify_url

callback_payin_url

callback url
returnUrl

https://www.google.com

jump to url after successful payment
sign

254462b461f2ddb35f0d62947c236543

sign
Example Request
Bangladesh PayIn
View More
nodejs

var https = require('follow-redirects').https;
var fs = require('fs');

var qs = require('querystring');

var options = {
  'method': 'POST',
  'hostname': '{{host}}',
  'path': '/v1/Collect',
  'headers': {
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = qs.stringify({
  'mchId': '1000',
  'currency': 'BDT',
  'out_trade_no': '20211012151100001',
  'pay_type': 'BKASH',
  'money': '100',
  'attach': '',
  'notify_url': 'https://www.sandbox.wpay.one/callback/payin',
  'returnUrl': 'https://www.google.com',
  'sign': '254462b461f2ddb35f0d62947c236543'
});

req.write(postData);

req.end();

200 OK
Example Response

    Body
    Headers (16)

View More
json

{
    "code": 0,//0 success
    "msg": "success",
    "data": {
        "url": "https://sandbox.wpay.one/Cashier/Index/cad77bda65404ee0b7d2f9f2b9abb197",//payment url
        "transaction_Id": "cad77bda65404ee0b7d2f9f2b9abb197"//platform order number
    }
}