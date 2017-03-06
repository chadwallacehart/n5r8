//Hardware dependencies
const   ledmatrix = require('./hardware/ledmatrix'),
        compass = require('./hardware/compass'),
        range = require('./hardware/range'),
        rover = require('./hardware/j5');

ledmatrix.init();
compass.init();
range.init();
rover.init();

//compass.on('data', (heading) => console.log('heading: ' + heading));

//setTimeout(compass.stop, 10000);

let ranges = [];

range.on('data', (data) => {

    console.log('range:' + data.location + " reported " + data.distance);

    ranges.push(data.distance);


});


let timer = 5;

setTimeout( ()=>{


    clearInterval(t);

    t = setInterval( ()=> {

        if (ranges.length <= 1)
            return;

        let sum = 0;
        for( let i = 0; i < ranges.length; i++ )
            sum += parseInt( ranges[i], 10 );

        let avg = sum/ranges.length;
        //console.log(ranges);
        //console.log(avg);
        if (avg < 120){
            console.log("average: "+ avg);
            rover.shoot(15);
            clearInterval(t);
        }
        ranges = [];

    }, 400);


}, timer * 1000);

let t  = setInterval(()=>console.log("countdown: " + timer--), 1000);

//rover.emitter.on('hwReady', () => rover.shoot(10) );


//compass.pipe(process.stdout);
