// =============================
// MAP INITIALIZATION
// Flood-prone region near Chambal River (Kota)
// =============================

var base = [25.2138, 75.8648];

var map = L.map('map').setView(base, 13);

L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
{ maxZoom: 19 }
).addTo(map);


// =============================
// LARGE ICONS
// =============================

var droneIcon = L.divIcon({
html:"✈️",
className:"",
iconSize:[50,50]
});

var humanIcon = L.divIcon({
html:"🧍‍♂️",
className:"",
iconSize:[55,55]
});

var houseIcon = L.divIcon({
html:"🏠",
className:"",
iconSize:[50,50]
});

var treeIcon = L.divIcon({
html:"🌳",
className:"",
iconSize:[50,50]
});


// =============================
// SIMULATED DETECTIONS
// =============================

var humans = [
[25.215,75.862],
[25.210,75.867],
[25.212,75.865]
];

var houses = [
[25.214,75.868],
[25.208,75.864]
];

var trees = [
[25.212,75.869]
];

humans.forEach(p=>{
let m=L.marker(p,{icon:humanIcon}).addTo(map);

m.on("click",()=>{
showPopup(
"Human Detected",
"Possible flood survivor detected. Rescue may be required.",
p,
true
);
});
});

houses.forEach(p=>{
let m=L.marker(p,{icon:houseIcon}).addTo(map);

m.on("click",()=>{
showPopup(
"House Located",
"Residential building detected. Possible occupants.",
p,
true
);
});
});

trees.forEach(p=>{
let m=L.marker(p,{icon:treeIcon}).addTo(map);

m.on("click",()=>{
showPopup(
"Tree",
"Vegetation detected. No action required.",
p,
false
);
});
});


// =============================
// DRONE SYSTEM
// =============================

var drone;
var dronePath;
var pathLine;

var battery = 100;
var altitude = 40;


// DEPLOY SCANNING DRONE

function deployDrone(){

document.getElementById("droneId").innerText="Drone-01";

drone=L.marker(base,{icon:droneIcon}).addTo(map);

dronePath=[base];

pathLine=L.polyline(dronePath,{color:"orange"}).addTo(map);


// Pentagon scanning route

let route=[
base,
[25.217,75.861],
[25.219,75.866],
[25.214,75.870],
[25.209,75.866],
base
];

moveDroneSmooth(route);

}



// =============================
// SMOOTH DRONE MOVEMENT
// =============================

function moveDroneSmooth(route){

let i=0;

function moveSegment(){

if(i>=route.length-1) return;

let start=route[i];
let end=route[i+1];

let steps=120;

let latStep=(end[0]-start[0])/steps;
let lngStep=(end[1]-start[1])/steps;

let step=0;

let interval=setInterval(()=>{

let lat=start[0]+latStep*step;
let lng=start[1]+lngStep*step;

let pos=[lat,lng];

drone.setLatLng(pos);

dronePath.push(pos);

pathLine.setLatLngs(dronePath);

updateTelemetry(pos);

step++;

if(step>steps){

clearInterval(interval);

i++;

moveSegment();

}

},180); // VERY SLOW DRONE SPEED

}

moveSegment();

}



// =============================
// DRONE SWARM
// =============================

function deploySwarm(){

deployDrone();

setTimeout(()=>{
deployDrone();
},4000);

}



// =============================
// TELEMETRY SYSTEM
// =============================

function updateTelemetry(pos){

battery = Math.max(0, battery - 0.03);

document.getElementById("battery").innerText = Math.floor(battery);

document.getElementById("altitude").innerText = altitude;

document.getElementById("speed").innerText = 5;

document.getElementById("lat").innerText = pos[0].toFixed(5);

document.getElementById("lon").innerText = pos[1].toFixed(5);

document.getElementById("altitudeBar").style.width =
(altitude/100*100)+"%";

}



// =============================
// POPUP SYSTEM
// =============================

var target=null;

function showPopup(title,desc,pos,allow){

document.getElementById("popupTitle").innerText=title;

document.getElementById("popupDescription").innerText=desc;

target=pos;

let btn=document.getElementById("supplyBtn");

btn.style.display = allow ? "block" : "none";

document.getElementById("infoPopup").classList.remove("hidden");

}

function closePopup(){

document.getElementById("infoPopup").classList.add("hidden");

}



// =============================
// SUPPLY DRONE
// =============================

function dispatchSupply(){

if(!target) return;

let supply=L.marker(base,{icon:droneIcon}).addTo(map);

let route=[
base,
target,
base
];

moveSupplyDrone(supply,route);

closePopup();

}


function moveSupplyDrone(drone,route){

let i=0;

function moveSegment(){

if(i>=route.length-1){

map.removeLayer(drone);

return;

}

let start=route[i];
let end=route[i+1];

let steps=90;

let latStep=(end[0]-start[0])/steps;
let lngStep=(end[1]-start[1])/steps;

let step=0;

let interval=setInterval(()=>{

let lat=start[0]+latStep*step;
let lng=start[1]+lngStep*step;

drone.setLatLng([lat,lng]);

step++;

if(step>steps){

clearInterval(interval);

i++;

moveSegment();

}

},170);

}

moveSegment();

}



// =============================
// ANNOUNCEMENT SYSTEM
// =============================

function sendText(){

let msg=document.getElementById("announcement").value;

if(msg==="") return;

alert("Emergency Broadcast: " + msg);

}



// =============================
// VOICE ANNOUNCEMENT
// =============================

let recorder;

function startRecording(){

navigator.mediaDevices.getUserMedia({audio:true})
.then(stream=>{

recorder=new MediaRecorder(stream);

recorder.start();

alert("Voice announcement recording started");

});

}