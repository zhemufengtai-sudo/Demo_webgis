/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2021/1/9
 * Description : NeDB for model service container database
 */

const nedb = require('nedb');
const setting = require('../setting');
 

const db = new nedb({
  filename: setting.nedb.path,
  autoload: true
});

module.exports = db;