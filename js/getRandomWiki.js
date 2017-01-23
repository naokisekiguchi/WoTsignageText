function getRandomWiki(){
  //jqueryの関数を利用して、JSONPでwikipediaの記事タイトルをランダムで取得する。
  $.ajax({
    type: "get",
    dataType: "jsonp",
    url: "https://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json",
    //記事タイトルの取得が成功した時の処理
    success: function(json) {
      //取得したjsonデータ中の記事タイトルを抽出   
      var title = json.query.random[0].title;
      //抽出した記事タイトルの中身を取得すr関数
      getWiki(title);
    }
  });
}
function getWiki(query){
  //引数(query)に指定された記事の中身をhtml形式で取得
  $.ajax({
    type: "get",
    dataType: "jsonp",
    url: "https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles="+query+"&rvprop=content&rvparse",
    //記事の中身の取得が成功した時の処理(記事の中身を画面に反映するための関数を呼び出す)
    success: parseWiki
  });
}
function parseWiki(json){
  //記事の中身を抽出
  var html;
  for(i in json.query.pages){
    html = json.query.pages[i].revisions[0]["*"];
  }
  //抽出した記事の内容でid=contentsの要素の中身を書き換える
  document.getElementById("contents").innerHTML = html;
  //記事中のリンク(aタグ)をクリックした時のイベントを設定
  addEventLink();
  //記事中のリンクのリンク先をcontentsのトップに設定
  Array.from(document.querySelectorAll("a"),  (e) => {
    e.href = "#contents";
  });
}