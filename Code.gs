function onInstall(e) {
  // Perform additional setup as needed.
}

/**
* Retrieve current balance in native currency, e.g. EUR, from your Coinbase.com Ether wallet.
* @see https://developers.coinbase.com/docs/wallet/api-key-authentication 
*/
function getCoinbaseEther(coinbaseApiKey, coinbaseApiSecret) {
    
  //API credentials missing
  if(coinbaseApiKey == 'enter your API key' || coinbaseApiSecret == 'enter your API secret') {
    return 'Please set Coinbase API Key and Secret in "Settings" first.';
  }
  
  //Fallback return value
  var native_balance = 0.00;
  
  //Const and basic data
  var apiUrl = 'https://api.coinbase.com';
  var implementationDate = '2017-07-23';
  var date = new Date();
  var nonce = Math.floor((date.getTime()/1000)).toString();

  //Build request
  var method = 'GET'; 
  var requestPath = '/v2/accounts'; //https://developers.coinbase.com/api/v2#list-accounts
  var body = ''; //The body is the request body string or omitted if there is no request body (typically for GET requests).
  
  //Encrypt signature
  var signaturePlaintext = nonce + method + requestPath + body;
  var signatureByteHash = Utilities.computeHmacSha256Signature(signaturePlaintext, coinbaseApiSecret); //SHA256 HMAC, returns Byte[]
  var signatureHexHash = signatureByteHash.reduce(function(str,chr){ //Convert to hex
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');;
  
  //Make request and get JSON
  var requestUrl = apiUrl + requestPath;
  var params = {
    'method': method,
    'headers': {
      'CB-ACCESS-KEY': coinbaseApiKey, //The api key as a string
      'CB-ACCESS-SIGN': signatureHexHash, //Message signature
      'CB-ACCESS-TIMESTAMP': nonce, //A timestamp for your request
      'CB-VERSION': implementationDate //header which guarantees that your call is using the correct API version. Version is passed in as a date (UTC) of the implementation in YYYY-MM-DD format.
    }
  };
  var responseJson = UrlFetchApp.fetch(requestUrl, params);
  
  //Pre-process
  var responseObj = JSON.parse(responseJson);
  var data = responseObj.data;
  
  //Read wallets
  Object.keys(data).forEach(function(key) {
    
    var wallet = data[key];
    
    //Look for ETH wallet
    if(wallet.name == 'ETH Wallet') {
      native_balance = wallet.native_balance.amount + ' ' + wallet.native_balance.currency;
      return native_balance;
    }
        
  });

  //Shouldn't happen
  return native_balance;
  
}