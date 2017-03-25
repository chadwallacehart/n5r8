//Hardware dependencies
const ledmatrix = require('./hardware/ledmatrix'),
    compass = require('./hardware/compass'),
    range = require('./hardware/range'),
    rover = require('./hardware/j5'),
    www = require('./www/app.js');

//require('./control/comandParser.js');

//todo: is there a reason to not just initialize on load for these?
//Hardware init
ledmatrix.init();
compass.init();
range.init();
rover.init();

compass.on('data', (heading) => console.log('heading: ' + heading));

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

//rangeAttack(5, 140);


/*rover.onReady()
    .then(()=>rover.forward(1, 0.5))
    .then(()=>rover.backward(1, 0.5))
    .then(()=>rover.spinright(1, 0.5))
    .then(()=>rover.spinleft(1, 0.5))
    .then(()=>console.log("done"))
    .catch((err)=>console.log(err));
*/

function controllerTest(){
    console.log("Calling start");
    rover.rf.start(0.5);
    setTimeout(function(){
        console.log("calling stop");
        rover.rf.stop()
    }, 5000);
}

rover.onReady()
    //.then(controllerTest);
    .then(()=>console.log("loaded"));
//rover.onReady(()=>rover.forward( ()=>console.log("done")));