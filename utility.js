// Vector Utils
export class VectorUtils {

    // Returns magnitude of a given vector
    static magnitude(v1) {
        return Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    }

    // Normalizes any given vector
    static normalize(v) {
        return {
            x: v.x / this.magnitude(v),
            y: v.y / this.magnitude(v),
            z: v.z / this.magnitude(v)
        }
    }

    // Adds the components of 2 vectors individually
    static add(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }

    // Subtracts the components of 2 vectors individually
    static sub(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    }

    // Multiplies the componenents of 2 vectors individually
    static mult(v1, v2) {
        return {
            x: v1.x * v2.x,
            y: v1.y * v2.y,
            z: v1.z * v2.z
        };
    }

    // Scales the given vector by a scalar quantity
    static scalarMult(v, s) {
        return {
            x: v.x * s,
            y: v.y * s,
            z: v.z * s
        };
    }

    // Returns the dot product of 2 vectors
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    // Rotates an input vector by a rotation using a rotation matrix
    static rotateVector(vector, rotation) {
        let { x, y, z } = vector;
        let { x: alpha, y: beta, z: gamma } = rotation;
    
        let rotatedX = x * Math.cos(gamma) * Math.cos(beta) +
                         y * (Math.cos(gamma) * Math.sin(beta) * Math.sin(alpha) - Math.sin(gamma) * Math.cos(alpha)) +
                         z * (Math.cos(gamma) * Math.sin(beta) * Math.cos(alpha) + Math.sin(gamma) * Math.sin(alpha));
    
        let rotatedY = x * Math.sin(gamma) * Math.cos(beta) +
                         y * (Math.sin(gamma) * Math.sin(beta) * Math.sin(alpha) + Math.cos(gamma) * Math.cos(alpha)) +
                         z * (Math.sin(gamma) * Math.sin(beta) * Math.cos(alpha) - Math.cos(gamma) * Math.sin(alpha));
    
        let rotatedZ = -x * Math.sin(beta) +
                         y * Math.cos(beta) * Math.sin(alpha) +
                         z * Math.cos(beta) * Math.cos(alpha);
    
        return { 
            x: rotatedX, 
            y: rotatedY, 
            z: rotatedZ 
        };
    }
}

// Ray
export class Ray {
    constructor(position, direction) {
        this.position = position;
        this.direction = direction;
    }
}

// Scene
export class Scene {
    constructor() {
        this.objectList = [];
    }

    add(obj) {
        this.objectList.push(obj);
    }

    getObjects() {
        return this.objectList;
    }
}

let sphereCount = 0;
// Geometry
export class Sphere {
    constructor(params) {
        if(!params) params = {};
        this.material = params.material? params.material : new Material();
        this.radius = params.radius? params.radius : 1;
        this.position = params.position? params.position : {x: 0, y: 0, z: 0};
        this.id = sphereCount++;
    }

    calcHit(ray) {
        // Vector from ray origin to center of sphere
        let vecToCenter = VectorUtils.sub(this.position, ray.position);

        // Magnitude of the calculated vector
        let distToCenter = VectorUtils.magnitude(vecToCenter);

        // Magnitude of projection of origin-center ray on ray's direction
        let projected = VectorUtils.dotProduct(vecToCenter, ray.direction);

        // Distance from origin of ray to the surface of sphere along the ray direction (Pythagoras)
        let distToSurface = projected - Math.sqrt(Math.abs(this.radius ** 2 - distToCenter ** 2 + projected ** 2));

        // Consider ray intersected only if intersection is in front of camera and if the hit point is within the sphere
        let hasHit = (projected >=  0) && ((distToCenter ** 2 - projected ** 2) <= this.radius ** 2);

        // Calculate point of intersection
        let hitPoint = VectorUtils.add(ray.position, VectorUtils.scalarMult(ray.direction, distToSurface));

        // Calculate normals
        let normal = VectorUtils.normalize(VectorUtils.sub(hitPoint, this.position))

        return {
             intersect: hasHit, 
             distance: distToSurface, 
             position: hitPoint, 
             normal: normal, 
             obj: this 
        };
    }
}

// Material
export class Material {
    constructor(params) {
        if(!params) params = {};
        this.color = params.color? params.color : {x: 1, y: 1, z: 1};
        this.emissiveColor = params.emissiveColor? params.emissiveColor : {x: 0, y: 0, z: 0};
        this.emissiveStrength = params.emissiveStrength? params.emissiveStrength : 0;
        this.roughness = params.roughness? params.roughness : 1;
    }
}

