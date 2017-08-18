/**
 * Created by chad on 4/22/17.
 */
const r2 = require('/home/pi/dev/r2d2talk')();

//setTimeout(()=>{

    r2.load()
        .then(()=>r2.talk("hello"))
        .catch((err)=>console.log("r2d2talk error: " + err));
//}, 5000);
