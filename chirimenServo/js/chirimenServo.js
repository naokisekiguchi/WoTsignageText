// task.js ライブラリ
const { spawn, sleep } = task;
// document 内のリソースが読み終わるのを待つ
document.addEventListener("DOMContentLoaded", () => {
  
  // task.js の spawn 関数内では Promise が同期的に記述できる
  spawn(function() {
  
    // I2C へのアクセサを取得
    const accessor = yield navigator.requestI2CAccess();
    // I2C 0 ポートを使うので、0 を指定してポートを取得
    const port = accessor.ports.get(0);
    
    const pcs9685 = new PCA9685(port,0x40);
    yield pcs9685.init(0.00050,0.00240,180);
    
    let angle = 10;
    
    setInterval( ()=>{
      spawn(function(){
        angle = (angle<=10) ? 170 : 10;
        yield pcs9685.setServo(0,angle);
        document.getElementById("angle").innerHTML = angle;
      });
    },1000);
  });
});

const PCA9685 = function(i2cPort,slaveAddress){
  this.i2cPort = i2cPort;
  this.slaveAddress = slaveAddress;
  this.minPulse=null;
  this.maxPulse=null;
  this.angleRange=null;
};

PCA9685.prototype = {

  init: function(minPulse,maxPulse,angleRange,noSetZero){
    const self = this;
    if(self.minPulse && self.maxPulse && self.angleRange){
      console.log("alredy set param");
    }
    if(minPulse && maxPulse && angleRange){ 
      self.minPulse = minPulse;
      self.maxPulse = maxPulse;
      self.angleRange = angleRange;
      console.log("set servo setting.");
    }else{
      self.minPulse = 0.0005;
      self.maxPulse = 0.0024;
      self.angleRange = 180;
      console.log("set defaul servo setting.");
    }

    return new Promise(function(resolve, reject){
      spawn(function(){
        const slave = yield self.i2cPort.open(self.slaveAddress);
        
        yield slave.write8(0x00,0x00);
        yield sleep(10);
        yield slave.write8(0x01,0x04);
        yield sleep(10);

        yield slave.write8(0x00,0x10);
        yield sleep(10);
        yield slave.write8(0xfe,0x64);
        yield sleep(10);
        yield slave.write8(0x00,0x00);
        yield sleep(10);
        yield slave.write8(0x06,0x00);
        yield sleep(10);
        yield slave.write8(0x07,0x00);
        yield sleep(300);
        if ( !noSetZero ){
          for ( let servoPort = 0 ; servoPort < 16 ; servoPort ++ ){
            yield self.setServo(servoPort , 0 );
          }
        }
        resolve();
      });
    });  
  },
  setServo: function(servoPort,angle){
    const self = this;

    const portStart = 8;
    const portInterval = 4;
        
    const freq = 61; // Hz
    const tickSec = ( 1 / freq ) / 4096; // 1bit resolution( sec )
    
    let minPulse,maxPulse,angleRange,pulseRange;
    if(self.minPulse && self.maxPulse && self.angleRange){
      minPulse = self.minPulse;
      maxPulse = self.maxPulse;
      pulseRange = maxPulse - minPulse;
      angleRange = self.angleRange;
    }else{
      console.log("wrong param.");
    }
    const pulse = minPulse + angle / angleRange * pulseRange;
    const ticks = Math.round(pulse / tickSec);
    
    const tickH = (( ticks >> 8 ) & 0x0f);
    const tickL = (ticks & 0xff);
    
    return new Promise(function(resolve, reject){
      spawn(function(){
        const slave = yield self.i2cPort.open(self.slaveAddress);
        const pwm = Math.round(portStart + servoPort * portInterval);
        
        yield slave.write8( pwm + 1, tickH);
        yield sleep(1);
        yield slave.write8( pwm, tickL);
        
        resolve();
      });
    });  
  }
};