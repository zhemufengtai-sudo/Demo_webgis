var crypto = require('crypto');
var algorithm = 'aes-256-cbc';
var key = 'ae3e712c-ccdf-4964-b819-c85770146485';

var Crypto = function(){

};

Crypto.crypto = function(buffer){
    var encrypted = "";
    var cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(buffer, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
};

Crypto.decrypto = function(buffer){
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(buffer, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted;
};

module.exports =  Crypto;