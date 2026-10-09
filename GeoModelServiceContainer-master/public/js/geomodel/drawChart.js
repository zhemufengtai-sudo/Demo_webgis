function getData(series,flag,that) {
    var xmlhttp;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            // var jsonResult = eval('(' + xmlhttp.responseText + ')');
            var jsonResult = JSON.parse(xmlhttp.responseText);
            var stringInfo = window.LanguageConfig.Status.Machine + '&nbsp;:&nbsp;' +
                jsonResult.hostname+"       " + window.LanguageConfig.Status.System + "："+jsonResult.systemtype+"      " + window.LanguageConfig.Status.Release + "："+jsonResult.release;
            $("#data").html(stringInfo);
            if (flag == 1){
                var usedSpace = parseFloat(jsonResult.totalmem) - parseFloat(jsonResult.freemem);
                var percent = usedSpace/parseFloat(jsonResult.totalmem)*100;
                var x = (new Date()).getTime(), // 当前时间
                    y =  Math.round(percent);
                series.addPoint([x, y], true, true);
            }
            else if(flag == 2){
                var diskName = jsonResult.disk[1];
                series.setData([[window.LanguageConfig.Status.CPUUsage,jsonResult.disk[0]],[window.LanguageConfig.Status.CPUIdle,100-jsonResult.disk[0]]],true,true);
                that.setTitle({text: diskName + ':\\ ' + window.LanguageConfig.Status.DiskUsage},null,true);
            }
            else if (flag == 3){
                var cpus = jsonResult.cpus;
                var i,
                    sum=0,
                    idleSum=0;
                for (i=0;i<cpus.length;i++){
                    sum=sum+cpus[i].times.user+cpus[i].times.sys+cpus[i].times.nice+cpus[i].times.idle+cpus[i].times.irq;
                    idleSum=idleSum+cpus[i].times.idle;
                }
                var x = (new Date()).getTime(), // 当前时间
                    y =  100-Math.round(idleSum/sum*100);
                // console.log(y);
                series.addPoint([x, y], true, true);
            }
        }
    };
    if (flag == 1 || flag == 3){
        setInterval(function (){
            xmlhttp.open("GET","/json/status",true);
            xmlhttp.send();
        },3000);
    }
    else if(flag == 2){
        xmlhttp.open("GET","/json/status",true);
        xmlhttp.send();
    }
}

var chart1;
$(function drawDynamicLine() {
    chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_line1', //图表放置的容器，DIV
            backgroundColor:'#FFF',
            defaultSeriesType: 'areaspline', //图表类型为曲线图
            events: {
                load: function() {
                    getData(this.series[0],1);
                    getData(this.series[1],3);
                }
            }
        },
        title: {
            text: window.LanguageConfig.Status.ComputerStatus  //图表标题
        },
        xAxis: { //设置X轴
            title:{text:'Time'},
            type: 'datetime',  //X轴为日期时间类型
            tickPixelInterval: 100  //X轴标签间隔
        },
        yAxis: { //设置Y轴
            title:{text:'%'},
            tickPixelInterval: 50,
            max: 100, //Y轴最大值
            min: 0  //Y轴最小值
        },
        tooltip: {//当鼠标悬置数据点时的提示框
            xDateFormat: '%H:%M:%S',
            valueSuffix: '%'
        },
        exporting: {
            // buttons:{contextButton:{symbolFile:'#EFF0F4',enabled:true}},
            enabled: false  //设置导出按钮不可用
        },
        credits: {
            enabled: false
        },
        plotOptions:{
            areaspline: {
                fillOpacity: 0.3,
                cursor: 'pointer',
                pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',   //点形状
                    radius: 2,  //点半径
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name:window.LanguageConfig.Status.MemoryUsage,
            data: (function() { //设置默认数据，
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -180; i <= 0; i++) {
                    data.push({
                        x: time + i * 1000,
                        y: -5
                    });
                }
                return data;
            })()
        },{
            name:window.LanguageConfig.Status.CPUUsageTitle,
            data: (function() { //设置默认数据，
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -180; i <= 0; i++) {
                    data.push({
                        x: time + i * 1000,
                        y: -5
                    });
                }
                return data;
            })()
        }]
    });
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
});

$(function drawPie() {
    new Highcharts.chart({
        chart: {
            renderTo:'chart_line2',
            plotBackgroundColor: "#FFF",
            plotShadow: false,
            events: {
                load: function() {
                    getData(this.series[0],2,this);
                }
            }
        },
        title: {
            text: '磁盘使用率'
        },
        tooltip: { //鼠标停留悬浮标签
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            backgroundColor:"#fff"
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: { //旁边的提示
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        exporting: {
            // buttons:{contextButton:{symbolFile:'#EFF0F4',enabled:true}},
            enabled: false  //设置导出按钮不可用
        },
        series: [{
            type: 'pie',
            name: '百分比',
            data: [
                ['空闲',0],
                ['占用',0]
            ]
        }]
    });
});