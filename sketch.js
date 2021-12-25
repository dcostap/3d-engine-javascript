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

function dot_product(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function cross_product(v1, v2) {
    return new Vector(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x,
    );
}

class Mesh {
    position = new Vector();
    rotation = new Vector();
    triangles = [];

    constructor(...triangles) {
        this.triangles.push(...triangles)
    }

    apply_transformations() {
        const cosa = Math.cosDeg(this.rotation.y);
        const sina = Math.sinDeg(this.rotation.y);

        const cosb = Math.cosDeg(this.rotation.x);
        const sinb = Math.sinDeg(this.rotation.x);

        const cosc = Math.cosDeg(this.rotation.z);
        const sinc = Math.sinDeg(this.rotation.z);

        const Axx = cosa * cosb;
        const Axy = cosa * sinb * sinc - sina * cosc;
        const Axz = cosa * sinb * cosc + sina * sinc;

        const Ayx = sina * cosb;
        const Ayy = sina * sinb * sinc + cosa * cosc;
        const Ayz = sina * sinb * cosc - cosa * sinc;

        const Azx = -sinb;
        const Azy = cosb * sinc;
        const Azz = cosb * cosc;

        for (let triangle of this.triangles) {
            for (let pairs of [[triangle.v1, triangle.trans_v1], [triangle.v2, triangle.trans_v2], [triangle.v3, triangle.trans_v3]]) {
                let vertex = pairs[0];
                let transformed_vertex = pairs[1];
                const px = vertex.x;
                const py = vertex.y;
                const pz = vertex.z;

                transformed_vertex.x = Axx * px + Axy * py + Axz * pz;
                transformed_vertex.y = Ayx * px + Ayy * py + Ayz * pz;
                transformed_vertex.z = Azx * px + Azy * py + Azz * pz;

                transformed_vertex.x += this.position.x;
                transformed_vertex.y += this.position.y;
                transformed_vertex.z += this.position.z;
            }
        }
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
    constructor(v1, v2, v3) {
        this.v1 = v1 ? v1 : new Vector();
        this.v2 = v2 ? v2 : new Vector();
        this.v3 = v3 ? v3 : new Vector();

        this.trans_v1 = new Vector();
        this.trans_v2 = new Vector();
        this.trans_v3 = new Vector();
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
        mesh.position.z += 120;
    }
}

function draw() {
    background(220);

    for (let mesh of meshes) {
        // mesh.position.z += 1;
        // mesh.position.x += 1;
        mesh.rotation.y += 0.6;
        mesh.rotation.x += 0.6;
        mesh.rotation.z += 0.6;

        mesh.apply_transformations();
        for (let triangle of mesh.triangles) {
            project_triangle(triangle);
            // if (proj.v1.z > z_near && proj.v2.z > z_near && proj.v3.z > z_near)
            draw_triangle(triangle);
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
    vertex(triangle.trans_v1.x, height - triangle.trans_v1.y);
    vertex(triangle.trans_v2.x, height - triangle.trans_v2.y);
    vertex(triangle.trans_v3.x, height - triangle.trans_v3.y);
    vertex(triangle.trans_v1.x, height - triangle.trans_v1.y);
    endShape();
}

const to_radians = function (degrees) {
    return degrees * Math.PI / 180;
}

const to_degrees = function (radians) {
    return radians * 180 / Math.PI;
}

function project_triangle(triangle) {
    project_vertex(triangle.trans_v1);
    project_vertex(triangle.trans_v2);
    project_vertex(triangle.trans_v3);
}

Math.cosDeg = function (angle) {
    return Math.cos(to_radians(angle));
}

Math.sinDeg = function (angle) {
    return Math.sin(to_radians(angle));
}

function project_vertex(vertex) {
    // project from screen units to -1 -> 1
    vertex.x /= width;
    vertex.y /= height;

    vertex.z /= z_far - z_near;
    // vertex.z += 1;

    // inverse tangent of half of FOV
    let f = 1 / Math.tan(to_radians(fov / 2.0));
    let q = z_far / (z_far - z_near);

    let orig_z = vertex.z;

    vertex.x = aspect_ratio * f * vertex.x;
    vertex.y = f * vertex.y;
    vertex.z = vertex.z * (q - (q * z_near));

    if (vertex.z != 0) {
        vertex.x /= orig_z;
        vertex.y /= orig_z;
    }

    vertex.x *= width;
    vertex.y *= height;

    // view is centered,
    // objects at (0, 0) are in the middle if camera is in (0, 0)
    vertex.x += width / 2;
    vertex.y += height / 2;
}
