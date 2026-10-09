
function getCookie(name)
{
    var arr,reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function setCookie(name, value)
{
    var Days = 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path=/";
}

window.LanguageConfig = {
            "ConfigName" : "English",
            "SelectButton" : "Languages",
            "Name" : "Model Services Container",
            "Heading" : {
                "Administrator" : {
                    "Title" : "Administrator",
                    "Signature" : "I am Administrator"
                },
                "User" : {
                    "Title" : "User Info",
                    "Info" : "Infomation",
                    "Settings"  : "Settings",
                    "SignOut" : "SignOut"
                },
                "Homepage" : "Homepage",
                "Status" : "Status",
                "Notice" : "Notice",
                "LocalModelService" : {
                    "Title" : "Local Services",
                    "Checking" : "Checking",
                    "Instances" : "Instances",
                    "Records" : "Records",
                    "Deployment" : "Deployment"
                },
                "RemoteModelService" : {
                    "Title" : "Remote Services",
                    "Checking" : "Checking",
                    "Instances" : "Instances",
                    "Records" : "Records",
                    "Network" : "Network"
                },
                "CloudModelService" : "Cloud Services",
                "DataCenter" : "Data Center",
                "Settings" : {
                    "Title" : "Settings",
                    "General" : "General",
                    "Environment" : "Environment"
                }
            },
            "Navigation" : {
                "Notice" : {
                    "Title" : "Notice",
                    "NoMessage" : "No Notice"
                },
                "User" : {
                    "Info" : "Infomation",
                    "Settings"  : "Settings",
                    "SignOut" : "SignOut"
                }
            },
            "Homepage" : {
                "Welcome" : "Welcome to Model Services Container",
                "ModelService" : "Local Services",
                "Notice" : "Notice",
                "Status" : "Status",
                "Deployment" : "Deployment",
                "ModelServiceRunningRecords" : "Records",
                "Network" : "Network"
            },
            "Status" : {
                "Machine" : "Machine Name",
                "System" : "System",
                "Release" : "Release",
                "CPUUsage" : "Usage",
                "CPUIdle" : "Idle",
                "DiskUsage" : "Usage",
                "ComputerStatus" : "Computer Status",
                "MemoryUsage" : "Memory Usage",
                "CPUUsageTitle" : "CPU Usage",
                "DiskUsageTitle" : "Disk Usage",
                "DiskUsagePercentage" : "Percentage"
            },
            "Notice" : {
                "NoticeTable" : "Notice Table",
                "Classify" : "Classify",
                "Start" : "Start",
                "Stop" : "Stop",
                "Delete" : "Delete",
                "AllMessage" : "All",
                "AllReadMessage" : "Read",
                "AllUnreadMessage" : "Unread",
                "MarkAllRead " : "Mark All As Read",
                "InfoTitle" : "Info",
                "AllMessageMarkedRead" : "All message has marked read!",
                "MessageMarkedRead" : "Message has marked read!",
                "WarningTitle" : "Warning",
                "MessageMarkedReadFailed" : "Message marked as read failed!",
                "GettingNoticeFailed" : "Getting Notice Failed!"
            },
            "ModelService" : {
                "Name" : "Name",
                "Status" : "Status",
                "Version" : "Version",
                "Platform" : "Platform",
                "Avai" : "Avai",
                "Unavai" : "Unavai",
                "Address" : "Address",
                "Start" : "Start",
                "Stop" : "Stop",
                "Delete" : "Delete",
                "Invoking" : "Invoking",
                "Auth" : "Auth",
                "Public" : "Public"
            },
            "ModelServiceTable" : {
                "localTitle" : "local Model Services",
                "RemoteTitle" : "Remote Model Services",
                "Instances" : "Instances",
                "Address" : "Address",
                "Operation" : "Operation",
                "Detail" : "Detail",
                "Register" : "Register"
            },
            "ModelServiceDetail" : {
                "Title" : "Model Service Detail",
                "Deployer" : "Deployer",
                "Type" : "Type",
                "DeploymentTime" : "DeploymentTime",
                "Limited" : "Limited",
                "URLInvoking" : "URLInvoking",
                "API" : "API",
                "Copy" : "Copy",
                "CopySuccessfully" : "Copy Successfully",
                "Description" : "Description",
                "PublicInvoking" : "Public Invoking",
                "AdminInvoking" : "Admin Invoking"
            },
            "ModelServiceRecord" : {
                "StartTime" : "Start Time",
                "Address" : "Address",
                "User" : "User",
                "InstanceID" : "Instance ID",
                "InputData" : "Input Data",
                "OutputData" : "Output Data",
                "Log" : "Log",
                "Span" : "Span",
                "Status" : "Status",
                "Operation" : "Operation",
                "Detail" : "Detail",
                "Process" : "Process",
                "Finished" : "Finished",
                "Unfinished" : "Unfinished",
                "Error" : "Error",
                "SetAsTestify" : "Set As Testify",
                "StandOutput" : "Stand Output",
                "StandError" : "Stand Error",
                "InvokingError" : "Invoking Error"
            },
            "TablePaging" : {
                "LengthMenu" : "_MENU_ records are displayed per page",
                "ZeroRecords" : "No record",
                "Info" : "No. _START_ to _END_ ， _TOTAL_ records at all",
                "InfoEmtpy" : "No record",
                "InfoFiltered" : " _MAX_ records at all)",
                "Processing" : "loading...",
                "Search" : "Search",
                "Paginate" : {
                    "First" : "First",
                    "Previous" : "Previous",
                    "Next" : "Next",
                    "Last" : "Last"
                }
            },
            "ModelInstancesTable" : {
                "LocalTitle" : "Local Instances Table",
                "RemoteTitle" : "Remote Instances Table",
                "ID" : "ID",
                "Version" : "Version",
                "ModelName" : "Model Name",
                "StartTime" : "Start Time",
                "Status" :"Status",
                "Operation" :"Operation",
                "Address" :"Address",
                "Kill" : "Kill",
                "Killed" : "Killed successfully"
            },
            "TestData" : {
                "Title" : "Test Data",
                "Tag" : "Tag",
                "Description" : "Description",
                "LoadTestData" : "Load Test Data",
                "NoTestData" : "No Test Data",
                "DeleteTestData" : "Delete Test Data",
                "LoadTestDataSuccessfully" : "Load test data successfully!",
                "LoadTestifyFailed" : "Load test data Failed!",
                "DeleteTestDataSuccessfully" : "Delete test data successfully!"
            },
            "InputData" : {
                "Title" : "Input Data",
                "State" : {
                    "Title" : "State",
                    "Name" :"Name",
                    "ID" : "ID",
                    "Description" : "Description",
                    "Type" :"Type"
                },
                "Event" : {
                    "Title" : "Event",
                    "Name" : "Name",
                    "Type" :"Type",
                    "Required" :"Required",
                    "Control" :"Control",
                    "Response" :"Response",
                    "Description" : "Description",
                    "DataReference" : "Data Reference",
                    "Ready" : "Ready",
                    "DataReady" : "Data Ready",
                    "DataNoReady" : "Data Not Ready",
                    "DataNoReadyMessage" : "Data do not all ready",
                    "DataRemove" : "Remove",
                    "Destoryed" : "Destory when used",
                    "ResponseDataTag" : "Response Data Tag"
                },
                "Data" : {
                    "Input" : "Input",
                    "File" : "File",
                    "Link" : "Link",
                    "UDXData" : "UDX Data",
                    "DataFile" : "Data File",
                    "FileUpload" : "Upload File",
                    "FileCancel" : "Cancel",
                    "DragUpload" : "Drag Upload",
                    "UploadDone" : "Upload Done",
                    "PleaseChooseData" : "Please choose data!",
                    "DataUploadSuccessfully" : "Data upload successfully!",
                    "Tag" : "Tag",
                    "ConfigData" : "Semi-automatic configuration data",
                    "Confirm" : "Confirm",
                    "Close" : "Close"
                }
            },
            "ModelServiceRunOperation" : {
                "Title" : "Operation",
                "Run" : "Run",
                "Cancel" : "Cancel"
            },
            "CloudModelService" : {
                "CloudModelServiceCategory" : "Cloud Model Service Category",
                "CloudModelServiceItems" : "Cloud Model Service Items",
                "Pulled" : "Pulled",
                "NotPulled" : "Not Pulled",
                "Detail" : "Detail"
            },
            "DataTable" : {
                "Title" : "Data Center",
                "ID" : "ID",
                "Storage" : "Storage",
                "DateTime" : "Date",
                "Tag" : "Tag",
                "Operation" : "Operation",
                "File" : "File",
                "Stream" : "Stream",
                "Check" : "Check",
                "Render" : "Render",
                "Download" : "Download",
                "Delete" : "Delete",
                "DeleteConfirm" : "Confirm the deletion of this data",
                "DeleteFinished" : "Delete the data successfully!"
            },
            "Settings" :{
                "Title" : "Settings",
                "Version" : "Version",
                "OID" : "Container OID",
                "Port" : "Port",
                "Platform" : "Platform",
                "DBTitle" : "Model Information Database",
                "DBName" : "Name",
                "DBHost" : "Host",
                "DBPort" : "Port",
                "UDXDBTitle" : "UDX Database",
                "UDXDBHost" : "Host",
                "UDXDBPort" : "Port",
                "SocketTitle" : "Socket",
                "SocketHost" : "Host",
                "SocketPort" : "Port",
                "Demarcation" : "Data Size Demarcation",
                "DebugMode" : "Debug Mode",
                "Register" : "Register"
            },
            "CustomIndex" : {
                "ModelService" : "Model Services",
                "ComputerInfo" : "Computer Information",
                "Manager" : "Manager",
                "Help" : "Help",
                "Demo" : "Demo",
                "NewFeatures" : "New Features"
            },
            "Footer" : {
                "NNU" : "Nanjing Normal University"
            }
    };
var languageconfig = getCookie('language');
if(languageconfig == undefined || languageconfig == null || languageconfig == ''){
    languageconfig = 'en.json';
}

function setLanguage(file){
    $.ajax({
        url : '/languages/' + languageconfig,
        success : function(data){
            window.LanguageConfig = data;
        }
    });
}

setLanguage(languageconfig);