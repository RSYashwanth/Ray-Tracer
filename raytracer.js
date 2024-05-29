import { VectorUtils, Scene, Ray, Material, Sphere, Camera } from "./utility.js";
import { createControls } from "./ui.js";

let canvas = document.getElementById("view");
let context = canvas.getContext("2d")

let width = canvas.width;
let height = canvas.height;

let scene = new Scene();

// Listener to add more spheres when add objects button is clicked
let addBtn = document.getElementById("add");
addBtn.onclick = () => {
    let sphere = new Sphere();
    createControls(sphere);
    scene.add(sphere);
    addBtn.blur();
}


// Create camera
let camera = new Camera({fov: 40 * width / 50});

// Define number of samples to be rendered
let samples = 100;
let sampleRange = document.getElementById("sample");
let sampleLabel = document.getElementById("sample-label");
sampleLabel.textContent = 100;
sampleRange.onmousemove = () => {
    samples = sampleRange.value;
    sampleLabel.textContent = samples;
}


// Recursive ray tracing function
function trace(ray, bounce) {
    let light = {
        x: 0,
        y: 0,
        z: 0
    }

    // Base Case
    if (bounce <= 0) {
        return light;
    }
    // Recursive Case
    else{
        // Find closest object that the ray intersected
        let collisionInfo = null;
        scene.getObjects().forEach((object) => {
            let current = object.calcHit(ray);
            if(current.intersect) {
                if(collisionInfo == null || collisionInfo.distance >= current.distance) {
                    collisionInfo = current;
                }
            }
        });

        // If collision doesn't occur, return environment light
        if (!collisionInfo || !collisionInfo.intersect) {
            return light;
        }

        // Else calculate pixel color based on material properties and further light bounces
        let emission = VectorUtils.scalarMult(collisionInfo.obj.material.emissiveColor, collisionInfo.obj.material.emissiveStrength);
        let color = collisionInfo.obj.material.color;

        let incomingRay = calculateRayFrom(ray, collisionInfo)

        let incomingLight = trace(incomingRay, bounce - 1);

        return VectorUtils.add(emission, VectorUtils.mult(color, incomingLight));
    }
}

// Calculate the reflected angle of the ray based on roughness and collision
function calculateRayFrom(ray, collisionInfo) {
    // Calculate the exact reflection angle
    let reflectDirection = VectorUtils.sub(ray.direction, VectorUtils.scalarMult(collisionInfo.normal, 2 * VectorUtils.dotProduct(ray.direction, collisionInfo.normal)));

    // Offset this direction in proportion to roughness to account for glossy and rough surfaces
    reflectDirection = {
        x: reflectDirection.x + (Math.random() * 2 - 1) * collisionInfo.obj.material.roughness / 2,
        y: reflectDirection.y + (Math.random() * 2 - 1) * collisionInfo.obj.material.roughness / 2,
        z: reflectDirection.z + (Math.random() * 2 - 1) * collisionInfo.obj.material.roughness / 2,
    }

    // If angle is greater than 90 with the normal, reverse the direction of the ray
    let angleCheck = VectorUtils.dotProduct(reflectDirection, collisionInfo.normal);
    let s = 1;
    if(angleCheck < 0) {
        s = -1;
    }
    reflectDirection = VectorUtils.scalarMult(reflectDirection, s);

    return new Ray(collisionInfo.position, reflectDirection);
}

// Calculate initial ray from the camera based on camera properties and pixel
function calculateCameraRay(x, y, camera) {
    let i = x - width / 2
    let j = y - height / 2
    return new Ray(camera.position, VectorUtils.rotateVector(VectorUtils.normalize({x: i, y: j, z: camera.fov}), camera.rotation));
}

// Render function to use the ray tracer
function rayTraceRender() {
    let imageData = context.createImageData(width, height);
    let data = imageData.data;
    for(let s = 1; s <= samples; s++) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                
                let ray = calculateCameraRay(x, y, camera);
                let color = trace(ray, 10);

                let index = (y * width + x) * 4;

                data[index] += color.x / samples
                data[index + 1] += color.y / samples
                data[index + 2] += color.z / samples
                data[index + 3] = 255
            }
        }
        console.clear();
        console.log(s + " / " + samples);
    }
    context.putImageData(imageData, 0, 0);
}

// Simpler trace function, used when modifying material properties to have a lower impact on performance
function simpleTrace() {
    let imageData = context.createImageData(width, height);
    let data = imageData.data;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let ray = calculateCameraRay(x, y, camera);

            let collisionInfo = null;
            scene.getObjects().forEach((object) => {
                let current = object.calcHit(ray);
                if(current.intersect) {
                    if(collisionInfo == null || collisionInfo.distance >= current.distance) {
                        collisionInfo = current;
                    }
                }
            });
        
            if(collisionInfo == null) {

            }
            else {
                // Only process one bounce of ray and color it with the objects color directly 
                let color = collisionInfo.obj.material.color;
                let red = color.x * 255;
                let green = color.y * 255;
                let blue = color.z * 255;

                const index = (y * width + x) * 4;

                data[index] = red;
                data[index + 1] = green;    
                data[index + 2] = blue;  
                data[index + 3] = 255;  
            }
        }
    }

    context.putImageData(imageData, 0, 0);
}

let lastFrameTime = performance.now();
let currentFps = 0;
let count = 0;

// Calculate and draw fps in viewport mode
function drawFps() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    context.font = "14px Arial";
    
    if(count%5 == 0) {
        context.fillStyle = "orange";
        currentFps = Math.round(1000/deltaTime);
        context.fillText(currentFps, 10, 20);
        count == 0;
    }
    else {
        context.fillStyle = "orange";
        context.fillText(Math.round(currentFps), 10, 20);
    }

    count += 1;
}

// Listener to render the image and stop movement triggers from activating during rendering
let renderBtn = document.getElementById("render");
renderBtn.onclick =(e) => {
    render = !render;
    if(!render) {
        requestAnimationFrame(update);
    }
    renderBtn.blur();
};

let render = false;

// Viewport mode update function to keep moving
function update() {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // If rendering, render and dont move or update frames
    if(render) {
        rayTraceRender();
    }
    // Else use viewport mode rendering and move and draw frames and fps
    else {
        simpleTrace();
        camera.move();
        
        drawFps();

        requestAnimationFrame(update);
    }

}
requestAnimationFrame(update);