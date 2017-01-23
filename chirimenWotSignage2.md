CHIRIMENによるWoTサイネージの作り方(part2)

この記事はFabbleに掲載されていた[WoTsignage edu 2](http://fabble.cc/chirimenedu/wotsignage-edu2)を転載したものです。

## はじめに
CHIRIMENを使用したWoTサイネージの作成を通して、webGPIO/webI2Cの使い方を学ぶ。

このプロジェクトは[WoTsignage part1](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenWotSignage1.md)の続きとなります。Part1が終了していない方はそちらから実施をお願いします。


* Part2の内容： 
	* 物理スイッチによるGPIO入力の取り扱い 
* 学習の目的： 
	* 物理スイッチの仕組みを理解し、CHIRIMEN上で物理スイッチのイベント処理を、ウェブページのイベント処理と同様に扱えることを体感し、理解する。 
* 学習の成果： 
	* MUST：サンプルプログラム通りに物理スイッチが押された時の処理を記述し、動作させることができる。 
	* SHOULD：ウェブアプリによるGPIO入力の仕組みを学習し、プログラムとスイッチ操作の関連性が理解できる。 
	* MAY：任意のウェブアプリに物理スイッチ操作による制御を組み込むことができる。

## 物理スイッチによるwebコンテンツ切替
* クリックイベントでLEDを点灯させる処理もそうですが、ウェブページではイベント処理により、その内容を動的に書き換えていくことができます。
* 例えば、ウェブページ上のボタンを押して新しい記事を投稿するような機能です。
* GPIOの制御が可能なCHIRIMENでは、ウェブ上のボタンの代わりに物理的なスイッチを扱えるため、物理スイッチを押したらウェブコンテンツが切り替わるという処理を組み込んでいきます。

## 物理スイッチについて
* 基本的な物理スイッチは、押下することによって端子間を電気的に接続させる部品。2本足や4本足のものなど、様々なものがある。
* 画像は4本足のスイッチの例。図のように２つづつで組になってなっている。スイッチを押すと①②の足と③④の足が電気的に接続される。
* 例えば、一方をGND (0V 、もう一方をGPIO端子に接続しておくことで、スイッチが押されたかどうかをGPIOの値で取得することができる。

![tactswitch.png](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/tactswitch.png "tactswitch.png")


## ハードウェアの準備
* 前回同様、CHIRIMEN Basic Shieldを使用します。
* シールドがない場合はCHIRIMEN Push buttonを参考にして回路を準備してください。

![hardwareSetting.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/hardwareSetting.jpg "hardwareSetting.jpg")


## GPIOの初期化処理
* 物理スイッチを扱うために必要なGPIOの初期化処理を記述していきます。

### GPIO199番ポートの取得
* LED制御のために取得したGPIOアクセサを利用して、使用するGPIOポートオブジェクトを取得します。
* 今回はGPIO199番ポート(CHIRIMEN　CN1-10 を物理スイッチ用のポートとして使用しますので、以下のように199を指定した1行をspawn関数内に追加します。

```
var btnPort = gpioAccessor.ports.get(199);
```

### GPIOポートをinputモードで初期化
* 取得したGPIOポートオブジェクトのexportメソッドを使用して、このGPIOポートをinputモードで初期化します。
* 以下のように”in”を指定した1行を追加します。

```
yield btnPort.export("in");
```

## 物理スイッチのイベント処理
* 物理スイッチが押された時(GPIOの値が変化した時 の処理を記述していきます。

### onchangeイベント処理
* GPIO値の変化は、ウェブベージの様々なイベント処理と同様に、onchangeイベントによって扱うことができます。
* Inputモードで初期化したGPIOポートオブジェクト (btnPort に対して、以下の行を追加して、onchangeイベントハンドラを設定します。

```
btnPort.onchange = (btnValue) => {
  //スイッチが押された時の処理
}
```

* Onchangeイベントが発生した際のGPIOの値は引数に指定したbtnValue変数に格納されます。

### gpioの値の変化
* CHIRIMENのGPIO199(CN1-10 はプルアップされているため、解放状態（スイッチが押されていない状態）ではGPIOの値は1になります。[CHIRIMENのピンアサイン](https://chirimen.org/docs/ja/board_connectors.html)。
* CHIRIMEN Basic Shieldでは、物理スイッチがGNDに接続されているため、スイッチを押下するとGPIOの値は0になります。

### 物理スイッチが押された時の処理
* 確認のため、以下の行をスイッチが押された時の処理として追加してみます。

```
console.log("pushed!!", btnValue);
```

* 正しく動作していればスイッチを押した時に"pushed!!"という文字列と、GPIOの値がコンソールに出力されます。

### これまでのjsコード
* これまでのjsコードは[wotSignageSwitchPush.js](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/wotSignageSwitchPush.js)のようになります。

## ウェブコンテンツの書き換え処理
* 物理スイッチを押した時にウェブコンテンツを書き換える処理を記述していきます。

### htmlの書き換え
* スイッチが押された時にGPIOの値は0となるため、以下の行をスイッチが押された時の処理の部分に追加して、btnValueが0のときにid=detailの要素の中身を書き換える処理を記述します。

```
if(!btnValue){
  document.getElementById("detail").innerHTML = "ちりめん（縮緬、クレープ織り、仏: crêpe）は、絹を平織りにして作った織物。 from Wiki";
}
```

### スイッチを離した時の動作
* スイッチを離したら元の内容に戻るように処理を追加します。
* 以下の行をbtnPort.onchange =… の前に追加して、スイッチが押される前のhtmlの内容を変数に格納します。

```
var originalContents = document.getElementById("detail").innerHTML;
```

* if(!btnValue){...}の最後に続けて以下の行を追加して、スイッチを離したら元の内容に戻る処理を行います。

```
else{
  document.getElementById("detail").innerHTML = originalContents;
}
```

### これまでのjsコード
* これまでに作成した全体のjsがこちらの[button-changeブランチのmain.js](https://github.com/naokisekiguchi/WoTSignage/blob/button-change/js/main.js)のようになります。
* うまく作成できていれば、物理スイッチを押した時にウェブページの内容が変わるようになっているはずです。

## 次のステップ
* 続いて、距離センサを使用した画面スクロール機能を追加していきます。
* WoTsignage part3に移動してください。
