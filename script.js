"use strict";

/*=========================================================
    Inclined Plane Free Body Diagram Simulation
    Version 2.0
=========================================================*/

/*=========================================================
    Canvas
=========================================================*/

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/*=========================================================
    Controls
=========================================================*/

const angleSlider = document.getElementById("angleSlider");
const massSlider = document.getElementById("massSlider");
const muSlider = document.getElementById("muSlider");
const resetBtn = document.getElementById("resetBtn");

const angleValue = document.getElementById("angleValue");
const massValue = document.getElementById("massValue");
const muValue = document.getElementById("muValue");
const muDisplay = document.getElementById("muDisplay");

const weightValue = document.getElementById("weightValue");
const normalValue = document.getElementById("normalValue");
const frictionValue = document.getElementById("frictionValue");
const parallelValue = document.getElementById("parallelValue");
const perpendicularValue = document.getElementById("perpendicularValue");
const accelerationValue = document.getElementById("accelerationValue");
const stateValue = document.getElementById("stateValue");

/*=========================================================
    Constants
=========================================================*/

const G = 9.81;
let MU_S = 0.40;
const MU_K = 0.20;

const FORCE_SCALE = 5.2;      // Double arrow length

/*=========================================================
    Canvas Variables
=========================================================*/

let W;
let H;
let scale;

/*=========================================================
    Plane
=========================================================*/

const plane={

    x:0,
    y:0,

    length:0,

    angle:0,

    rad:0,

    startX:0,
    startY:0,

    endX:0,
    endY:0

};

/*=========================================================
    Block
=========================================================*/

const block={

    distance:0,

    width:80,

    height:55,

    x:0,
    y:0,

    velocity:0,

    acceleration:0,

    sliding:false,

    finished:false

};

/*=========================================================
    Physics
=========================================================*/

const force={

    mass:2,

    W:0,

    N:0,

    Fr:0,

    mgSin:0,

    mgCos:0,

    resultant:0

};

/*=========================================================
    Time
=========================================================*/

let lastTime=0;

/*=========================================================
    Resize
=========================================================*/

function resizeCanvas(){

    canvas.width=canvas.clientWidth;
    canvas.height=canvas.clientHeight;

    W=canvas.width;
    H=canvas.height;

    scale=Math.min(W/1200,H/800);

    plane.length=W*0.72;

    plane.startX=W*0.14;
    plane.startY=H*0.78;

    block.width=85*scale;
    block.height=58*scale;

    updatePlane();

    updateBlockPosition();

}

/*=========================================================
    Plane Geometry
=========================================================*/

function updatePlane(){

    plane.rad = plane.angle * Math.PI / 180;

    /*-----------------------------
        Upper End
    -----------------------------*/

    plane.startX = W * 0.18;

    plane.startY = H * 0.25;

    /*-----------------------------
        Lower End
    -----------------------------*/

    plane.endX =
        plane.startX +
        plane.length *
        Math.cos(plane.rad);

    plane.endY =
        plane.startY +
        plane.length *
        Math.sin(plane.rad);

}

/*=========================================================
    Block Position
=========================================================*/

function updateBlockPosition(){

    block.x =
        plane.startX +
        block.distance *
        Math.cos(plane.rad);

    block.y =
        plane.startY +
        block.distance *
        Math.sin(plane.rad);

}

/*=========================================================
    Initial Position
=========================================================*/

function placeBlock(){

    block.distance=
        plane.length*0.20;

    updateBlockPosition();

}

/*=========================================================
    Utility
=========================================================*/

function clamp(v,min,max){

    return Math.max(min,Math.min(max,v));

}

function round(v){

    return v.toFixed(2);

}

/*=========================================================
    Events
=========================================================*/

window.addEventListener("resize",()=>{

    resizeCanvas();

});

angleSlider.addEventListener("input",()=>{

    if(block.sliding) return;

    plane.angle=
        Number(angleSlider.value);

    angleValue.textContent=
        plane.angle+"°";

    updatePlane();

    updateBlockPosition();

});

