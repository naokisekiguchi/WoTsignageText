CHIRIMENによるWoTサイネージの作り方(part1)

この記事はFabbleに掲載されていた[WoTsignage edu 1](http://fabble.cc/chirimenedu/wotsignage-edu1)を転載したものです。

## はじめに
CHIRIMENを使用したWoTサイネージの作成を通して、webGPIO/webI2Cの使い方を学ぶ。

* Part1の内容：
	* CHIRIMENの概要紹介
	* 静的Webページの作成
	* Lチカ 
* 学習の目的： 
	* CHIRIMENの基本的な扱い方を理解し、ハードウェア制御のプログラム開発をウェブ言語で簡単に始めることができると体感する。 
* 学習の成果： 
	* MUST：CHIRIMENの各端子の意味を理解して、起動、操作することができる。
	* SHOULD：ウェブアプリによるGPIOの制御方法を学習し、プログラムとLEDの点滅の関連性が理解できる。
	* MAY：任意のウェブアプリにLED制御を組み込むことができるようになる。


## CHIRIMENとは
* ウェブデベロッパのためのWoT(Web of Things) デバイス開発環境です。* センサやアクチュエータも全てウェブ技術で制御でき、ウェブページを作るようにWoT デバイスアプリケーションの開発が可能となります。* ウェブとモノ(Things を組み合わせることで、これまでにない全く新しいコンセプトのデバイスが作られていくのではないか、と注目されています。* [CHIRIMEN概要資料](http://www.slideshare.net/naokisekiguchi75/chirimen-53445440)を参照。

## CHIRIMENの起動・操作方法
* CHIRIMENの各端子の役割。
* CHIRIMEN取り扱い時の注意点。
* CHIRIMENを起動・操作する。

### CHIRIMENの各端子の役割
* CHIRIMENのインターフェースについて。

![interface.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/interface.jpg "interface.jpg")


### CHIRIMEN取り扱い時の注意点
* 濡れた手でCHIRIMENや電子部品を扱わない。
* 電源投入の際は端子等の接続を確認し、ショートしていないか注意する。
* 各端子は壊れやすいのでケーブルを抜き差しする際は丁寧に行う。

### CHIRIMENを起動・操作する
* microHDMI端子をディスプレイと接続する。
* CHIRIMENのフルUSBにUSBハブを接続し、マウスとWiFiドングルを接続する。
* ACアダプタをAC電源に接続する。
* CHIRIMEN上のLEDが点灯し、しばらく経つとB2Gが起動する。
* アプリ画面が表示されたら、マウスを使用して操作をしてみる。左クリックが選択、右クリックがホームボタンの役割となる。
* 設定画面（settings）からWiFiの接続設定を行う。

![chirimenSetting.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/chirimenSetting.jpg "chirimenSetting.jpg")


## CHIRIMEN開発環境の準備
* CHIRIMENのアプリは純粋なウェブアプリなので、ウェブアプリの開発環境がそのまま使用できる。
* ブラウザ上で直接、開発と実行ができる環境もある。

* CHIRIMENを直接接続する場合、[CHIRIMENアプリ開発環境構築](http://fabble.cc/chirimenedu/chirimenhelloworld)を参照して開発環境を準備する。

## WoTサイネージアプリの開発
* CHIRIMENのアプリ開発の基本を学ぶため、ウェブとモノとを組み合わせたサイネージ（看板）アプリを作っていきます。

## リンクのクリックとLEDの連動
* ウェブページの基本的な機能として、ハイパーテキストリンクがあります。ウェブページ上に設定されたリンクをクリックして、ページ遷移を行うというものです。
* この、ウェブにおいて最も基本的な動作に対して、WoTの基本である、GPIOの制御によるLEDの点灯（Lチカ）を組み込んでいきます。

## Web of ”Things” の基礎知識
* リンクのクリックとLEDの連動に必要な基礎知識であるGPIOとLEDについて簡単に説明します。

### GPIOについて説明

[GPIO - Wikipedia](https://ja.wikipedia.org/wiki/GPIO)

* デジタル信号(0,1 の出力や入力を行うことができるインターフェース。
* 電圧の高低により、0か1かを変化させている。
* 出力に使うとLEDの点滅やリレーの制御を行うことができる。極端に言えば、あらゆる機器の電源オンオフがコントロールできる。
* 入力に使うと物理スイッチや人感センサーなどを扱うことができる。



### LEDについて説明
[発光ダイオード - Wikipedia](https://ja.wikipedia.org/wiki/%E7%99%BA%E5%85%89%E3%83%80%E3%82%A4%E3%82%AA%E3%83%BC%E3%83%89)

* 極性（カソード（陰極）、アノード（陽極））を持っている。
* カソード（陰極）に対しアノード（陽極）に正電圧を加えると発光する。
* 流す電流値によって明るさが変わる。電流値は一緒に接続する抵抗値で制御することができる。




## 静的webページの準備
* WoTサイネージの作成にあたり、まずは静的なwebページの作成を行います。
* htmlの内容を[静的webページのindex.html](https://github.com/naokisekiguchi/WoTSignage/blob/static-web/index.html)のように、cssの内容を[静的webページのmain.css](https://github.com/naokisekiguchi/WoTSignage/blob/static-web/style/main.css)のように作成します。

* 正しく作成できれば、ページ上部に大きく「CHIRIMENとは」と表示され、ページ下部にCHIRIMENの説明が書かれているwebページが確認できるはずです。


## jsの読み込み
* CHIRIMENで電子デバイスを制御するために必要なjsを読み込む記述をhtmlに追記します。
* <head>タグに[js読み込みの3行](https://github.com/naokisekiguchi/WoTSignage/blob/led-blink/index.html#L7-L9)を追加してください。

```
<script src="js/webgpioi2c.js"></script>
<script src="js/task.js"></script>
<script src="js/main.js" type="application/javascript;version=1.7">
```

* 必要な記述を追加したindex.htmlが[led-blinkのindex.html](https://github.com/naokisekiguchi/WoTSignage/blob/led-blink/index.html)です。


## ハードウェアの準備
* CHIRIMENとLEDの接続を行います。
* 今回は簡単にLEDを接続できるよう[CHIRIMEN Basic Shield](https://github.com/chirimen-oh/shields/tree/master/CHIRIMENBasicShield)を使用します。
* シールドをCHIRIMENと同じ向きに差し込みます。
* このシールドはLED、タクトスイッチ、距離センサ（SRF02）、温度センサ（ADT7410）が簡単に接続できるコネクタが用意されており、さらに10個のgroveコネクタがついています。

![hardwareSetting.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/hardwareSetting.jpg "hardwareSetting.jpg")

* シールドがない場合は以下の画像を参考にしてLED回路を準備してください。
![ledBlinkBreadboard.png](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/ledBlinkBreadboard.png "ledBlinkBreadboard.png")


## ベースとなるjavascriptを作成
* まずはjavascriptの内容を[chirimenAppBase.js](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/chirimenAppBase.js)のように作成してください。
* この時点ではまだ何も起きません。

```chirimenAppBase.js
// task.js ライブラリ
const { spawn, sleep } = task;
// document 内のリソースが読み終わるのを待つ
document.addEventListener("DOMContentLoaded", () => {
  
  // task.js の spawn 関数内では Promise が同期的に記述できる
  spawn(function() {

  });

});
```

### ベース部分（task.js）の解説
* CHIRIMENでの電子デバイス制御を簡単に記述できるようにtask.jsを使用します。
* [CHIRIMENアプリベースjsの7行目](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/chirimenAppBase.js#L7)のspawn関数の中に基本的な処理を書いていくことになります。
* よくわからない場合は、現時点ではおまじないだと考えてください。



### task.jsを使う理由
* CHIRIMENでLEDなどの電子部品を制御していくとき、たくさんの非同期処理を記述する必要があります。
* これらを普通に記述するとたくさんの入れ子構造ができてしまい、見た目も非常に複雑になります。
* そのため、非同期処理を同期的に記述することができるtask.jsを使用しています。

## GPIOの初期化処理
* LEDを光らせるために必要なGPIOの初期化処理を記述していきます。

### Lチカ用のグローバル変数を定義
* Lチカ用にLEDポートオブジェクトを格納するためのグローバル変数を定義します。
* jsの先頭に以下の1行を追加してください。

```
var ledPort;
```

### GPIO へのアクセサを取得
* GPIOへアクセスするためのアクセサを取得します。
* spawn関数の中に以下の行を追加してください。

```
const gpioAccessor = yield navigator.requestGPIOAccess() ;
```

* yieldの付いた箇所が非同期処理の部分になります。task.jsを利用したspawn関数内では同期処理的に記述することができます。

### GPIO198番ポートの取得
* 取得したGPIOアクセサを利用して使用するGPIOポートオブジェクトを取得します。
* 今回はGPIO198番ポート(CHIRIMEN　CN1-9 をLED用のポートとして使用しますので、以下のように198を指定した1行を追加します。

```
ledPort = gpioAccessor.ports.get(198) ;
```

### GPIOポートをoutputモードで初期化
* 取得したGPIOポートオブジェクトのexportメソッドを使用して、このGPIOポートをoutputモードで初期化します。
* 以下のように”out”を指定した1行を追加します。

```
yield ledPort.export("out");
```

### LEDの点灯
* GPIOの初期化を確認するため、LEDを点灯させてみます。
* LEDの点灯はGPIOポートオブジェクトのwriteメソッド使用して制御できます。
* 点灯する時は以下のように1を指定した１行を追加します。

```
ledPort.write(1) ;
```

* 正しく動作していればLEDが点灯します。

※プログラムが正しくてもLEDが正しく点滅しない場合、ブラウザのリロードなどを行ってみてください。

### これまでのjsコード
* ここまでの全体のコードは[wotSignageLedOn.js](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/wotSignageLedOn.js)のようになります。

## リンククリック時のイベント処理
* ドキュメント内のリンク（aタグ）をクリックした時のイベント処理を記述していきます。

### ドキュメント内のaタグにクリックイベント処理を追加
* 少し処理が長いので、addEventLink() という関数を作っていきます。
* jsの最後にこちらの[addEventLink関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/addEventLink.js)を追加します。

```addEventLink関数
function addEventLink(){
  //ドキュメント内のaタグを全て取得
  Array.from(document.querySelectorAll("a"),  (e) => {
    //取得した要素(aタグ)にtouchstartイベントを設定(CHIRIMENではマウスイベントはtouchイベントに置き換えられる)
    e.addEventListener("touchstart",()=>{
      
    });
  });
}
```

* e.addEventListener("touchstart",() =>{ });の中にaタグをクリックした時の処理を記述していくことになります。

### リンクをクリックした時にLEDを点灯
* aタグをクリックした時の処理としてLEDを点灯させる処理を記述していきます。
* e.addEventListener("touchstart",() =>{ });の中に以下の１行を追加します。

```
ledPort.write(1);
```

* 正しく動作していれば、リンクをクリックした時にLEDが点灯するようになります。

### リンクをクリックした1秒後にLEDを消灯
* LEDを点灯させるだけでは点きっぱなしになってしまうので、1秒後にLEDを消灯させるようにします。
* LEDの点灯処理の後に、setTimeout関数を使用した以下の行を追加します。

```
setTimeout(() => {
  //LEDを消灯させる
  ledPort.write(0) ;
},1000 );
```

### 関数の呼び出し
* 以上のように作成したaddEventLink() 関数を呼び出します。
* 確認のために記述していた、LED点灯処理の代わりに以下の1行を追加します。

```
addEventLink();
```



### これまでのjsコード
* これまでの全体のjsコードは[led-blinkブランチのmain.js](https://github.com/naokisekiguchi/WoTSignage/blob/led-blink/js/main.js)のようになります。
* うまく作成できていれば、リンクをクリックした時にLEDが点灯し、1秒後に消灯するようになっているはずです。

## 次のステップ
* 続いて物理スイッチによるウェブコンテンツの切り替え機能を追加していきます。
* [WoTsignage part2](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenWotSignage2.md)に移動してください。