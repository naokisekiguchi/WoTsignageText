CHIRIMENによるWoTサイネージの作り方(part3)

この記事はFabbleに掲載されていた[WoTsignage edu 3](http://fabble.cc/chirimenedu/wotsignage-edu3)を転載したものです。

## はじめに
CHIRIMENを使用したWoTサイネージの作成を通して、webGPIO/webI2Cの使い方を学ぶ。 

このプロジェクトは[WoTsignage part2](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenWotSignage2.md)の続きとなります。Part2が終了していない方はそちらから実施をお願いします。

* Part3の内容： 
	* I2Cデバイスの基礎 
	* 距離センサの取得 
* 学習の目的: 
	* 距離センサを例にとり、CHIRIMENでI2C接続のセンサを扱う方法を理解する。 
* 学習の成果 
	* MUST：サンプルプログラム通りに距離センサの値を取得することができる。 
	* SHOULD：ウェブアプリによるI2C通信の方法を学習し、プログラムと距離センサ取得の関連性が理解できる。 
	* MAY：CHIRIMENで動作確認ができているI2Cデバイスについて、自分でプログラムを記述して制御できるようになる。

## 距離センサによる画面スクロール
* これまでのウェブページではマウス操作やタッチ操作によって画面のスクロール操作を行っていました。
* CHIRIMENではI2Cという信号規格を制御することで、様々なセンサーを直接扱うことができます。
* ここでは、距離センサーで取得できる人とサイネージの距離によって画面スクロールを制御する処理を追加します。

## I2Cについての基礎知識
* I2Cデバイスの制御を行っていく前にI2Cについて簡単に説明します。

### I2Cとは？
[I2C - Wikipedia](https://ja.wikipedia.org/wiki/I2C)


* I2Cとはシリアルデータ通信の方式で。I2CまたはIICと標記し、「アイ・スクエア・シー、アイ・ツー・シー」などと読む。
* GND、VCC(電源3.3v/5v とSDA、SCLという二つの信号線の計4本で接続する。
* 異なるアドレスを持つI2Cデバイスであれば、一つのI2Cポートに複数のデバイスを接続することができる。（最大112個）
* 0/1の信号だけだはなく、アドレスとデータを指定したデータ通信を行うことができる。

### I2Cデバイス
* 温度センサ、加速度センサ、気圧センサなど様々なセンサや、液晶モジュール、モータドライバなど、I2Cインターフェースに対応した様々なデバイスが販売されている。
* GND、VCC、SDA、SCL端子をつなぐことで制御できる。接続方法は共通なので簡単にI2Cデバイスを接続するためのコネクタも存在する。（grove systemなど）
* CHIRIMENはWebアプリからのI2C通信の読み書きに対応しているため、I2Cに対応したデバイスを制御することができる。

## ハードウェアの準備
* 前回同様、CHIRIMEN Basic Shieldを使用します。
* SRF02という印字のある場所に図のように距離センサ(SRF02)を接続してください。

![hardwareSetting-distanceSensor.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/hardwareSetting-distanceSensor.jpg "hardwareSetting-distanceSensor.jpg")

* 以下の画像は距離センサを接続するための回路図です。シールドがない場合は以下の画像を参考にして回路を準備してください。

![srf02Breadboard.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/srf02Breadboard.jpg "srf02Breadboard.jpg")

## I2Cの初期化処理
* I2C接続の距離センサを扱うために必要なI2Cの初期化処理を記述していきます。

### I2C 0番ポートの取得
* 取得したI2Cアクセサを利用して、使用するI2Cポートオブジェクトを取得します。
* 今回はI2C 0番ポートを距離センサ用のポートとして使用しますので、以下のように0を指定した1行を追加します。

```
const port = accessor.ports.get(0);
```

* CHIRIMENには0番と2番の２つのI2Cポートがあります。

### I2Cへのアクセサを取得
* I2Cへアクセスするためのアクセサを取得します。
* spawn関数の中に以下の行を追加してください。

```
const accessor = yield navigator.requestI2CAccess();
```


## 距離センサの値の取得
* 距離センサの値を取得する処理を記述していきます。

### I2Cのread/write
* I2Cデバイスは、slaveオブジェクトのread/writeメソッドを使用して、データを読み書きすることにより制御します。
* 以下のようにwrite8メソッドを使用してアドレスとデータを指定するとデータの書き込みが行えます。

```
yield slave.write8(<アドレス>, <データ>);
```

* 以下のようにreadメソッドを使用してアドレスを指定するとデータの読み込みが行えます。

```
const value = yield slave.read8(<アドレス>, true);
```

* どのようにデータを読み書きすればデバイスを制御できるかは、デバイスの種類によって異なります。

### 距離センサの値の取得
* 距離センサを読み込む処理は[getDistance関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/getDistance.js)にまとめてあります。jsの最後に追記してください。

```getDistance関数
function getDistance(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x00, 0x00);
      yield sleep(1);
      slave.write8(0x00, 0x51);
      yield sleep(70);
      const highBit = yield slave.read8(0x02, true);
      const lowBit = yield slave.read8(0x03, true);
      
      const distance = (highBit << 8) + lowBit;
      resolve(distance);
    
    });
  });
}
```

* 初期化したI2Cポートオブジェクトと距離センサのアドレス(0x70)を指定して、距離センサの取得処理を記述します。以下の1行を追加してください。

```
const distance = yield getDistance(port,0x70);
```

* distance変数に取得した距離の値（cm）が格納されます。

### 距離センサの値の表示
* 取得した距離をコンソールとウェブ画面上に表示します。以下の2行を追加してください。

```
console.log(distance);
document.querySelector("#distance").textContent = distance;
```

* htmlの#contents要素の後に以下の1行を追加してください。

```
<div id="distance"></div> 
```

### 1秒毎に距離を取得する。
* このままでは一度しか距離を取得できないので、1秒間隔で距離を取得します。
* 以下のように距離センサの取得処理をループ処理で囲ってください。

```
setInterval( () =>{
  spawn( function(){
    //距離センサの取得処理
  });
 },1000);
```

### これまでのjsコード
* これまでのjsコードは[wotSignageGetDistance.js](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/wotSignageGetDistance.js)のようになります。

## 距離によるスクロール
* センサで取得した距離によって画面スクロールする処理を記述していきます。

### 指定位置へスクロールする関数
* 与えた値に応じてスクロールする関数を作成していきます。
* jsの最後に[scroll関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/scroll.js)を追記してください。
* この関数は、第一引数にスクロール位置、第二引数に一番下へスクロールする時の値、第三引数に一番上へスクロールする時の値を指定します。

```scroll関数
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
```


### 距離による画面スクロール
* 距離(distance)の取得後に以下の1行を追加してください。

```
scroll(distance,15,50);
```

* 距離が15cm以下の場合に一番下へスクロールし、距離が50cmの場合に一番上へスクロールします。距離が50cmより大きい場合はその場に留まります。 

## jqueryを使用したアニメーション
* このままでは、スクロール位置まで瞬時に飛んでしまうため、ライブラリを使用してアニメーションさせてみましょう。

### jqueryの読み込み
* jsの様々な記述を簡単にするライブラリとしてjqueryというライブラリが知られています。
* jqueryを読み込むため、htmlの<head>タグに以下の1行を追加してください。

```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
```


### スクロールアニメーション
* scroll関数内の[指定の座標までスクロールをさせる処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/scroll.js#L15)を以下の1行に書き換えてください。

```
$('html,body').animate({scrollTop: sx}, 500, 'swing');
```

* これにより、スクロールする時、なめらかにアニメーションするようになります。

### これまでのjsコード
* これまでに作成した全体のjsがこちらの[distanceブランチのmain.js](https://github.com/naokisekiguchi/WoTSignage/blob/distance/js/main.js)のようになります。
* 全体のhtmlは[distanceブランチのindex.html](https://github.com/naokisekiguchi/WoTSignage/blob/distance/index.html)のようになります。
* うまく作成できていれば、距離センサで取得した距離に応じて画面がスクロールするようになっているはずです。


## 次のステップ
* 続いてwikipedia APIと組み合わせてウェブコンテンツを切り替える処理を追加していきます。
* [WoTsignage part4](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenWotSignage4.md)に移動してください。
