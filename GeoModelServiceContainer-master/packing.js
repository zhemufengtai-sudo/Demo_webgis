/**
 * Author: Fengyuan(Franklin) Zhang
 * Date: 2023/4/1
 * Description: Packing for models
 */

var fs = require('fs-extra');
var path = require('path');
var CommonMethod = require('./utils/commonMethod');
var FileOpera = require('./utils/fileOpera');
var Settings = require("./setting");

const mit = 'MIT License \n \
\n \
Copyright (c) [Year] [Your Name]\n \
\n \
Permission is hereby granted, free of charge, to any person obtaining a copy\n \
of this software and associated documentation files (the "Software"), to deal\n \
in the Software without restriction, including without limitation the rights\n \
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n \
copies of the Software, and to permit persons to whom the Software is\n \
furnished to do so, subject to the following conditions:\n \
\n \
The above copyright notice and this permission notice shall be included in all\n \
copies or substantial portions of the Software.\n \
\n \
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n \
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n \
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n \
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n \
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n \
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n \
SOFTWARE.'

const apache = 'Apache License 2.0\n \
\n \
Copyright [Year] [Your Name]\n \
\n \
Licensed under the Apache License, Version 2.0 (the "License");\n \
you may not use this file except in compliance with the License.\n \
You may obtain a copy of the License at\n \
\n \
    http://www.apache.org/licenses/LICENSE-2.0\n \
\n \
Unless required by applicable law or agreed to in writing, software\n \
distributed under the License is distributed on an "AS IS" BASIS,\n \
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n \
See the License for the specific language governing permissions and\n \
limitations under the License.'

const gpl = 'GNU General Public License v3.0\n \
\n \
Copyright (c) [Year] [Your Name]\n \
\n \
This program is free software: you can redistribute it and/or modify\n \
it under the terms of the GNU General Public License as published by\n \
the Free Software Foundation, either version 3 of the License, or\n \
(at your option) any later version.\n \
\n \
This program is distributed in the hope that it will be useful,\n \
but WITHOUT ANY WARRANTY; without even the implied warranty of\n \
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n \
GNU General Public License for more details.\n \
\n \
You should have received a copy of the GNU General Public License\n \
along with this program. If not, see https://www.gnu.org/licenses/.'


var Packing = function(configfile){
    var modelname = "";
    var author = "";
    var programming = "";
    var license = "";
    var wrappingfile = "";
    var mdlfile = "";
    var targetpath = "";
    var modelfiles = [];
    
    //! read config file
    var configbody = fs.readFileSync(configfile).toString();
    configbody = configbody.substring(0, configbody.length - 1).split("\n");

    for(var i = 0; i < configbody.length; i++){
        var params = configbody[i].split("||");
        if(params[0].includes("modelname")){
            modelname = params[1];
            continue;
        }
        if(params[0] == "author"){
            author = params[1];
            continue;
        }
        if(params[0] == "programming"){
            programming = params[1];
            continue;
        }
        else if(params[0] == "license"){
            license = params[1];
            continue;
        }
        else if(params[0] == "wrappingfile"){
            wrappingfile = params[1];
            continue;
        }
        else if(params[0] == "mdlfile"){
            mdlfile = params[1];
            continue;
        }
        else if(params[0] == "targetpath"){
            targetpath = params[1];
            continue;
        }
        else if(params[0] == "modelfile"){
            modelfiles.push(params[1]);
            continue;
        }
    }
    // console.log(configbody);
    
    //! organization files
    var baseDir = path.dirname(configfile) + "/tmp_" + CommonMethod.createGUID() + "/"
    if (targetpath == ""){
        targetpath = path.dirname(configfile) + "/" + modelname + ".zip"
    }
    else{
        targetpath = targetpath + "/" + modelname + ".zip"
    }
    fs.mkdirSync(baseDir);
    fs.mkdirSync(baseDir + "model/");
    fs.mkdirSync(baseDir + "assembly/");
    fs.mkdirSync(baseDir + "supportive/");
    fs.mkdirSync(baseDir + "testify/");
    const now = new Date()
    if (license == "MIT"){
        fs.writeFileSync(baseDir + "license.txt", mit.replace("[Year]", now.getFullYear().toString()).replace("[Your Name]", "OpenGMS and " + author));
    }
    else if (license == "Apache"){
        fs.writeFileSync(baseDir + "license.txt", apache.replace("[Year]", now.getFullYear().toString()).replace("[Your Name]", "OpenGMS and " + author));
    }
    else if (license == "GPL"){
        fs.writeFileSync(baseDir + "license.txt", gpl.replace("[Year]", now.getFullYear().toString()).replace("[Your Name]", "OpenGMS and " + author));
    }
    
    if (programming == "Python"){
        // fs.copySync("./resource/libs/python", baseDir + "model/");
        fs.copySync(Settings.dirname + "/../resource/libs/python", baseDir + "model/");
    }
    else if (programming == "CSharp"){
        // fs.copySync("./resource/libs/csharp", baseDir + "model/");
        fs.copySync(Settings.dirname + "/../resource/libs/csharp", baseDir + "model/");
    }

    var suffix = ".py"
    if (programming == "Python"){suffix = ".py"}
    else if (programming == "CSharp"){suffix = ".exe"}

    fs.copyFileSync(wrappingfile, baseDir + "model/" + modelname + suffix);
    // fs.copyFileSync(mdlfile, baseDir + "model/" + modelname + ".mdl");

    var mdlStream = fs.readFileSync(mdlfile).toString();
    modelfilename = path.basename(wrappingfile);
    mdlStream = mdlStream.replace(modelfilename, modelname + suffix);
    fs.writeFileSync(baseDir + "model/" + modelname + ".mdl", mdlStream);

    for (var i = 0; i < modelfiles.length; i++){
        let stat = fs.lstatSync(modelfiles[i])
        if (stat.isFile()){
            fs.copyFileSync(modelfiles[i], baseDir + "model/" + path.basename(modelfiles[i]));
        }
        else if(stat.isDirectory()){
            fs.copySync(modelfiles[i], baseDir + "model/" + path.basename(modelfiles[i]));
        }
    }

    //! Packing
    CommonMethod.compress(targetpath, baseDir);

    //! Delete files
    FileOpera.rmdir(baseDir);
    FileOpera.rmdir(configfile);
}

module.exports = Packing;