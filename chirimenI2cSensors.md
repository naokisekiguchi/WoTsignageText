# CHIRIMENでI2Cのセンサーを使用する（task.jsバージョン）

この記事はFabbleに掲載されていた記事を転載・修正したものです。

## はじめに

task.jsを使用してCHIRIMENでI2Cセンサを扱う方法。 距離センサ、温度センサ、光センサ、加速度センサを扱います。

## ハードウェアの準備
* [CHIRIMEN Basic Shield](https://github.com/chirimen-oh/shields/tree/master/CHIRIMENBasicShield)を使用します。
* SRF02という印字のある場所に図のように距離センサ(SRF02)を接続してください。
* ADT4710という印字のある場所に図のように温度センサ(ADT4710)を接続してください。
* Grove Digital Light Sensor、Grove Digital Accelerometer Sensorは写真のように、I2C0という印字のある列の5Vという印字のある箇所に接続してください。

![hardwareSetting-i2cSensors.jpg](https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/hardwareSetting-i2cSensors.jpg "hardwareSetting-i2cSensors.jpg")

* シールドがない場合は以下の画像をそれぞれ参考にして回路を準備してください。

#### 温度センサの接続

<img src="https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/adt7410Breadboard.jpg" width="400px">

#### 距離センサの接続

<img src="https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/srf02Breadboard.jpg" width="400px">

#### 光センサの接続

<img src="https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/groveLightBreadboard.png" width="400px">

#### 加速度センサの接続

<img src="https://github.com/naokisekiguchi/WoTsignageText/raw/master/images/groveAccelerometerBreadboard.png" width="400px">

## ソフトウェアの準備

* [chirimenI2cSensors](https://github.com/naokisekiguchi/WoTsignageText/tree/master/chirimenI2cSensors)を参考にソースコードを準備してください。
* task.js、webgpio polyfillを使用します。

## プログラムの説明
サンプルプログラムについて解説する。

* I2Cポートの初期化
* 温度センサの読み込み
* 距離センサの読み込み
* 光センサの読み込み
* 加速度センサの読み込み
* センサ値の出力


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

* [I2Cポートの初期化処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L10-L13)をspawn関数内に記述します。

```I2Cポートの初期化処理
// I2C へのアクセサを取得
const accessor = yield navigator.requestI2CAccess();
// I2C 0 ポートを使うので、0 を指定してポートを取得
const port = accessor.ports.get(0);
```


### 温度センサの読み込み

* 温度センサを読み込む処理は[getTemp関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L45-L58)にまとめてあります。

```getTemp関数
function getTemp(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
    
      const highBit = yield slave.read8(0x00, true);
      const lowBit = yield slave.read8(0x01, true);
        
      const temp = ((highBit << 8) + lowBit)/128.0;
      resolve(temp);
    
    });
  });
}
```

* 初期化したI2Cポートオブジェクトと温度センサのアドレス(0x48)を指定して、[温度センサの取得処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L21)を記述します。

```温度センサの取得処理
const temp = yield getTemp(port,0x48);
```


### 距離センサの読み込み

* 距離センサを読み込む処理は[getDistance関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L60-L77)にまとめてあります。

```getDistance関数
function getDistance(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x00, 0x00);
      yield sleep(1);
      yield slave.write8(0x00, 0x51);
      yield sleep(70);
      const highBit = yield slave.read8(0x02, true);
      const lowBit = yield slave.read8(0x03, true);
      
      const distance = (highBit << 8) + lowBit;
      resolve(distance);
    
    });
  });
}
```

* 初期化したI2Cポートオブジェクトと距離センサのアドレス(0x70)を指定して、[距離センサの取得処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L22)を記述します。

```距離センサの取得処理
const distance = yield getDistance(port,0x70);
```

### 光センサの読み込み

* 光センサ（Grove Digital Light Sensor）の読み込みには初期処理が必要です。
* 光センサの初期化は[groveLightInit関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L80-L98)にまとめてあります。

```groveLightInit関数
function groveLightInit(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x80,0x03);
      yield sleep(10);
      yield slave.write8(0x81,0x00);
      yield sleep(14);
      yield slave.write8(0x86,0x00);
      yield sleep(10);
      yield slave.write8(0x80,0x00);
      yield sleep(10);

      resolve();
    
    });
  });
}
```

* 初期化したI2Cポートオブジェクトと光センサのアドレス（0x29）を指定して、[光センサの初期化処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L15)を記述してください。初期化処理は1度で良いので、setInterval関数の前に実行します。

```光センサの初期化処理
yield groveLightInit(port,0x29);
```

* 光センサを読み込む処理は[getLight関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L100-L124)にまとめてあります。明るさをluxの単位で表示するため、[calculateLux関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L192-L245)も一緒に追記してください。

```getLight関数
function getLight(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x80,0x03);
      yield sleep(14);
      
      
      const ch0H = yield slave.read8(0x8d,true);
      const ch0L = yield slave.read8(0x8c,true);
      const ch1H = yield slave.read8(0x8f,true);
      const ch1L = yield slave.read8(0x8e,true);
      
      const ch0 = ((ch0H << 8) | ch0L);
      const ch1 = ((ch1H << 8) | ch1L);
      
      const lux = calculateLux(ch0,ch1,0,0,0);

      resolve(lux);
    
    });
  });

}
```


* 他のセンサと同様、[光センサの取得処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L23)を記述してください。

```光センサの取得処理
const lux = yield getLight(port,0x29);
```

### 加速度センサの読み込み

* 加速度センサ（Grove Accelerometer Sensor）の読み込みには、光センサと同様初期処理が必要です。
* 加速度センサの初期化は[groveAccelerometerInit関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L126-L142)にまとめてあります。

```groveAccelerometerInit関数
function groveAccelerometerInit(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x2d,0x00);
      yield sleep(10);
      yield slave.write8(0x2d,0x16);
      yield sleep(10);
      yield slave.write8(0x2d,0x08);
      yield sleep(10);

      resolve();
    
    });
  });
}
```

* 初期化したI2Cポートオブジェクトと加速度センサのアドレス（0x53）を指定して、[加速度センサの初期化処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L16)を記述してください。

```加速度センサの初期化処理
yield groveAccelerometerInit(port,0x53);
```

* 加速度センサを読み込む処理は[getAccelerometer関数](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L143-L190)にまとめてあります。

```getAccelerometer関数
function getAccelerometer(port,addr){
  return new Promise(function(resolve,reject){
    spawn(function(){
      const slave = yield port.open(addr);
      
      yield slave.write8(0x80,0x03);
      yield sleep(14);
     
      const xL = yield slave.read8(0x32,true);
      const xH = yield slave.read8(0x33,true);
      const yL = yield slave.read8(0x34,true);
      const yH = yield slave.read8(0x35,true);
      const zL = yield slave.read8(0x36,true);
      const zH = yield slave.read8(0x37,true);
      
      let x = xL + (xH << 8);
      if(x & (1 << 16 - 1)){x = x - (1<<16);}
      let y = yL + (yH << 8);
      if(y & (1 << 16 - 1)){y = y - (1<<16);}
      let z = zL + (zH << 8);
      if(z & (1 << 16 - 1)){z = z - (1<<16);}
      
      console.log(x);
      
      const EARTH_GRAVITY_MS2=9.80665;
      const SCALE_MULTIPLIER=0.004;
      
      x = x*SCALE_MULTIPLIER;
      y = y*SCALE_MULTIPLIER;
      z = z*SCALE_MULTIPLIER;
            
      x = x*EARTH_GRAVITY_MS2;
      y = y*EARTH_GRAVITY_MS2;
      z = z*EARTH_GRAVITY_MS2;
     
      x=Math.round(x*10000)/10000;
      y=Math.round(y*10000)/10000;
      z=Math.round(z*10000)/10000;
      
      const accelerometer = {"x": x, "y": y, "z": z};
      console.log(accelerometer.x);

      resolve(accelerometer);
    
    });
  });

}
```


* 他のセンサと同様、[加速度センサの取得処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L24)を記述してください。

```加速度センサの取得処理
const accelerometer = yield getAccelerometer(port,0x53);
```


### センサ値の出力

* 正しくセンサ値の取得ができていれば、[センサ値の出力処理](https://github.com/naokisekiguchi/WoTsignageText/blob/master/chirimenI2cSensors/js/chirimenI2cSensors.js#L27-L35)を記述することで、各センサの値が出力されます。

```センサ値の出力処理
console.log("temp: "+temp);
console.log("distance: "+distance);
console.log("lux: "+lux);
console.log("acceleromter: " + accelerometer.x + ","+ accelerometer.y + ","+ accelerometer.z);

// HTML 画面に距離を表示
document.querySelector("#temp").textContent = "temp: " + temp;
document.querySelector("#distance").textContent = "distance: "+distance;
document.querySelector("#lux").textContent = "lux: "+lux;
document.querySelector("#accelerometer").textContent = "acceleromter: " + accelerometer.x + ","+ accelerometer.y + ","+ accelerometer.z;

```

* chirimenI2cSensorsアプリでは1秒毎に4つのセンサの値を取得して出力します。

