let width = 400;
let height = 400;
let aspect_ratio = height / width;
let fov = 90;
let z_near = 10;
let z_far = 400;

class Vector {
    x;
    y;
    z;

    constructor(x, y, z) {
        this.x = x ? x : 0.0;
        this.y = y ? y : 0.0;
        this.z = z ? z : 0.0;
    }
}

class Mesh {
    position = new Vector();
    rotation = new Vector();
    triangles = [];

    constructor(...triangles) {
        this.triangles.push(...triangles)
    }

    set_origin_to_center() {
        let min_x = null; let max_x = null;
        let min_y = null; let max_y = null;
        let min_z = null; let max_z = null;

        for (let triangle of this.triangles) {
            for (let vector of [triangle.v1, triangle.v2, triangle.v3]) {
                if (vector.x > max_x || max_x == null) max_x = vector.x
                if (vector.x < min_x || min_x == null) min_x = vector.x

                if (vector.y > max_y || max_y == null) max_y = vector.y
                if (vector.y < min_y || min_y == null) min_y = vector.y

                if (vector.z > max_z || max_z == null) max_z = vector.z
                if (vector.z < min_z || min_z == null) min_z = vector.z
            }
        }

        for (let triangle of this.triangles) {
            for (let vector of [triangle.v1, triangle.v2, triangle.v3]) {
                vector.x -= (max_x - min_x) / 2.0;
                vector.y -= (max_y - min_y) / 2.0;
                vector.z -= (max_z - min_z) / 2.0;
            }
        }
    }
}

class Triangle {
    v1;
    v2;
    v3;

    constructor(v1, v2, v3) {
        this.v1 = v1 ? v1 : new Vector();
        this.v2 = v2 ? v2 : new Vector();
        this.v3 = v3 ? v3 : new Vector();
    }
}

function plane_to_triangles(v1, v2, v3, v4) {
    return [
        new Triangle(v1, v2, v4),
        new Triangle(v2, v3, v4)
    ]
}

function make_cube(size) {
    const mesh = new Mesh(
        // front face
        ...plane_to_triangles(
            new Vector(0, 0, 0),
            new Vector(0, size, 0),
            new Vector(size, size, 0),
            new Vector(size, 0, 0)
        ),

        // back face
        ...plane_to_triangles(
            new Vector(0, 0, size),
            new Vector(0, size, size),
            new Vector(size, size, size),
            new Vector(size, 0, size)
        ),

        // right face
        ...plane_to_triangles(
            new Vector(size, 0, 0),
            new Vector(size, size, 0),
            new Vector(size, size, size),
            new Vector(size, 0, size)
        ),

        // left face
        ...plane_to_triangles(
            new Vector(0, 0, 0),
            new Vector(0, size, 0),
            new Vector(0, size, size),
            new Vector(0, 0, size)
        ),

        // top face
        ...plane_to_triangles(
            new Vector(0, size, 0),
            new Vector(0, size, size),
            new Vector(size, size, size),
            new Vector(size, size, 0)
        ),

        // bottom face
        ...plane_to_triangles(
            new Vector(0, 0, 0),
            new Vector(0, 0, size),
            new Vector(size, 0, size),
            new Vector(size, 0, 0)
        ),
    );

    // mesh.set_origin_to_center();

    return mesh;
}

let meshes = [
    make_cube(50)
]

function setup() {
    createCanvas(width, height);

    for (let mesh of meshes) {
        // mesh.position.z += 10;
    }
}

function draw() {
    background(220);

    for (let mesh of meshes) {
        mesh.position.z += 1;
        // mesh.position.x += 1;
        // mesh.rotation.y += 0.4;
        for (let triangle of mesh.triangles) {
            let proj = project_triangle(mesh, triangle);
            // if (proj.v1.z > z_near && proj.v2.z > z_near && proj.v3.z > z_near)
                draw_triangle(proj);
        }
    }
}

function draw_triangle(triangle) {
    noStroke();
    beginShape();

    //fill(237, 34, 93);
    noFill();
    stroke(237, 34, 93);
    strokeWeight(2);
    vertex(triangle.v1.x, height - triangle.v1.y);
    vertex(triangle.v2.x, height - triangle.v2.y);
    vertex(triangle.v3.x, height - triangle.v3.y);
    vertex(triangle.v1.x, height - triangle.v1.y);
    endShape();
}

const to_radians = function (degrees) {
    return degrees * Math.PI / 180;
}

const to_degrees = function (radians) {
    return radians * 180 / Math.PI;
}

function project_triangle(mesh, triangle) {
    let result = new Triangle();

    result.v1 = project_vertex(mesh, triangle.v1);
    result.v2 = project_vertex(mesh, triangle.v2);
    result.v3 = project_vertex(mesh, triangle.v3);

    return result;
}

Math.cosDeg = function (angle) {
    return Math.cos(to_radians(angle));
}

Math.sinDeg = function (angle) {
    return Math.sin(to_radians(angle));
}

function project_vertex(mesh, vertex) {
    let result = new Vector();

    let transformed_x = vertex.x * Math.cosDeg(mesh.rotation.y) - vertex.z * Math.sinDeg(mesh.rotation.y);
    let transformed_y = vertex.y;
    let transformed_z = vertex.z * Math.cosDeg(mesh.rotation.y) + vertex.x * Math.sinDeg(mesh.rotation.y)

    transformed_x += mesh.position.x;
    transformed_y += mesh.position.y;
    transformed_z += mesh.position.z;

    // project from screen units to -1 -> 1
    transformed_x /= width;
    transformed_y /= height;

    // transformed_x *= 2; transformed_y *= 2;
    // transformed_x -= 1; transformed_y -= 1;

    transformed_z /= z_far - z_near;
    // transformed_z += 1;

    // inverse tangent of half of FOV
    let f = 1 / Math.tan(to_radians(fov / 2.0));
    let q = z_far / (z_far - z_near);

    result.x = aspect_ratio * f * transformed_x;
    console.log(transformed_x);
    result.y = f * transformed_y;
    result.z = transformed_z * (q - (q * z_near));

    if (transformed_z != 0) {
        result.x /= transformed_z;
        result.y /= transformed_z;
    }

    // result.x += 1;
    // result.y += 1;

    // result.x /= 2;
    // result.y /= 2;

    result.x *= width;
    result.y *= height;

    // view is centered,
    // objects at (0, 0) are in the middle if camera is in (0, 0)
    result.x += width / 2;
    result.y += height / 2;

    return result;
}
