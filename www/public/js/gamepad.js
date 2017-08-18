/**
 * Created by chad on 3/25/17.
 */

//ToDo: remember out how to initialze this properly if socket is already loaded
//let socket = socket || io();

socket.on('init', (data) => {
    console.log(data);
});

function init(){

    let compassData = document.getElementById("data-compass");
    let rangeFrData = document.getElementById("data-rangeFr");
    let rangeFlData = document.getElementById("data-rangeFl");
    let rangeRrData = document.getElementById("data-rangeRr");
    let rangeRlData = document.getElementById("data-rangeRl");

    socket.on('sensor', (data) => {
        //console.log(data);
        if (data.type === "compass")
            compassData.innerHTML = data.heading;
        if (data.type === "range") {

            if (data.location === "front right")
                rangeFrData.innerHTML = data.distance;
            if (data.location === "front left")
                rangeFlData.innerHTML = data.distance;
            if (data.location === "rear right")
                rangeRrData.innerHTML = data.distance;
            if (data.location === "rear left")
                rangeRlData.innerHTML = data.distance;
        }
    });

    touch();
}

document.addEventListener("DOMContentLoaded", (event)=> {
    init();
});