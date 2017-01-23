# CHIRIMENによるWoTサイネージの作り方(part4)

この記事はFabbleに掲載されていた[WoTsignage edu 4](http://fabble.cc/chirimenedu/wotsignage-edu4)を転載したものです。

## はじめに
CHIRIMENを使用したWoTサイネージの作成を通して、webGPIO/webI2Cの使い方を学ぶ。 

このプロジェクトは[WoTsignage part3](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenWotSignage3.md)の続きとなります。Part3が終了していない方はそちらから実施をお願いします。

* Part4の内容： 
	* ウェブAPIについて 
	* WikiPedia APIの取り扱い 
* 学習の目的： 
	* ウェブAPIの使い方を学習し、物理的な操作とウェブAPIとの連携を行うことで、WoTの可能性を体感する。 
* 学習の成果： 
	* MUST：サンプルプログラム通りにWikiPediaの記事を取得し、表示することができる。 
	* SHOULD：JSONPによるWikiPedia記事取得の各処理の流れと必要性が理解できる。 
	* MAY：WikiPedia APIの使い方を理解し、任意の形式で記事を取得することができる。また、それらをGPIO、I2Cの処理と関連付けて制御することができる。

## WebAPIとの連携
* CHIRIMENアプリはウェブアプリそのものなので、様々なWebAPIとの連携も簡単に行えます。
* ここでは、物理スイッチを押した時にWikipediaのWebAPIを使用して、ランダムで記事を取得・表示するように処理を書き換えてみます。

## WebAPIの基礎知識
* WebAPIについて簡単に説明します。

### WebAPIとは？
* ウェブ上にはWebAPIという形で様々な情報やサービスが提供されています。
* WebAPIを使うと、天気予報の情報を取得したり、twitterに投稿したりと、ウェブ上の他の情報やサービスと連携することができます。
* 最近のウェブサービスは様々なWebAPIをマッシュアップして作られているものがほとんどです。

### WikipediaAPI
* WebAPIの代表的なものの一つにWikipediaの情報を取得するWebAPIがあります。
* Wikipedia APIはアカウントなどの登録をせずに使うことができるので、比較的簡単に利用することができます。

## Wikipedia記事をランダムで取得する
* Wikipedia記事をランダムで取得する処理を記述していきます。

### 記事内容の取得
* JSONPでWikipediaの情報を取得します。
* [Wikipediaの記事内容を取得する処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/wotSignageGetDistance.js)をjsの最後に追記してください。
* getRandomWiki関数でWikipediaの記事タイトルをランダムで取得し、getWiki関数で取得したタイトルの記事内容をhtml形式で取得します。
* parseWiki関数で取得した記事内容を#contents要素へ反映します。

```getRandomWiki関数
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
```

```getWiki関数
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
```

```parseWiki関数
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
```

### Wikipediaスタイルの反映
* 取得した記事にWikipediaのスタイルを反映するため、htmlの<head>タグに[Wikipediaのスタイル](https://github.com/naokisekiguchi/WoTSignage/blob/wikiapi/index.html#L7)の1行を追記したください。

```
<link rel="stylesheet" href="https://en.wikipedia.org/w/load.php?modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.elements|mediawiki.skinning.content|mediawiki.skinning.interface|skins.vector.styles|site|mediawiki.skinning.content.parsoid|ext.cite.style&amp;only=styles&amp;skin=vector"/>
```

### JSONPでの情報取得
* Wikipediaの記事はJSONPと呼ばれている方法で取得することができます。
* JSONPで情報を取得する方法を簡単に記述するため、part3でスクロールアニメーションのために使用したjqueryを使用しています。

## 物理スイッチの押下時にWikipedia記事を取得
* 物理スイッチの押下時にWikipedia記事を取得するように処理を記述していきます。

### 物理スイッチ押下時の処理の書き換え
* 物理スイッチを押下した時の処理を書き換えていきます。
* `btnPort.onchange = (btnValue)=> { }`内の`if(!btnValue){}`文内を以下のように書き換えてください。

```
getRandomWiki();
```

* `var originalContents = ...`という処理は不要なので、この行を削除します。
* `else{ ...}` という処理も不要なので削除します。

### リンク先の書き換え
* 取得した記事内容を反映させるだけでは、記事内のリンクがうまく機能しないため、ここでは全てのリンクのリンク先をページトップへと変更します。
* addEventLink関数内でドキュメント内のaタグを全て取得した後に次の1行を追記してください。

```
e.href = "#contents";
```

### これまでのjsコード
* これまでのjsコードは[wikiapiブランチのmain.js](https://github.com/naokisekiguchi/WoTSignage/blob/wikiapi/js/main.js)のようになります。
* 全体のhtmlは[wikiapiブランチのindex.html](https://github.com/naokisekiguchi/WoTSignage/blob/wikiapi/index.html)のようになります。
* 正しく動作していれば、物理スイッチを押した時にランダムでWikipediaの記事を表示するようになります。

## さらに先のステップへ
以上でWoTSingageの作成は終了です。これでCHIRIMENで物理的なモノをウェブと関連付けて制御する基本が学習できました。さらにいろいろなモノを制御できるようになるため、以下の教材も学習してみましょう。

### いろいろなI2Cセンサの値を取得してみる
* 距離センサ以外にも様々なI2Cセンサが存在しています。
* [CHIRIMEN I2C sensor (task.js version)](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors.md)を参考にして、いろんなセンサの値を取得してみましょう。

### サーボモータを動かしてみる
* センサ以外にもI2Cでモータを動かすことも可能です。
* [CHIRIMEN Servo (task.js version)](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo.md) を参考にサーボモータを制御してみましょう。
