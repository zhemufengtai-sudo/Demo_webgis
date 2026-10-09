var modelSerRouter = require('./modelser');
var modelSerRunRouter = require('./modelserrun');
var dataRouter = require('./data');
var taskRouter = require('./task');

module.exports = function(app)
{
    modelSerRouter(app);

    modelSerRunRouter(app);

    dataRouter(app);

    taskRouter(app);
}