massSlider.addEventListener("input",()=>{

    force.mass=
        Number(massSlider.value);

    massValue.textContent=
        force.mass.toFixed(1)+" kg";

});

muSlider.addEventListener("input",()=>{

    MU_S = Number(muSlider.value);

    muValue.textContent = MU_S.toFixed(2);

    muDisplay.textContent = MU_S.toFixed(2);

});

resetBtn.addEventListener(
    "click",
    resetSimulation
);

/*=========================================================
    Physics Engine
=========================================================*/

function calculatePhysics(){

    /*-----------------------------
        Basic Forces
    -----------------------------*/

    force.W =
        force.mass * G;

    force.mgSin =
        force.W *
        Math.sin(plane.rad);

    force.mgCos =
        force.W *
        Math.cos(plane.rad);

    force.N =
        force.mgCos;

    /*-----------------------------
        Static Friction
    -----------------------------*/

    const maxStatic =
        MU_S * force.N;

    if(!block.sliding){

        if(force.mgSin <= maxStatic){

            force.Fr =
                force.mgSin;

            force.resultant = 0;

            block.acceleration = 0;

            stateValue.textContent =
                "Stationary (Static Friction)";

        }
        else{

            block.sliding = true;

            angleSlider.disabled = true;

        }

    }

    /*-----------------------------
        Kinetic Friction
    -----------------------------*/

    if(block.sliding){

        force.Fr =
            MU_K *
            force.N;

        force.resultant =
            force.mgSin -
            force.Fr;

        block.acceleration =
            force.resultant /
            force.mass;

        stateValue.textContent =
            "Sliding (Kinetic Friction)";

    }

}

/*=========================================================
    Motion Engine
=========================================================*/

function updateMotion(dt){

    if(!block.sliding) return;

    if(block.finished) return;

    block.velocity +=
        block.acceleration * dt;

    block.distance +=
        block.velocity*80*dt*scale;

    const limit =
        plane.length -
        block.width/2;

    if(block.distance >= limit){

        block.distance = limit;

        block.velocity = 0;

        block.acceleration = 0;

        force.resultant = 0;

        block.finished = true;

        stateValue.textContent =
            "Block Reached Bottom";

    }

    updateBlockPosition();

}

/*=========================================================
    Information Panel
=========================================================*/

function updateInformation(){

    weightValue.textContent =
        round(force.W) + " N";

    normalValue.textContent =
        round(force.N) + " N";

    frictionValue.textContent =
        round(force.Fr) + " N";

    parallelValue.textContent =
        round(force.mgSin) + " N";

    perpendicularValue.textContent =
        round(force.mgCos) + " N";

    accelerationValue.textContent =
        round(block.acceleration) +
        " m/s²";

    muDisplay.textContent = MU_S.toFixed(2);

}

/*=========================================================
    Update
=========================================================*/

function update(dt){

    calculatePhysics();

    updateMotion(dt);
    updateBlockPosition();

    updateInformation();

}

/*=========================================================
    Drawing Utilities
=========================================================*/

function drawArrow(x,y,dx,dy,color){

    const x2=x+dx;
    const y2=y+dy;

    const head = 18 * scale;

    const angle=Math.atan2(dy,dx);

    ctx.strokeStyle = "#222";
    ctx.fillStyle = color;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x2,y2);
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(x2,y2);

    ctx.lineTo(

        x2-head*Math.cos(angle-0.45),

        y2-head*Math.sin(angle-0.45)

    );

    ctx.lineTo(

        x2-head*Math.cos(angle+0.45),

        y2-head*Math.sin(angle+0.45)

    );

    ctx.closePath();
    ctx.stroke();
    ctx.fill();

}

/*=========================================================
    Force Arrow
=========================================================*/

