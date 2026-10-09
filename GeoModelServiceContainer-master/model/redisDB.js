/**
 * Created by Franklin on 2016/7/31.
 */
var setting = require('../setting');

var redis = require('redis');
var client = redis.createClient(setting.redis.port, setting.redis.host);
client.auth(setting.redis.pwd);

module.exports = client;