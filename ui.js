export function createControls(sphere) {
    let controlsDiv = document.createElement('div');
    controlsDiv.style.margin = '20px';

    let sphereDiv = document.createElement('div');
    sphereDiv.classList.add('control-element');

    let materialDiv = document.createElement('div');
    materialDiv .classList.add('control-element');

    let id = sphere.id;

    controlsDiv.appendChild(sphereDiv);
    controlsDiv.appendChild(materialDiv);

    let positionXInput = createTextInput('Position X ', 'positionX'+id, 0);
    let positionYInput = createTextInput('Position Y ', 'positionY'+id, 0);
    let positionZInput = createTextInput('Position Z ', 'positionZ'+id, 0);
    let radiusInput = createTextInput('Radius ', 'radius'+id, 3);

    let colorInput = createColorInput('Base Color ', 'color'+id, '#ff0000');
    let emissiveColorInput = createColorInput('Emissive Color ', 'eColor'+id, '#000000');
    let emissiveStrengthInput = createTextInput(' Emissive Strength ', 'eStrength'+id, 0);
    let roughnessInput = createTextInput(' Roughness ', 'roughness'+id, 1);

    positionXInput.onchange = (() => updateSphere(sphere));
    positionYInput.onchange = (() => updateSphere(sphere));
    positionZInput.onchange = (() => updateSphere(sphere));
    radiusInput.onchange = (() => updateSphere(sphere));

    colorInput.onchange = (() => updateSphere(sphere));
    emissiveColorInput.onchange = (() => updateSphere(sphere));
    emissiveStrengthInput.onchange = (() => updateSphere(sphere));
    roughnessInput.onchange = (() => updateSphere(sphere));

    sphereDiv.appendChild(positionXInput);
    sphereDiv.appendChild(positionYInput);
    sphereDiv.appendChild(positionZInput);
    sphereDiv.appendChild(radiusInput);

    materialDiv.appendChild(colorInput);
    materialDiv.appendChild(roughnessInput);
    materialDiv.appendChild(emissiveColorInput);
    materialDiv.appendChild(emissiveStrengthInput);

    controlsDiv.classList.add("sphere-control");

    let editDiv = document.getElementById("editing");
    editDiv.appendChild(controlsDiv);

    updateSphere(sphere);
}

function createTextInput(labelText, id, defaultValue) {
    let label = document.createElement('label');
    label.textContent = labelText;

    let input = document.createElement('input');
    input.id = id;
    input.type = 'number';
    input.value = defaultValue;
    input.style.marginRight = '10px';
    input.classList.add('controls-input');

    label.appendChild(input);
    return label;
}

function createColorInput(labelText, id, defaultValue) {
    let label = document.createElement('label');
    label.textContent = labelText;

    let colorPicker = document.createElement('input');
    colorPicker.id = id;
    colorPicker.type = 'color';
    colorPicker.value = defaultValue;

    label.appendChild(colorPicker);
    return label;
}

function updateSphere(sphere) {
    let id = sphere.id;

    let positionX = parseFloat(document.getElementById('positionX'+id).value);
    let positionY = parseFloat(document.getElementById('positionY'+id).value);
    let positionZ = parseFloat(document.getElementById('positionZ'+id).value);
    let radius = parseFloat(document.getElementById('radius'+id).value);

    let color = hexToRgb(document.getElementById('color'+id).value);
    let emissiveColor = hexToRgb(document.getElementById('eColor'+id).value);
    let emissiveStrength = parseFloat(document.getElementById('eStrength'+id).value);
    let roughness = parseFloat(document.getElementById('roughness'+id).value);

    sphere.position.x = positionX;
    sphere.position.y = positionY;
    sphere.position.z = positionZ;

    sphere.radius = radius;

    sphere.material.color = { x: color.r/255, y: color.g/255, z: color.b/255 };
    sphere.material.roughness = roughness;

    sphere.material.emissiveColor = { x: emissiveColor.r, y: emissiveColor.g, z: emissiveColor.b };
    sphere.material.emissiveStrength = emissiveStrength;
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');

    let int = parseInt(hex, 16);
    let red = (int >> 16) & 255;
    let green = (int >> 8) & 255;
    let blue = int & 255;

    return { 
        r: red, 
        g: green, 
        b: blue 
    };
}