// Camera
export class Camera {
    constructor(params) {
        this.position = params.position? params.position : {x: 0, y: 0, z: -10};
        this.rotation = params.rotation? params.rotation : {x: 0, y: 0, z: 0};
        this.fov = params.fov? params.fov : 200;

        this.sensitivity = params.sensitivity? params.sensitivity : 0.5;

        // Camera movement
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.w = false;
        this.a = false;
        this.s = false;
        this.d = false;
        this.space = false;
        this.shift = false;

        this.setupCameraListeners();
    }

    setupCameraListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                this.left = true;
                this.right = false;
            }
            if (event.key === 'ArrowRight') {
                this.right = true;
                this.left = false;
            }
            if (event.key === 'ArrowUp') {
                this.up = true;
                this.down = false;
            }
            if (event.key === 'ArrowDown') {
                this.down = true;
                this.up = false;
            }
            if(event.key === 'w') {
                this.w = true;
                this.s = false;
            }
            if(event.key === 'a') {
                this.a = true;
                this.d = false;
            }
            if(event.key === 's') {
                this.s = true;
                this.w = false;
            }
            if(event.key === 'd') {
                this.d = true;
                this.a = false;
            }
            if(event.key === ' ') {
                this.space = true;
                this.shift = false;
            }
            if(event.key === 'Shift') {
                this.shift = true;
                this.space = false;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft') {
                this.left = false;
            }
            if (event.key === 'ArrowRight') {
                this.right = false;
            }
            if (event.key === 'ArrowUp') {
                this.up = false;
            }
            if (event.key === 'ArrowDown') {
                this.down = false;
            }
            if(event.key === 'w') {
                this.w = false;
            }
            if(event.key === 'a') {
                this.a = false;
            }
            if(event.key === 's') {
                this.s = false;
            }
            if(event.key === 'd') {
                this.d = false;
            }
            if(event.key === ' ') {
                this.space = false;
            }
            if(event.key === 'Shift') {
                this.shift = false;
            }
        });
    }

    move() {
        if(this.left) {
            this.rotation.y -= 0.1 * this.sensitivity;
        }
        if(this.right) {
            this.rotation.y += 0.1 * this.sensitivity;
        }
        if(this.up) {
            this.rotation.x += 0.1 * this.sensitivity;
        }
        if(this.down) {
            this.rotation.x -= 0.1 * this.sensitivity;
        }
        if(this.w) {
            const direction = {
                x: Math.sin(this.rotation.y),
                y: Math.cos(this.rotation.y) * Math.sin(this.rotation.z),
                z: Math.cos(this.rotation.y) * Math.cos(this.rotation.z)
            };

            this.position = VectorUtils.add(this.position, VectorUtils.scalarMult(direction, this.sensitivity));
        }
        if(this.a) {
            const direction = {
                x: Math.sin(this.rotation.y + Math.PI/2),
                y: Math.cos(this.rotation.y + Math.PI/2) * Math.sin(this.rotation.z),
                z: Math.cos(this.rotation.y + Math.PI/2) * Math.cos(this.rotation.z)
            };

            this.position = VectorUtils.sub(this.position, VectorUtils.scalarMult(direction, this.sensitivity));
        }
        if(this.s) {
            const direction = {
                x: Math.sin(this.rotation.y),
                y: Math.cos(this.rotation.y) * Math.sin(this.rotation.z),
                z: Math.cos(this.rotation.y) * Math.cos(this.rotation.z)
            };

            this.position = VectorUtils.sub(this.position, VectorUtils.scalarMult(direction, this.sensitivity));
        }
        if(this.d) {
            const direction = {
                x: Math.sin(this.rotation.y + Math.PI/2),
                y: Math.cos(this.rotation.y + Math.PI/2) * Math.sin(this.rotation.z),
                z: Math.cos(this.rotation.y + Math.PI/2) * Math.cos(this.rotation.z)
            };

            this.position = VectorUtils.add(this.position, VectorUtils.scalarMult(direction, this.sensitivity));
        }
        if(this.space) {
            this.position.y -= this.sensitivity;
        }
        if(this.shift) {
            this.position.y += this.sensitivity;
        }
    }
}