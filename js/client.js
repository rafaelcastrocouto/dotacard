/*var Each = function(array, callback){
  for(var i = 0; i < array.length; ++i){
    callback.apply(array[i], [array[i], i, array]);
  }
};*/

$(function(){

  //$.post('/file', {data: [new Date, 'test0', 'test1', 'test2'].join(';')}); 
  console.log('data set');
  $.post('/set', {data: 'test03323', data2: 'resrs'}, function(){
    console.log('data send');
  });   
  
  setTimeout(function(){
    console.log('data get');
    $('#target').load('/get', {key: 'data2'}, function(d){
      console.log('data receive', d);
    }); 
  }, 5000);
  
});



