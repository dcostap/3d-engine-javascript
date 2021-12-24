let width = 400;
let height = 400;
let aspect_ratio = height / width;
let fov = 100;
let z_near = 10;
let z_far = 100;

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
        new Triangle(v4, v2, v3)
    ]
}

function make_cube(size) {
    return new Mesh(
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
    )
}

let meshes = [
    make_cube(400)
]

function setup() {
    createCanvas(width, height);
}

function draw() {
    background(220);

    for (let mesh of meshes) {
        // mesh.rotation.y += 1
        mesh.position.z += 1
        for (let triangle of mesh.triangles) {
            let proj = project_triangle(mesh, triangle);
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
    vertex(triangle.v1.x, triangle.v1.y);
    vertex(triangle.v2.x, triangle.v2.y);
    vertex(triangle.v3.x, triangle.v3.y);
    vertex(triangle.v1.x, triangle.v1.y);
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

function project_vertex(mesh, vertex) {
    result = new Vector();

    let transformed_x = vertex.x //* Math.cos(to_radians(mesh.rotation.y));
    let transformed_y = vertex.y //* Math.cos(to_radians(mesh.rotation.x));
    let transformed_z = vertex.z //* Math.sin(to_radians(mesh.rotation.y)) * Math.sin(to_radians(mesh.rotation.x));

    // transformed_x += mesh.position.x;
    // transformed_y += mesh.position.y;
    // transformed_z += mesh.position.z;

    // project from screen units to -1 -> 1
    // transformed_x /= width;
    // transformed_y /= height;

    // transformed_x *= 2; transformed_y *= 2;
    // transformed_x -= 1; transformed_y -= 1;

    // inverse tangent of half of FOV
    let f = 1 / Math.tan(to_radians(fov / 2.0));
    let q = z_far / (z_far - z_near);

    result.x = aspect_ratio * f * transformed_x;
    result.y = aspect_ratio * f * transformed_y;
    result.z = (q * transformed_z) - (q * z_near);

    if (transformed_z != 0) {
        result.x /= transformed_z;
        result.y /= transformed_z;
    }

    // result.x += 1;
    // result.y += 1;

    // result.x *= width;
    // result.y *= height;

    return result;
}