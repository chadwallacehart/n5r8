/**
 * Created by chad on 3/4/17.
 */

'use strict';

/***** Johnny Five Setup *****/

const five = require("johnny-five"),
    Raspi = require("raspi-io");


const board = new five.Board({
    io: new Raspi({includePins: ['GPIO7', 'GPIO17', 'GPIO27', 'GPIO22', 'GPIO4', 'GPIO12', "P1-12"]})
});

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {
}
const emitter = new MyEmitter();

let led, rf, rb, lf, lb, gunMotor, gunServo;
let hwReady = false;
let moving = false;

//ToDo: make these environments variables?
const servoInterval = 450,   //600 max reliable speed in my initial tests
    servoMin = -30,
    servoMax = 270, //280
    spinUpTime = 1000,
    stopDelay = 500; //3000

board.on("ready", function () {
    led = new five.Led('GPIO7');    //LED       | PIN  | GPIO7 | green wire

    //motor controls
    rf = new five.Pin('GPIO17');     //RF        | PIN11 | GPIO17 | green wire
    rb = new five.Pin('GPIO27');     //RB        | PIN13 | GPIO27 | red wire
    lf = new five.Pin('GPIO22');     //LF        | PIN15 | GPIO22 | white wire
    lb = new five.Pin('GPIO4');      //LB        | PIN7  | GPIO4  | yellow wire

    //gun controls
    gunMotor = new five.Pin('GPIO12');   //gun        | PIN21 | GPIO12 | white wire
    gunServo = new five.Servo({
        pin: "P1-12",
        range: [servoMin, servoMax],
        startAt: servoMin
    });

    //initialize all the pins
    rf.low();
    rb.low();
    lf.low();
    lb.low();
    gunMotor.low();

    emitter.emit('hwReady');
});

/***** Motor controls *****/

//todo: by moving everything into the constructor, did I just kill the advantages of a class here?
class Command {
    constructor(name, pins) {
        this.name = name;
        this.pins = pins;

        //arrow functions below to pass `this` through each level
        this.start = function start(t, speed, cb) {

            //Allow optional arguments and always check for callback
            if (arguments.length < 3 && typeof speed === 'function') {
                cb = speed;
                speed = null;
            }
            else if (arguments.length === 1 && typeof t === 'function') {
                cb = t;
                t = null;
                speed = null;
            }

            //Cancel is hardware isn't ready
            if (hwReady === false) {
                let err = "hardware not ready";
                if (cb)
                    return err;
                else
                    return new Promise((reject) => reject(err));
            }

            if (isNaN(t)) t = 1;

            let pulseDuration = 100; //how long to time each pulse in ms
            let pulseOn = false;
            let running = true;

            let timer;

            let pulse = () => {
                if (running === false)        //todo: remove this?
                    return false;

                pulseOn = !pulseOn;
                let duration = (pulseOn === true) ? Math.round(pulseDuration * speed) : Math.round(pulseDuration * (1 - speed));
                let state = () => (pulseOn === true) ? setHigh() : setLow();

                timer = setTimeout(() => {
                    state();
                    //console.log("I am " + (pulseOn == true ? "on" : "off" ) + " for " + duration);
                    pulse();
                }, duration);
            };

            console.log(name + (speed ? " at " + speed + " speed" : "" ) + " for " + t + " seconds");

            setHigh();

            if (speed)
                if (!isNaN(speed))  //make sure it is a number
                    pulse();

            if (cb)
                setTimeout(() => {
                        running = false;
                        clearTimeout(timer);
                        setLow();
                        cb();
                    }
                    , t * 1000);
            else
                return new Promise((resolve) => {
                    setTimeout(() => {
                            running = false;
                            clearTimeout(timer);
                            setLow();
                            resolve();
                        }
                        , t * 1000);
                });
        };

        function setHigh() {
            pins.forEach((pin) => pin.high())
            moving = true;
        }

        function setLow() {
            pins.forEach((pin) => pin.low())
            moving = false;
        }
    }
}


class Controller {
    constructor(name, pins) {
        this._name = name;
        this._pins = pins;
        this._running = false;
    }

    start(speed) {
        if (this._running === true)
            return;

        console.log(this._name + " starting");

        let pulseDuration = 100; //how long to time each pulse in ms
        let pulseOn = false;

        let pulse = () => {

            pulseOn = !pulseOn;
            let duration = (pulseOn === true) ? Math.round(pulseDuration * speed) : Math.round(pulseDuration * (1 - speed));
            let state = () => (pulseOn === true) ? this._setHigh() : this._setLow();

            this._timer = setTimeout(() => {
                state();
                //console.log(this._name + " pulse " + (pulseOn == true ? "on" : "off" ) + " for " + duration);
                pulse();
            }, duration);
        };

        this._setHigh();

        if (!isNaN(speed))  //make sure it is a number
            pulse();

    }

    stop() {
        console.log(this._name + " stopping");
        this._running = false;
        clearTimeout(this._timer);
        this._setLow();
    }

    _setHigh() {
        this._pins.forEach((pin) => pin.high())
        moving = true;
    }

    _setLow() {
        this._pins.forEach((pin) => pin.low())
        moving = false;
    }

}