function drawForce(
    x,
    y,
    angle,
    magnitude,
    colour,
    label,
    labelOffset=14
){

    let length=
        magnitude*
        FORCE_SCALE*
        scale;

    /*----------------------------
        Minimum visible length
    ----------------------------*/

    if(magnitude>0){

        length=Math.max(
            length,
            18*scale
        );

    }

    const dx=
        length*Math.cos(angle);

    const dy=
        length*Math.sin(angle);

    drawArrow(
        x,
        y,
        dx,
        dy,
        colour
    );

    ctx.fillStyle=colour;

    ctx.font=
        `${16*scale}px Arial`;

    ctx.textAlign="center";

    ctx.fillText(

        label,

        x+dx+
        labelOffset*
        Math.cos(angle),

        y+dy+
        labelOffset*
        Math.sin(angle)

    );

}

/*=========================================================
    Dashed Local Axis
=========================================================*/

function drawAxis(x1,y1,x2,y2){

    ctx.save();

    ctx.setLineDash([6,6]);

    ctx.strokeStyle = "#999999";

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(x1,y1);

    ctx.lineTo(x2,y2);

    ctx.stroke();

    ctx.restore();

}

/*=========================================================
    Centre of Mass
=========================================================*/

function drawCentre(){

    ctx.fillStyle="black";

    ctx.beginPath();

    ctx.arc(

        0,

        0,

        8*scale,

        0,

        Math.PI*2

    );

    ctx.fill();

}

/*=========================================================
    Draw Wooden Support
=========================================================*/

function drawSupport(){

    ctx.save();

    ctx.fillStyle="#d2b48c";

    ctx.beginPath();

    ctx.moveTo(
        plane.startX,
        plane.startY
    );

    ctx.lineTo(
        plane.endX,
        plane.endY
    );

    ctx.lineTo(
        plane.endX,
        plane.startY
    );

    ctx.closePath();

    ctx.globalAlpha=0.35;

    ctx.fill();

    ctx.restore();

}

/*=========================================================
    Draw Inclined Plane
=========================================================*/

function drawPlane(){

    ctx.save();

    ctx.strokeStyle="#555";

    ctx.lineWidth=10*scale;

    ctx.lineCap="round";

    ctx.beginPath();

    ctx.moveTo(
        plane.startX,
        plane.startY
    );

    ctx.lineTo(
        plane.endX,
        plane.endY
    );

    ctx.stroke();

    ctx.restore();

}

/*=========================================================
    Draw Block
=========================================================*/

function drawBlock(){

    ctx.save();

    ctx.translate(
        block.x,
        block.y
    );

    ctx.rotate(plane.rad);

    ctx.fillStyle="#4f8ef7";

    ctx.strokeStyle="#1f3f8f";

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.rect(

        -block.width/2,

        -block.height/2,

        block.width,

        block.height

    );

    ctx.fill();

    ctx.stroke();

    drawCentre();

    ctx.restore();

}

/*=========================================================
    Draw Local Coordinate Axes
=========================================================*/

function drawAxes(){

    ctx.save();

    ctx.translate(
        block.x,
        block.y
    );

    ctx.rotate(plane.rad);

    const L=140*scale;

    drawAxis(
        -L,
        0,
         L,
        0
    );

    drawAxis(
        0,
        -L,
        0,
         L
    );

    ctx.restore();

}

/*=========================================================
    Draw Angle Indicator
=========================================================*/

function drawAngle(){

    if(plane.angle<=0) return;

    ctx.save();

    ctx.translate(
        plane.startX,
        plane.startY
    );

    ctx.strokeStyle="#444";

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.arc(

        0,

        0,

        65*scale,

        0,

        plane.rad

    );

    ctx.stroke();

    ctx.fillStyle="#000";

    ctx.font=`bold ${34*scale}px Arial`;

    ctx.fillText(

        "θ",

        55*scale,

        -18*scale

    );

    ctx.restore();

}

/*=========================================================
    Force Scaling
=========================================================*/

