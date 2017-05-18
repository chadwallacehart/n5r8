//Hardware dependencies
const ledmatrix = require('./hardware/ledmatrix'),
    compass = require('./hardware/compass'),
    range = require('./hardware/range'),
    rover = require('./hardware/j5'),
    www = require('./www/app.js');

const r2 = require('/home/pi/dev/r2d2talk')();

//require('./control/comandParser.js');

//todo: is there a reason to not just initialize on load for these?
//Hardware init
ledmatrix.init();
compass.init();
range.init();
rover.init();

const talk = r2.talk;
r2.load()
    .then(() => {
        talk("hello")
    })
    .then(() => {
        ledmatrix.setColor("green", 2000)
    }) //todo: this isn't working
    .catch((err) => console.log("r2d2talk error: " + err));
compass.on('data', (heading) => console.log('heading: ' + heading));

//todo: move these somewhere
function rangeAttack(countdown, distance) {
    let ranges = [];

    range.on('data', (data) => {
        console.log('range:' + data.location + " reported " + data.distance);
        ranges.push(data.distance);
    });

    let timer = countdown;

    setTimeout(() => {

        clearInterval(t);

        t = setInterval(() => {

            if (ranges.length <= 1)
                return;

            let sum = 0;

            //Attempt at a debouncing to average out random values
            for (let i = 0; i < ranges.length; i++)
                sum += parseInt(ranges[i], 10);

            let avg = sum / ranges.length;
            if (avg < distance) {
                console.log("average: " + avg);
                rover.shoot(15);            //Shoot for 15 seconds, make this a parameter?

            }
            ranges = [];

        }, 400);


    }, timer * 1000);

    let t = setInterval(() => console.log("countdown: " + timer--), 1000);
}

//ToDo: set this for each sensor
function __tooClose(distance) {
    let ranges = [];
    let tooCloseTrigger = false;

    range.on('data', (data) => {
        //console.log('range:' + data.location + " reported " + data.distance);
        ranges.push(data.distance);
    });


    setInterval(() => {

        if (ranges.length <= 1)
            return;

        let sum = 0;

        //Attempt at a debouncing to average out random values
        for (let i = 0; i < ranges.length; i++)
            sum += parseInt(ranges[i], 10);

        let avg = sum / ranges.length;
        if (avg < distance) {
            if (tooCloseTrigger === false) {
                tooCloseTrigger = true;
                console.log("Too close! average: " + avg);
                talk("close");
                ledmatrix.setColor("red", 1000, () => {
                    console.log("color done")
                }); //do I need a callback here?
            }

        }
        else
            tooCloseTrigger = false;
        ranges = [];

    }, 250);

}

function tooClose(distance) {
//ToDo: rewrite this to work on any number of sensors instead of just a fixed 2
    let rangesL = [];
    let rangesR = [];

    range.on('data', (data) => {
        //console.log('range:' + data.location + " reported " + data.distance);
        if (data.location === "frontLeft")
            rangesL.push(data.distance);
        else if (data.location === "frontRight")
            rangesR.push(data.distance);
        else
            console.log("Invalid range sensor location")
    });


    function checkArray(ranges, word) {
        let tooCloseTrigger = false;

        if (ranges.length <= 1)
            return;

        console.log("interval for " + word + ": "+  ranges);

        let sum = 0;
        //Attempt at a debouncing to average out random values
        for (let i = 0; i < ranges.length; i++)
            sum += parseInt(ranges[i], 10);


        let avg = sum / ranges.length;
        if (avg < distance) {
            if (tooCloseTrigger === false) {
                tooCloseTrigger = true;
                console.log("Too close! average: " + avg);
                talk(word);
                ledmatrix.setColor("red", 1000, () => {
                    console.log("color done")
                }); //do I need a callback here?
            }

        }
        else
            tooCloseTrigger = false;

        return tooCloseTrigger;
    }

    setInterval(() => {
        checkArray(rangesL, "left");
        rangesL = [];
        checkArray(rangesR, "right");
        rangesR = [];
    }, 250);
}


//rangeAttack(5, 140);


/*rover.onReady()
 .then(()=>rover.forward(1, 0.5))
 .then(()=>rover.backward(1, 0.5))
 .then(()=>rover.spinright(1, 0.5))
 .then(()=>rover.spinleft(1, 0.5))
 .then(()=>console.log("done"))
 .catch((err)=>console.log(err));
 */

function controllerTest() {
    console.log("Calling start");
    rover.rf.start(0.5);
    setTimeout(function () {
        console.log("calling stop");
        rover.rf.stop()
    }, 5000);
}

rover.onReady()
//.then(controllerTest);
    .then(() => {
        tooClose(30);
        console.log("loaded")
    });
//rover.onReady(()=>rover.forward( ()=>console.log("done")));