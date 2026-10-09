let SCS_chart= null; //const无法用 因为const不能更改值；同时要使得能够被函数所访问。
let fixedP =null;
let fixedS
export  function init(Id){ //async是进行异步操作。如果异步拉取数据是需要的

    SCS_chart =new Chart( //剔除const 因为const需要赋值
        document.getElementById(Id), 
        {
        type: 'scatter',
        options:{
            responsive: true,
            maintainAspectRatio: false,
            animation:false,
            plugins: {
                legend: {display: true},
                tooltip: {enabled: true},},
            scales: {
            x: {type: 'linear',title: { display: true, text: 'P 或 S（mm）' }},
            y: {beginAtZero: true,title: { display: true, text: 'Q（mm）' }  
            }}},
        data:{
                datasets:[{
                    label:'固定P/S',
                    data:[],
                    showLine: true,
                    backgroundColor: '#3b82f6'
                },
                ]
            }
        }
    
);
};
export  function getHistoryData(p,s,t,fixedP) {
    const points=SCS_chart.data.datasets[0].data.push({
        x:fixedP?s:p, //固定p就x为s；否则为p
        y:t}
    );
    
    SCS_chart.update();
}
export function resetChart(fixedP, fixedS) {
  const dataset = SCS_chart.data.datasets[0];
  dataset.data = [];
  SCS_chart.update();//清空
}
