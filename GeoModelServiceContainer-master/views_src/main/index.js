/**
 * Created by Franklin on 2017/3/14.
 */
var React = require('react');
var ReactDOM = require('react-dom');

var RmtModelSerTable = require('../components/modelSer/rmtModelSerTable');
var RmtModelSerRunTable = require('../components/modelSerRun/rmtModelSerRunTable');
var ModelSerInfo = require('../components/modelSer/modelSerInfo');
var SystemSetting = require('../components/systemSetting/systemSetting');
var ChildrenTable = require('../components/children/ChildrenTable');
var ParentPanel = require('../components/systemSetting/parentPanel');
var CloudModelSerTable = require('../components/modelSer/cloudModelSerTable');
var DataCollectionTable = require('../components/data/dataCollectionTable');
var DataPreparation = require('../components/data/dataPreparation');
var ModelSerUploader = require('../components/modelSer/modelSerUploader');
var EnviroPanel = require('../components/enviro/enviroPanel');
var EnMatchPanel = require('../components/enviro/enMatchPanel');
var EnMatchStepy = require('../components/enviro/enMatchStepy');
var UserInfo = require('../components/systemSetting/userInfo');
var LoginPanel = require('../components/systemSetting/loginPanel');
var TestifyDataPanel = require('../components/data/TestifyDataPanel');
var ModelSerDetail = require('../components/modelSer/modelSerDetail');
var CustomIndexPanel = require('../components/systemSetting/customIndex');
var CustomInfoPanel = require('../components/systemSetting/customInfo');
var ModelSerRunInfo = require('../components/modelSerRun/modelSerRunInfo');
var ModelSerDeployment = require('../components/modelSer/modelSerDeployment');
var ModelSerTransform = require('../components/modelSer/modelserTranform');
var ModelInsTable = require('../components/modelSer/modelInsTable');
var ModelSerRunStatistic = require('../components/modelSerRun/modelSerRunStatistic');
var ModelSerRunPieStatisitc = require('../components/modelSerRun/modelSerRunPieStatistic');
var NoticeTable = require('../components/systemSetting/noticeTable');
var DataVisualization = require('../components/relatedSer/dataVisualization');
var VisualizeSerDeployment = require('../components/relatedSer/visualizeSerDeployment');
var CheckServerIP = require('../components/systemSetting/checkServerIP');
var VisualizePackage = require('../components/relatedSer/visualizePackage');
var AssemblyInfo  = require('../components/systemSetting/assemblyInfo');

if (document.getElementById('rmtModelSerTable') != null) {
    ReactDOM.render(
        <RmtModelSerTable
            data-source={document.getElementById('rmtModelSerTable').getAttribute('data-source')}
            data-type={document.getElementById('rmtModelSerTable').getAttribute('data-type')}
            data-host={document.getElementById('rmtModelSerTable').getAttribute('data-host')}
        />,
        document.getElementById('rmtModelSerTable'));
}

//check serverip change
// if(document.getElementById('checkServerIP') != null){
//     ReactDOM.render(
//         <CheckServerIP />,document.getElementById('checkServerIP')
//     );
// }

if (document.getElementById('modelserinfo') != null) {
    ReactDOM.render(<ModelSerInfo source={document.getElementById('modelserinfo').getAttribute('data-source')} />,
        document.getElementById('modelserinfo'));
}

if (document.getElementById('ModelSerDetail') != null) {
    ReactDOM.render(<ModelSerDetail
        data-source={document.getElementById('ModelSerDetail').getAttribute('data-source')}
        data-source-msr={document.getElementById('ModelSerDetail').getAttribute('data-source-msr')}
        data-source-msrstatistic={document.getElementById('ModelSerDetail').getAttribute('data-source-msrstatistic')}
        data-type={document.getElementById('ModelSerDetail').getAttribute('data-type')}
        data-host={document.getElementById('ModelSerDetail').getAttribute('data-host')}
    />,
        document.getElementById('ModelSerDetail'));
}

if (document.getElementById('rmtModelSerRunTable') != null) {
    ReactDOM.render(<RmtModelSerRunTable
        data-source={document.getElementById('rmtModelSerRunTable').getAttribute('data-source')}
        data-type={document.getElementById('rmtModelSerRunTable').getAttribute('data-type')}
        data-host={document.getElementById('rmtModelSerRunTable').getAttribute('data-host')}
    />,
        document.getElementById('rmtModelSerRunTable'));
}

