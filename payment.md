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
curl

curl --location -g 'https://{{host}}/v1/Collect' \
--data-urlencode 'mchId=1000' \
--data-urlencode 'currency=BDT' \
--data-urlencode 'out_trade_no=20211012151100001' \
--data-urlencode 'pay_type=BKASH' \
--data-urlencode 'money=100' \
--data-urlencode 'attach=' \
--data-urlencode 'notify_url=https://www.sandbox.wpay.one/callback/payin' \
--data-urlencode 'returnUrl=https://www.google.com' \
--data-urlencode 'sign=254462b461f2ddb35f0d62947c236543'

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