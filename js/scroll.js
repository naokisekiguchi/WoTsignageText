function scroll(val,min,max){
  //ドキュメントの高さを取得
  var ch = document.body.scrollHeight;
  //値がmaxより大きい時、何もしない
  if(val > max){
    return;
  }
  //値がminより小さいときは、minの値で固定する
  if(val < min){
    val = min;
  }
  //スクロールする位置を決定する   
  var sx = ch * (1 - (val - min)/(max - min));
  //指定の位置にスクロールさせる    
  window.scrollTo(0,sx);
}