function scaleForce(F){

    if(F<=0) return 0;

    // Larger arrows
    let L =
        40 +
        Math.sqrt(F) * 22;

    return clamp(
        L,
        40,
        240
    ) * scale;

}

/*=========================================================
    Relative Force Length
=========================================================*/

function getForceLength(F){

    if(force.W<=0) return 0;

    return scaleForce(force.W)
        *
        F
        /
        force.W;

}

/*=========================================================
    Draw Vector
=========================================================*/

function drawVector(

    x,
    y,

    angle,

    length,

    colour,

    label

){

    if(length<=0) return;

    const dx =
        length*Math.cos(angle);

    const dy =
        length*Math.sin(angle);

    drawArrow(

        x,

        y,

        dx,

        dy,

        colour

    );

    /*-----------------------------
        Label Position
    -----------------------------*/

    const gap = 28*scale;

    let lx =
        x +
        dx +
        gap*Math.cos(angle);

    let ly =
        y +
        dy +
        gap*Math.sin(angle);

    /*-----------------------------
        Small automatic offsets
    -----------------------------*/

    switch(label){

        case "W":

            lx+=12*scale;
            break;

        case "N":

            ly-=10*scale;
            break;

        case "fr":

            lx-=10*scale;
            break;

        case "mg sinθ":

            ly+=12*scale;
            break;

        case "mg cosθ":

            lx+=14*scale;
            break;

        case "ΣF":

            lx += 12*scale;
            ly -= 14*scale;
            break;

        case "a":

            lx+=10*scale;
            break;

    }

    ctx.fillStyle = colour;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    ctx.font = `bold ${28*scale}px Arial`;

    ctx.textAlign="center";

    ctx.textBaseline="middle";

    ctx.strokeText(
        label,
        lx,
        ly
    );

    ctx.fillText(
        label,
        lx,
        ly
    );

}

/*=========================================================
    Draw Free Body Diagram
=========================================================*/

function drawFreeBodyDiagram(){

    ctx.save();

    ctx.translate(
        block.x,
        block.y
    );

    ctx.rotate(plane.rad);

    /*----------------------------------------
        Force Lengths
    ----------------------------------------*/

    const Wlen     = scaleForce(force.W);
    const Nlen     = getForceLength(force.N);
    const Frlen    = getForceLength(force.Fr);
    const SinLen   = getForceLength(force.mgSin);
    const CosLen   = getForceLength(force.mgCos);
    const ResLen   = getForceLength(force.resultant);

    /*----------------------------------------
        mg sin θ
    ----------------------------------------*/

    if(plane.angle > 0){

        drawVector(

            0,
            0,

            0,

            SinLen,

            "#ff9800",

            "mg sinθ"

        );

    }

    /*----------------------------------------
        Friction
    ----------------------------------------*/

    if(plane.angle>0){

        drawVector(

            0,
            0,

            Math.PI,

            Frlen,

            "#FFD600",

            "fr"

        );

    }

    /*----------------------------------------
        mg cos θ
    ----------------------------------------*/

    if(plane.angle > 0){

        drawVector(

            0,
            0,

            Math.PI/2,

            CosLen,

            "#9c27b0",

            "mg cosθ"

        );

    }

    /*----------------------------------------
        Normal
    ----------------------------------------*/

    drawVector(

        0,
        0,

        -Math.PI/2,

        Nlen,

        "#0066ff",

        "N"

    );

    /*----------------------------------------
        Resultant Force
        (Drawn beside the block)
    ----------------------------------------*/

    if(block.sliding){

        // Offset away from the block so it does not overlap
        const offsetX = 0;
        const offsetY = -70 * scale;
        
        ctx.save();

        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.setLineDash([6,6]);

        ctx.beginPath();

        ctx.moveTo(0,0);
        ctx.lineTo(offsetX,offsetY);

        ctx.stroke();

        ctx.restore();

        drawVector(

            offsetX,
            offsetY,

            0,

            ResLen,

            "#000000",

            "ΣF"

        );

    }

    drawCentre();

    ctx.restore();

    /*----------------------------------------
        Weight
        (Always Vertical)
    ----------------------------------------*/

    drawVector(

        block.x,

        block.y,

        Math.PI/2,

        Wlen,

        "#d32f2f",

        "W"

    );

}