if(document.getElementById('ModelSerRunInfo') != null) {
    ReactDOM.render(<ModelSerRunInfo
        data-source={ document.getElementById('ModelSerRunInfo').getAttribute('data-source') }
        data-type={ document.getElementById('ModelSerRunInfo').getAttribute('data-type') }
    />,
        document.getElementById('ModelSerRunInfo'));
}

if (document.getElementById('settingPage') != null) {
    ReactDOM.render(<SystemSetting source="/settings" />,
        document.getElementById('settingPage'));
}

if (document.getElementById('assemblyPage') != null) {
    ReactDOM.render(<AssemblyInfo source="/assemblies" />,
        document.getElementById('assemblyPage'));
}

if (document.getElementById('CustomIndexPanel') != null) {
    ReactDOM.render(<CustomIndexPanel />,
        document.getElementById('CustomIndexPanel'));
}

if (document.getElementById('CustomInfoPanel') != null) {
    ReactDOM.render(<CustomInfoPanel />,
        document.getElementById('CustomInfoPanel'));
}

if (document.getElementById('childPanel') != null) {
    ReactDOM.render(<ChildrenTable source="/child-node/json/all" />,
        document.getElementById('childPanel'));
}

if (document.getElementById('parentPanel') != null) {
    ReactDOM.render(<ParentPanel source="/parent" />,
        document.getElementById('parentPanel'));
}

if (document.getElementById('cloudModelSerTable') != null) {
    ReactDOM.render(<CloudModelSerTable data-source={document.getElementById('cloudModelSerTable').getAttribute('data-source')} />,
        document.getElementById('cloudModelSerTable'));
}

if (document.getElementById('dataCollectionTable') != null) {
    ReactDOM.render(<DataCollectionTable source="/geodata/json/all" />,
        document.getElementById('dataCollectionTable'));
}

if (document.getElementById('userInfo') != null) {
    ReactDOM.render(<UserInfo />,
        document.getElementById('userInfo'));
}

if (document.getElementById('loginPanel') != null) {
    ReactDOM.render(<LoginPanel />,
        document.getElementById('loginPanel'));
}

if (document.getElementById('modelSerUploader') != null) {
    ReactDOM.render(<ModelSerUploader
        data-source-category="/modelser/cloud/category"
        data-msid={document.getElementById('modelSerUploader').getAttribute('data-msid')} />,
        document.getElementById('modelSerUploader'));
}

if (document.getElementById('ModelSerTransform') != null) {
    ReactDOM.render(<ModelSerTransform
        data-source-category="/modelser/cloud/category"
    />,
        document.getElementById('ModelSerTransform'));
}

if (document.getElementById('DataPreparation') != null) {
    ReactDOM.render(<DataPreparation
        data-source={document.getElementById('DataPreparation').getAttribute('data-source')}
        data-type={document.getElementById('DataPreparation').getAttribute('data-type')}
        data-host={document.getElementById('DataPreparation').getAttribute('data-host')} />,
        document.getElementById('DataPreparation'));
}

if (document.getElementById('TestifyDataPanel') != null) {
    ReactDOM.render(<TestifyDataPanel
        data-source={document.getElementById('TestifyDataPanel').getAttribute('data-source')}
        data-type={document.getElementById('TestifyDataPanel').getAttribute('data-type')}
    />,
        document.getElementById('TestifyDataPanel'));
}

if (document.getElementById('enviro-section') != null) {
    var width = $('#swe').width() - 60;
    var tabletree = {
        editable: true,
        checkbox: false,
        operate: true,
        autowidth: true,
        css: {
            width: {
                tabletree: width,
                title: (width - 140) / 2,
                value: (width - 140) / 2
            }
        }
    };
    var fields = [{
        title: 'name',
        type: 'string'
    }, {
        title: 'version',
        type: 'string'
    }, {
        title: 'description',
        type: 'string'
    }, {
        title: 'type',
        type: 'string'
    }, {
        title: 'platform',
        type: 'string'
    }, {
        title: 'alias',
        type: 'Array'
    }];
    ReactDOM.render(<EnviroPanel
        tableID='swe-table'
        type="software"
        tabletree={tabletree}
        fields={fields}
    />, document.getElementById('swe'));

    fields = [{
        title: 'name',
        type: 'string'
    }, {
        title: 'value',
        type: 'string'
    }];
    ReactDOM.render(<EnviroPanel
        tableID='hwe-table'
        type="hardware"
        tabletree={tabletree}
        fields={fields}
    />, document.getElementById('hwe'));
}

