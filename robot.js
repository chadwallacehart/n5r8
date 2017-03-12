//Hardware dependencies
const ledmatrix = require('./hardware/ledmatrix'),
    compass = require('./hardware/compass'),
    range = require('./hardware/range');

let rover = require('./hardware/j5');

//require('./control/actions.js');

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
//);
//rover.emitter.on('hwReady', ()=> rover.forward(1, ()=> rover.slowForward(5, ()=> console.log("done"))));
//rover.forward(5);
//rover.emitter.on('hwReady',

/*rover.onReady()
    .then(()=>rover.forward(1, (1/2))
    .then(()=>rover.forward(1, (2/3))
    .then(()=>rover.forward(1))
    .then(()=>console.log("done")))
    .catch((e)=>console.error(e)));
*/


rover.onReady()
    .then(()=>rover.forward(1, 0.5))
    .then(()=>rover.backward(1, 0.5))
    .then(()=>rover.spinright(1, 0.5))
    .then(()=>rover.spinleft(1, 0.5))
    .then(()=>console.log("done"));


//rover.onReady(()=>rover.forward(2, ()=>console.log("done")));