function onInstall(e) {
  // Perform additional setup as needed.
}

var coinbaseData = null;
var gdaxData = null;
var native_balance = 0.0;

/**
* Retrieve current balance in native currency, e.g. EUR, from your Coinbase.com Ether wallet.
* @see https://developers.coinbase.com/docs/wallet/api-key-authentication 
*/
function getCoinbaseEther(coinbaseApiKey, coinbaseApiSecret) {
    
  if(coinbaseData === null) {
    getCoinbaseData(coinbaseApiKey, coinbaseApiSecret);
  }
  
  //Read wallets
  Object.keys(coinbaseData).forEach(function(key) {
    
    var wallet = coinbaseData[key];
    
    //Look for ETH wallet
    if(wallet.name == 'ETH Wallet') {
      native_balance = parseFloat(wallet.native_balance.amount);
      return native_balance;
    }
        
  });

  //Shouldn't happen
  return native_balance;
  
}


/**
* Retrieve current balance in native currency, e.g. EUR, from your Coinbase.com Bitcoin wallet.
* @see https://developers.coinbase.com/docs/wallet/api-key-authentication 
*/
function getCoinbaseBitcoin(coinbaseApiKey, coinbaseApiSecret) {
    
  if(coinbaseData === null) {
    getCoinbaseData(coinbaseApiKey, coinbaseApiSecret);
  }
  
  //Read wallets
  Object.keys(coinbaseData).forEach(function(key) {
    
    var wallet = coinbaseData[key];
    
    //Look for BTC wallet
    if(wallet.name == 'BTC Wallet') {
      native_balance = parseFloat(wallet.native_balance.amount);
      return native_balance;
    }
        
  });

  //Shouldn't happen
  return native_balance;
  
}

/**
* Retrieve current balance from your Coinbase.com EUR wallet.
* @see https://developers.coinbase.com/docs/wallet/api-key-authentication 
*/
function getCoinbaseEuro(coinbaseApiKey, coinbaseApiSecret) {
    
  if(coinbaseData === null) {
    getCoinbaseData(coinbaseApiKey, coinbaseApiSecret);
  }
  
  //Read wallets
  Object.keys(coinbaseData).forEach(function(key) {
    
    var wallet = coinbaseData[key];
    
    //Look for EUR wallet
    if(wallet.name == 'EUR Wallet') {
      native_balance = parseFloat(wallet.native_balance.amount);
      return native_balance;
    }
        
  });

  //Shouldn't happen
  return native_balance;
  
}

/**
* Retrieve wallets and current balances from Coinbase.com
* @see https://developers.coinbase.com/docs/wallet/api-key-authentication 
*/
function getCoinbaseData(coinbaseApiKey, coinbaseApiSecret) {
  
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
  },'');
  
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
  coinbaseData = responseObj.data;
  
}

/**
* Retrieve prices at coinbase.com
* @param currencyPair e.g. BTC-EUR see https://developers.coinbase.com/api/v2#prices for options
* @param buySell 'buy' or 'sell'
* @see https://developers.coinbase.com/api/v2#prices
*/
function getCoinbasePrice(currencyPair, buySell) {
  
  //Build request
  var method = 'GET';
  var requestPath = '/v2/prices/' + currencyPair + '/' + buySell; //https://developers.coinbase.com/api/v2#prices

  Logger.log(implementationDate);
  
  //Make request and get JSON
  var requestUrl = apiUrl + requestPath;
  var params = {
    'method': method,
    'headers': {
      'CB-VERSION': implementationDate //header which guarantees that your call is using the correct API version. Version is passed in as a date (UTC) of the implementation in YYYY-MM-DD format.
    }
  };
  var responseJson = UrlFetchApp.fetch(requestUrl, params);
  
  //Pre-process
  var responseObj = JSON.parse(responseJson);
  
  //Log
  return parseFloat(responseObj.data.amount);
  
}

/**
* Retrieve current balance from your GDAX EUR account.
* @see https://docs.gdax.com/#accounts
*/
function getGdaxEuro(gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase) {
 
  if(gdaxData === null) {
    getGdaxData(gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase);
  }
  
  //Read accounts
  for(var a=0; a<gdaxData.length; a++) {

    var account = gdaxData[a];
    
    //Look for EUR wallet
    if(account.currency == 'EUR') {
      var balance = parseFloat(account.balance);
      return balance;
    }
    
  }
  
  //Shouldn't happen
  return native_balance;
  
}

/**
* Retrieve current balance from your GDAX ETH account in ETH.
* @see https://docs.gdax.com/#accounts
*/
function getGdaxEther(gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase) {
 
  if(gdaxData === null) {
    getGdaxData(gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase);
  }
  
  //Read accounts
  for(var a=0; a<gdaxData.length; a++) {

    var account = gdaxData[a];
    
    //Look for EUR wallet
    if(account.currency == 'ETH') {
      var balance = parseFloat(account.balance);
      return balance;
    }
    
  }
  
  //Shouldn't happen
  return native_balance;
  
}


/**
* Retrieve accounts and current balances from GDAX
* @see https://docs.gdax.com/#authentication
*/
function getGdaxData(gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase) {
  
  //API credentials missing
  if(gdaxApiKey == 'enter your API key' || gdaxApiSecret == 'enter your API secret' || gdaxApiPassphrase == 'enter your API passphrase') {
    return 'Please set GDAX API Key and Secret in "Settings" first.';
  }
  
  //Fallback return value
  var native_balance = 0.00;
  
  //Const and basic data
  var apiUrl = 'https://api.gdax.com';
  var date = new Date();
  var nonce = Math.floor((date.getTime()/1000)).toString();

  //Build request
  var method = 'GET'; 
  var requestPath = '/accounts'; //https://docs.gdax.com/#accounts
  var body = ''; //The body is the request body string or omitted if there is no request body (typically for GET requests).
  
  //Plaintext signature
  var signaturePlaintext = nonce + method + requestPath + body;
  
  //Base64decode
  var gdaxApiSecretDecoded = CryptoJS.enc.Base64.parse(gdaxApiSecret);
  
  //Creating a sha256 HMAC using the base64-decoded secret key on the plaintext signature
  var signatureHash = CryptoJS.HmacSHA256(signaturePlaintext, gdaxApiSecretDecoded);
  
  //Base64encode
  var signatureBase64 = signatureHash.toString(CryptoJS.enc.Base64);

  //Make request and get JSON
  var requestUrl = apiUrl + requestPath;
  var params = {
    'method': method,
    'headers': {
      'CB-ACCESS-KEY': gdaxApiKey, //The api key as a string
      'CB-ACCESS-SIGN': signatureBase64, //Message signature
      'CB-ACCESS-TIMESTAMP': nonce, //A timestamp for your request
      'CB-ACCESS-PASSPHRASE': gdaxApiPassphrase //The passphrase you specified when creating the API key
    }
  };
  var responseJson = UrlFetchApp.fetch(requestUrl, params);
  
  //Pre-process
  var responseObj = JSON.parse(responseJson);
  gdaxData = responseObj;
  
}


/**
* Include hmac-sha256 and base64 library, due to bug in Google Script
* @see https://issuetracker.google.com/issues/36757327
* @see https://stackoverflow.com/questions/46105421/google-apps-script-equivalent-of-phps-hash-hmac-with-raw-binary-output  
*/

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
d)).finalize(c)}}});var t=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);
(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();