if (document.getElementById('enMatch-section') != null) {
    var width = $('#enMatch-section').width() - 100;
    var css = {
        width: {
            tabletree: width,
            title: (width - 140) / 5,
            demand: (width - 140) * 2 / 5,
            enviro: (width - 140) * 2 / 5
        }
    };
    ReactDOM.render(<EnMatchPanel
        pid={$('#enMatch-section').attr('data-pid')}
        place={$('#enMatch-section').attr('data-pidPlace')}
        css={css}
    />, document.getElementById('enMatch-section'));
}

if (document.getElementById('enMatchModal') != null) {
    var width = $('#enMatchModal').width() - 50;
    var css = {
        width: {
            tabletree: width,
            // title: (width - 140) / 5,
            // demand: (width - 140) * 2 / 5,
            // enviro: (width - 140) * 2 / 5
            title: width * 0.2,
            demand: width * 0.4,
            enviro: width * 0.4
        }
    };
    ReactDOM.render(<EnMatchStepy
        id = {document.getElementById('enMatchModal').getAttribute('oid')}
        pid = {document.getElementById('enMatchModal').getAttribute('pid')}
        place = {document.getElementById('enMatchModal').getAttribute('place')}
        css={css}
    />, document.getElementById('enMatchModal'));
}

if (document.getElementById('ModelSerDeployment') != null) {
    ReactDOM.render(<ModelSerDeployment
        data-source-category="/modelser/cloud/category"
        data-type={document.getElementById('ModelSerDeployment').getAttribute('data-type')}
        data-host={document.getElementById('ModelSerDeployment').getAttribute('data-host')}
    />, document.getElementById('ModelSerDeployment'));
}

//datavisualization add by wangming 2018.1.23
if (document.getElementById('dataVisualization') != null) {
    ReactDOM.render(<DataVisualization
        data-type={document.getElementById('dataVisualization').getAttribute('data-type')}
        data-source={document.getElementById('dataVisualization').getAttribute('data-source')}
    />, document.getElementById('dataVisualization'));
}

//visualizeDeployment add by wangming 2018.1.29
if (document.getElementById('VisualizeServerDeployment') != null) {
    ReactDOM.render(<VisualizeSerDeployment
        data-type={document.getElementById('VisualizeServerDeployment').getAttribute('data-type')}
        data-host={document.getElementById('VisualizeServerDeployment').getAttribute('data-host')}
    />, document.getElementById('VisualizeServerDeployment'));
}

//visualizePackage add by wangming 2018.4.4
if (document.getElementById('visualizePackage') != null) {
    ReactDOM.render(<VisualizePackage
        data-source={document.getElementById('visualizePackage').getAttribute('data-source')}
        data-host={document.getElementById('visualizePackage').getAttribute('data-host')}
        data-gdid={document.getElementById('visualizePackage').getAttribute('data-gdid')}
    />, document.getElementById('visualizePackage'));
}

if (document.getElementById('ModelInsTable') != null) {
    ReactDOM.render(<ModelInsTable
        data-source={document.getElementById('ModelInsTable').getAttribute('data-source')}
        data-type={document.getElementById('ModelInsTable').getAttribute('data-type')}
    />, document.getElementById('ModelInsTable'));
}

if (document.getElementById('ModelSerRunStatistic') != null) {
    ReactDOM.render(<ModelSerRunStatistic
        data-source={document.getElementById('ModelSerRunStatistic').getAttribute('data-source')}
    />, document.getElementById('ModelSerRunStatistic'));
}

if (document.getElementById('ModelSerRunPieStatisitc') != null) {
    ReactDOM.render(<ModelSerRunPieStatisitc
        data-source={document.getElementById('ModelSerRunPieStatisitc').getAttribute('data-source')}
    />, document.getElementById('ModelSerRunPieStatisitc'));
}

if (document.getElementById('NoticeTable') != null) {
    ReactDOM.render(<NoticeTable
    />, document.getElementById('NoticeTable'));
}