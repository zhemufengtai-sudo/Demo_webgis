var fs = require('fs');

var ModelSerCtrl = require('./control/modelSerControl');
var FileOpera = require('./utils/fileOpera');
var Setting = require('./setting');
var CommonMethod = require('./utils/commonMethod');
var Process = require('process');
const path = require('path');

// var Sleep = async (duration) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(resolve, duration);
//     });
// };

var BatchUpload = {}

BatchUpload.batch = async function(){
    let uploadPath = Setting.dirname + '/upload/';
    const fields = {
        u_name: '[OpenGMS]',
        u_email: '[Unknown]',
        ms_permission: 0,
        ms_limited: 0,
        batch: true,
    };

    let dirs = fs.readdirSync(uploadPath).filter(f => f.endsWith('.zip'));
    let successCount = 0;
    let errorCount = 0;
    let errList = [];

    console.log(`[${dirs.length}] packages detected in total.`);

    for (let i = 0; i < dirs.length; i++) {
        const zipName = dirs[i];
        const cmd = `4 ${zipName}`;

        console.log(`\n[${i + 1}/${dirs.length}] Deploying ${zipName} ...`);

        // 用Promise包装异步调用，实现串行控制
        await new Promise((resolve) => {
            CommonMethod.childProcess(cmd, (err, std) => {
                if (err) {
                    errorCount++;
                    errList.push(zipName);
                    console.log(`Error in deploying: [${zipName}]`);
                    console.log(`Error: ${JSON.stringify(err)}`);
                    console.log(`stdout: ${std?.stdout || ''}`);
                    console.log(`stderr: ${std?.stderr || ''}`);
                } else {
                    successCount++;
                    console.log(`Successfully deployed: [${zipName}]`);
                }
                resolve();
            });
        });
    }

    console.log('\nAll deployment finished!');
    console.log(`${successCount} succeeded`);
    console.log(`${errorCount} failed`);

    // 写错误列表
    const errFilePath = path.join(uploadPath, 'errlist.json');
    fs.writeFileSync(errFilePath, JSON.stringify(errList, null, 2));
    console.log(`Error list written to ${errFilePath}`);

    process.exit(0); // 正确退出
}

BatchUpload.fork = async function(pkgpath){
    let fields = {};
    fields.u_name = '[OpenGMS]';
    fields.u_email = '[Unknown]';
    fields.ms_permission = 0;
    fields.ms_limited = 0;
    fields.batch = true;

    let path = Setting.dirname + '/upload/';
    ModelSerCtrl.addNewModelSer(fields, {file_model : {path : path + pkgpath}}, function(err, result){
        if(err){
            console.log("Error : [" + JSON.stringify(err) + "]");
        }
        console.log("Result : [" + JSON.stringify(result) + "]");
        Process.exit(1);
    });
}

module.exports = BatchUpload;