/*=========================================================
    Draw Theta Between W and mg cosθ
=========================================================*/

/*=========================================================
    Draw θ Between W and mg cosθ
=========================================================*/

function drawForceAngle(){

    if(plane.angle <= 0) return;

    const r = 52 * scale;

    // Direction of Weight (world)
    const weightAngle = Math.PI / 2;

    // Direction of mg cosθ (world)
    const normalAngle = plane.rad + Math.PI / 2;

    ctx.save();

    ctx.translate(block.x, block.y);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3;

    ctx.beginPath();

    // Draw arc from W to mg cosθ
    ctx.arc(
        0,
        0,
        r,
        weightAngle,
        normalAngle,
        false
    );

    ctx.stroke();

    // Mid-angle for θ label
    const mid =
        (weightAngle + normalAngle) / 2;

    ctx.fillStyle = "#111";

    ctx.font = `bold ${26*scale}px Arial`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "θ",
        (r + 18*scale) * Math.cos(mid),
        (r + 18*scale) * Math.sin(mid)
    );

    ctx.restore();

}

/*=========================================================
    Draw Acceleration
=========================================================*/

function drawAcceleration(){

    if(!block.sliding) return;

    const offset =
        70*scale;

    const x =
        block.x +
        offset*Math.cos(plane.rad);

    const y =
        block.y -
        offset*Math.sin(plane.rad);

    drawVector(

        x,

        y,

        plane.rad,

        90*scale,

        "#00aa00",

        "a"

    );

}

/*=========================================================
    Draw Background Grid
=========================================================*/

function drawGrid(){

    ctx.save();

    ctx.strokeStyle="#eeeeee";
    ctx.lineWidth=1;

    const step=40*scale;

    for(let x=0;x<=W;x+=step){

        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,H);
        ctx.stroke();

    }

    for(let y=0;y<=H;y+=step){

        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(W,y);
        ctx.stroke();

    }

    ctx.restore();

}

/*=========================================================
    Draw Scene
=========================================================*/

function drawScene(){

    ctx.clearRect(0,0,W,H);

    drawGrid();

    drawSupport();

    drawPlane();

    drawAngle();

    drawAxes();

    drawBlock();

    drawFreeBodyDiagram();

    drawForceAngle();

    drawAcceleration();

}

/*=========================================================
    Animation Loop
=========================================================*/

function animate(time){

    if(lastTime===0){

        lastTime=time;

    }

    let dt=(time-lastTime)/1000;

    lastTime=time;

    dt=Math.min(dt,0.03);

    update(dt);

    drawScene();

    requestAnimationFrame(animate);

}

/*=========================================================
    Reset
=========================================================*/

function resetSimulation(){

    block.sliding=false;

    block.finished=false;

    block.velocity=0;

    block.acceleration=0;

    plane.angle=0;

    plane.rad=0;

    angleSlider.value=0;

    angleSlider.disabled=false;

    angleValue.textContent="0°";

    updatePlane();

    placeBlock();

    calculatePhysics();

    updateInformation();

}

/*=========================================================
    Initialisation
=========================================================*/

function initialise(){

    resizeCanvas();

    force.mass=
        Number(massSlider.value);

    plane.angle=
        Number(angleSlider.value);

    angleValue.textContent=
        plane.angle+"°";

    massValue.textContent=
        force.mass.toFixed(1)+" kg";

    muValue.textContent = MU_S.toFixed(2);

    if(muSlider){
        muSlider.value = MU_S;
    }

    updatePlane();

    placeBlock();

    calculatePhysics();

    updateInformation();

    drawScene();

}

/*=========================================================
    Start Simulation
=========================================================*/

initialise();

requestAnimationFrame(animate);