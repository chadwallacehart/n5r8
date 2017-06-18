/**
 * Created by chad on 3/5/17.
 */

//ToDo: deprecate this module and use johnny-five if it works
const usonic = require('mmm-usonic');

const sensor =
    [
        {
            name: "frontRight",
            config: {
                echoPin: 5,
                triggerPin: 6,
                timeout: 750,   //750
                delay: 60,      //60
                rate: 5         //5
            },
            intVar: null
        },
        {
            name: "frontLeft",
            config: {
                echoPin: 19,
                triggerPin: 13,
                timeout: 750,   //750
                delay: 60,      //60
                rate: 5         //5
            },
            intVar: null
        },
        {
            name: "rearRight",
            config: {
                echoPin: 21,
                triggerPin: 26,
                timeout: 750,   //750
                delay: 60,      //60
                rate: 5         //5
            },
            intVar: null
        },
        {
            name: "rearLeft",
            config: {
                echoPin: 16,
                triggerPin: 20,
                timeout: 750,   //750
                delay: 60,      //60
                rate: 5         //5
            },
            intVar: null
        }
    ];




const Readable = require('stream').Readable;

class Range extends Readable {
    constructor(opt) {
        super(opt);
    }

    _read() {
        let self = this;
    }

    //objectMode: true
}


function startSensor(config, location) {
    let sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);
    let last = -1;

    console.log('Usonic ' + location + ': ' + JSON.stringify(config));

    this.intVar = setInterval( () => {
        let r = sensor();
        //Only send if change is over a specific % and if is not too large
        //todo: && Math.abs(r - last) < range.maxChange)
        if ( Math.abs(r - last) > (last * range.changeThreshold && Math.abs(r - last) < range.maxChange) || last === -1){
            range.push({distance: r.toFixed(0), location: location});
            last = r;
        }

    }, config.delay);

}


let range = new Range({objectMode: true});

range.changeThreshold = 0.10; //do this as a %
range.maxChange = 50;   //prevent false spikes


range.init = () => {
    usonic.init((error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Initializing sensor(s)");
            sensor.forEach( (sensor) => startSensor(sensor.config, sensor.name));
            //startSensor(sensor.frontRight, "front-right");
            //startSensor(sensor.frontLeft, "front-left");
        }
    });
};

range.stop = () =>
    sensor.forEach( (sensor) => clearTimeout(sensor.intVar));

module.exports = range;