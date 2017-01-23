# CHIRIMENでサーボモータを使用する（task.jsバージョン）

この記事はFabbleに掲載されていた記事を転載・修正したものです。

## はじめに

task.jsを使用してCHIRIMENでサーボモータを扱う方法。 PCA9685というサーボドライバを使います。

## サーボモータについて

## ハードウェアの準備

* [CHIRIMEN Basic Shield](https://www.switch-science.com/catalog/1048/)を使用します。
    

### Basic Shieldとの接続

* [GROVE - 4ピン-ジャンパメスケーブル](https://www.switch-science.com/catalog/1048/)をI2C0という印字のある列の5Vという印字のある箇所に接続してください。

### PCA9685の接続

* GROVE - 4ピン-ジャンパメスケーブルの黒、赤、黄色、白色のケーブルをそれぞれPCA9685のGND,VCC,SCL,SDAに刺してください。
* 普通のジャンパワイヤ(オス～メス)でPCA9685のVCC,V+を接続してください。
* サーボモーターをch0に接続してください。
    
            
* シールドがない場合も、以下の画像を参考にして回路を準備してください。

<img src="https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/pca9685Breadboard.jpg" width="400px">


## ソフトウェアの準備

* [chirimenServo](https://github.com/naokisekiguchi/WoTsignageText/tree/master/chirimenServo)を参考にソースコードを準備してください。
* task.js、webgpio polyfillを使用しています。

## プログラムの説明
サンプルプログラムについて解説。

* I2Cポートの初期化
* サーボドライバの初期化処理
* サーボモータの制御

### I2Cポートの初期化

* [chirimenAppBase.js](https://github.com/naokisekiguchi/WoTsignageText/blob/master/js/chirimenAppBase.js)を準備します。

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

* [I2Cポートの初期化処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo/js/chirimenServo.js#L9-L12)をspawn関数内に記述します。

```I2Cポートの初期化処理
// I2C へのアクセサを取得
const accessor = yield navigator.requestI2CAccess();
// I2C 0 ポートを使うので、0 を指定してポートを取得
const port = accessor.ports.get(0);
```

### サーボドライバの初期化処理

* サーボモーターを制御するための処理は[PCA9685クラス](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo/js/chirimenServo.js#L29-L121)にまとめてあります。
* 初期化したI2Cポートオブジェクトとサーボドライバ（PCA9685）のアドレス(0x40)を指定して、[pca9685クラスをnew呼び出し](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo/js/chirimenServo.js#L14)して、さらに[サーボドライバの初期化処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo/js/chirimenServo.js#L15)を記述します。

```サーボドライバの初期化処理
const pcs9685 = new PCA9685(port,0x40);
yield pcs9685.init(0.00050,0.00240,180);
```

* 引数に指定している数値`(0.00050,0.00240,180)`はサーボモータ毎に異なる設定値です。[SG90](http://akizukidenshi.com/catalog/g/gM-08761/)というサーボモータを使用する場合は、この通りに記述します。

### サーボモータの制御

* サーボモータの制御は制御するサーボモータのチャンネル（今回は0を指定）と、角度（angle変数で指定）を指定して、[サーボモータの制御処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenServo/js/chirimenServo.js#L22)のように記述します。

```サーボモータの制御処理
yield pcs9685.setServo(0,angle);
```

* 以下の記述は10度と170度を交互に設定する処理です。

```
angle = (angle<=10) ? 170 : 10;
```

* 正しく動作すれば、サーボモータが1秒毎に10度、170度の角度に動きます。

