var ModelSerCtrl = require('./control/modelSerControl');

console.log("register all model start!");
ModelSerCtrl.getLocalModelSer(function(err,data){
    if(err){
        console.log("error");
    }
    var count = 0;
    var polling = function(index){
       count++;
       return function(err,result){
           count--;
           if(err){
               console.log(err);
           }else{
              if(result){
                  console.log('ok,it is still running');
              }
           }
           if(count == 0){
               console.log("ok, finish!");
           }
       }
    }
    for(let i = 0; i < data.length; i++){
        let ms = data[i];
        let status = ms.ms_model.m_register;
        if(status === true){
            console.log("this model has been registered!");
        }else{
            let msid = ms._id;
            ModelSerCtrl.RegisterModelService(msid,polling(i));
        }
    }
   
})