function off() {
    console.log("Turning everything off");
    //re-initialize all the pins
    rf.low();
    rb.low();
    lf.low();
    lb.low();
    gunMotor.low();
    moving = false;
}


//todo: see why this doesn't seem to work below 50%
function oldForward(t, speed, cb) {
    if (hwReady === false)
        return false;

    if (isNaN(t)) t = 1;

    let pulseDuration = 100; //how long to time each pulse in ms
    let pulseOn = false;
    let running = true;
    let state = 0x00;
    let timer;

    function pulse() {
        if (running = false)        //this might be redundant
            return;

        pulseOn = !pulseOn;
        let duration = pulseOn === true ? Math.round(pulseDuration * speed) : Math.round(pulseDuration * (1 - speed));

        timer = setTimeout(() => {
            state ^= 0x01;
            rf.write(state);
            lf.write(state);
            //console.log("I am " + (pulseOn == true ? "on" = "off" ) + " for " + duration + "ms");
            pulse();
        }, duration);
    }

    console.log("Forward= rf & lf" + (speed ? " at " + speed : "" ) + " for " + t + " seconds");

    rf.high();
    lf.high();

    if (speed)
        if (!isNaN(speed))  //make sure it is a number
            pulse();

    if (cb)
        setTimeout(function () {
                running = false;
                clearTimeout(timer);
                rf.low();
                lf.low();
                cb(true);
            }
            , t * 1000);
    else
        return new Promise((resolve) => {
            setTimeout(function () {
                    running = false;
                    clearTimeout(timer);
                    rf.low();
                    lf.low();
                    resolve(true);
                }
                , t * 1000);
        });
}


/***** Gun functions *****/


//Shoot n numbers of shots
function shoot(bullets) {
    if (hwReady === false)
        return;

    function fire() {
        gunServo.sweep({interval: servoInterval});
        setTimeout(() => {
            console.log("turning off gun");
            gunServo.stop();
            gunServo.min(); //reset to min position
            gunMotor.low();
        }, bullets * interval * 2);
    }

    console.log("Turning on gun. Ready to fire " + bullets + " bullets");
    gunMotor.high();
    setTimeout(() => {
        fire()
    }, spinUpTime);   //The motors need about 2.5 seconds to spin up to speed before firing
}


class gunController {
    constructor(servo, motor){
        this._servo = servo;
        this._motor = motor;
        this._shooting = false;
        this._motorStarting = false;
    }

    start() {
        if (this._shooting === true)
            return;

        console.log("turning gun on");


        clearTimeout(this.tStop);
        this._motor.high();

        if (this._shooting === false) {     //ignore if already shooting
            this._shooting = true;

            if (this._motorStarting === false) {
                this._motorStarting = true;
                this.tStart = setTimeout(() => {
                    console.log("Motor finished spin-up");
                    this._motorStarting = false;
                    this._servo.sweep({interval: servoInterval});
                    //this._fastFire();
                }, spinUpTime); //The motors need about 2.5 seconds to spin up to speed before firing
            }
            else {
                this._servo.sweep({interval: servoInterval});
                //this._fastFire();
            }
        }
    }

    stop(){
        if (this._shooting === false)
            return;

        console.log("turning off gun");

        this.tStop = setTimeout(()=>{
            clearTimeout(this.tStart);
            this._servo.stop();
            this._servo.min(); //reset to min position
            this._motor.low();
            this._shooting = false;
            this._motorStarting = false;
        }, stopDelay);

    }

    //Function to rapidly fire by starting in the max position
    //j5 servo.sweep starts in min
    //ToDo: Debug this
    _fastFire(){
        this._servo.max();
        setTimeout(()=>
            this._servo.sweep({interval: servoInterval})
            , servoInterval/2)
    }

}


/***** Exports functions *****/

function init() {

    emitter.on('hwReady', () => {
        hwReady = true;
        led.blink(1000);

        //Used by commandParser.js for single sequential instructions
        exports.forward = new Command("forward", [lf, rf]).start;
        exports.backward = new Command("backward", [lb, rb]).start;
        exports.spinright = new Command("spinright", [lf, rb]).start;
        exports.spinleft = new Command("spinleft", [rf, lb]).start;
        //exports.shoot = new Command("shoot", [gun]).start;
        exports.rightfront = new Command("rf", [rf]).start;
        exports.rightback = new Command("rb", [rb]).start;
        exports.leftfront = new Command("lf", [lf]).start;
        exports.leftback = new Command("lb", [lb]).start;

        exports.shoot = shoot;
        exports.off = off;

        //Used by gameControl for async control
        exports.rf = new Controller("rf", [rf]);
        exports.rb = new Controller("rb", [rb]);
        exports.lf = new Controller("lf", [lf]);
        exports.lb = new Controller("lb", [lb]);
        exports.gun = new gunController(gunServo, gunMotor);

        exports.moving = moving;    //ToDo: validate this

        console.log("Rover hardware initialized");
        emitter.emit("configReady");

    });
}

function onReady(cb) {

    if (cb)
        emitter.on('configReady', () => {
            console.log("starting");
            hwReady = true;
            cb();
        });
    else
        return new Promise((resolve) => {
            emitter.on('configReady', () => {
                hwReady = true;
                resolve();
            });
        });
}

exports.init = init;
exports.onReady = onReady;