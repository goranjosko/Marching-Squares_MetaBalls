
/* Marching Squares / MetaBalls (metaspheres) by Goran J. www.gj3d.com */


var metaObj;
let screen_width = 700;
let screen_height = 820;
let win_frame1 = [[60, 60], [screen_width - 60, 60], [screen_width - 60, screen_height - 60], [60, screen_height - 60]]
let win_frame2 = [[0, 0], [screen_width, 0], [screen_width, screen_height], [0, screen_height]]

function preload() {
    metaObj = new marchingSq()
}


function setup() {
    canvas = createCanvas(screen_width, screen_height);
    textSize(24);
    textAlign(CENTER, CENTER);
}

function draw() {
    // background(237, 208, 187)
    metaObj.emptyArr()
    metaObj.poly(win_frame2, 2, [250, 250, 250, 50])
    metaObj.poly(win_frame1, 4, [237, 208, 187])
    metaObj.traverseStart()

    metaObj.drawPoints()
    metaObj.moveBalls()
    metaObj.nodes = {}

    // text
    strokeWeight(0)
    stroke(0)
    text('click here to toggle borders', screen_width / 2, screen_height - 40);
    textSize(12);
    text('Optimized marching squares algorithm draws metaballs', screen_width / 2, screen_height - 20);
    // line_width = map(mouseX, 0, width, 0, 10);
}

function mouseClicked() {
    if (700 < mouseY) {
        if (metaObj.line_width > 0) {
            // var newa = 0
            metaObj.line_width = 0
        } else {
            metaObj.line_width = 5
        }
        return false;
    }
}

class marchingSq {
    constructor(s_width = 700, s_height = 820, sq_size = 10, n_balls = 8) {
        this.n_balls = n_balls;
        this.balls = [];
        this.screen_width = s_width;
        this.screen_height = s_height;
        this.cell = sq_size;
        this.line_width = 5;
        this.main_color = [128, 0, 20];
        this.current_ball = 0;
        this.squareFunList = [];
        this.squareFun = {}
        // mettabals fill color
        this.mbcolor = [128, 0, 20];
        // Save nodes that are later drawn at once in the poly function
        this.drawArray = [];
        // Save visited nodes in order to avoid unnecessary calculations
        this.pointsArray = this.emptyArr()
        // Track and delete the nodes that have already been added for drawing
        this.nodes = {};
        this.start_square = { 'start_dot_number': 0, 'start_xy': [0, 0] };
        this.mballs(this.n_balls)
    }

    mballs(n_balls) {
        for (var i = 0; i < n_balls; i++) {
            this.balls.push(new Ball(random(180, 500), random(180, 500)));
        }
    }

    get get_balls() {
        return this.balls;
    }

    emptyArr() {
        // new Uint16Array(10); 
        this.pointsArray = []
        for (let i = 0, scrw = this.screen_height / this.cell + 200; i < scrw; i++) {
            this.pointsArray[i] = new Array(this.screen_width / this.cell + 200).fill(0);
        }
        // this.that = this.linearY(10, 20, 30, 40)
        return this.pointsArray
    }

    moveBalls() {
        for (var i = 0; i < this.balls.length; i++) {
            this.balls[i].move();
        }
    }

    drawPoints() {
        // draw nodes/points to canvas using poly
        for (var i = 0; i < this.balls.length; i++) {
            this.poly(this.drawArray[i])
        }
        // clean drawArray
        for (var i = 0; i < this.balls.length; i++) {
            this.drawArray[i] = []
        }
    }

    poly(listN, line = this.line_width, color = this.mbcolor) {
        smooth();
        strokeWeight(line);
        stroke(0);
        fill(color);
        beginShape();
        for (let n = 0, len = listN.length; n < len; n++) {
            vertex(listN[n][0], listN[n][1]);
        }
        endShape(CLOSE);
    }

    traverseStart() {
        let i, j, r;
        let dot_num;
        /// TODO
        this.balls.forEach((ball, index) => {
            this.current_ball = index
            // math floor to make whole number and keep it on grid
            i = Math.floor(ball.posx / this.cell);
            j = Math.floor(ball.posy / this.cell);
            r = Math.floor(ball.rad / this.cell);
            for (let d = 0, f = screen_height / this.cell * 2; d < f; d++) {
                dot_num = this.findSquareDots(i, j);
                //debug
                // print(' DOT NUMBER ' + dot_num)
                if (0 < dot_num && dot_num < 15) {
                    this.drawArray[this.current_ball] = [];
                    this.start_square['start_dot_num'] = dot_num;
                    this.start_square['start_xy'] = [i * this.cell, j * this.cell];
                    this.drawSquare(i * this.cell, j * this.cell, dot_num, i * this.cell, j * this.cell - 1);
                    break;
                } else {
                    i = i;
                    j += 1;
                }
            }

        });
    }

    traverse(x, y, oldx, oldy) {
        let i = x / this.cell;
        let j = y / this.cell;
        this.nodes[i + '_' + j] = 1
        let dot_num = this.findSquareDots(i, j);
        if (this.start_square['start_dot_num'] === dot_num) {
            // debug
            // console.log('YES first')
            if (this.start_square['start_xy'].join() === [x, y].join()) {
                // console.log('YES')
            } else {
                this.drawSquare(x, y, dot_num, oldx, oldy);
            }
        } else {
            this.drawSquare(x, y, dot_num, oldx, oldy);
        }
    }

    findSquareDots(i, j) {
        let positions = [[0, 0], [0, 1], [1, 1], [1, 0]];
        for (let a = 0; a < positions.length; a++) {
            let pos1 = positions[a][0] + i;
            let pos2 = positions[a][1] + j;
            if (this.pointsArray[pos1][pos2] == 0) {
                this.pointsArray[pos1][pos2] = this.nodeVal(pos1, pos2);
            }
        }
        let square_dots = [this.pointsArray[i][j], this.pointsArray[i + 1][j],
        this.pointsArray[i + 1][j + 1], this.pointsArray[i][j + 1]]
        return this.findNumber(square_dots);
    }
    // TODO DELETE
    pass() {
        console.log('pass')
    }

    findNumber(square_dots) {
        let binary_num = 0;
        square_dots.forEach(dot => {
            if (dot >= 1) {
                binary_num = (binary_num << 1) | 0b0001;
            } else {
                binary_num = (binary_num << 1) | 0b0000;
            }
        });
        return binary_num;
    }

    nodeVal(pos1, pos2) {
        let posx = pos1 * this.cell;
        let posy = pos2 * this.cell;
        let sumList = [];
        let x, y, r, divisor;
        for (let n = 0, len = this.balls.length; n < len; n++) {
            x = this.balls[n].posx;
            y = this.balls[n].posy;
            r = this.balls[n].rad;
            divisor = ((posx - x) ** 2 + (posy - y) ** 2);
            if (divisor !== 0) {
                sumList.push(r ** 2 / divisor);
            } else {
                sumList.push(r);
            }
        }
        return sumList.reduce((a, b) => a + b, 0);
    }

    drawSquare(posx, posy, fun_number, oldx, oldy) {
        switch (fun_number) {
            case 1:
                this.sq_0001(posx, posy, oldx, oldy);
                break;
            case 2:
                this.sq_0010(posx, posy, oldx, oldy);
                break;
            case 3:
                this.sq_0011(posx, posy, oldx, oldy);
                break;
            case 4:
                this.sq_0100(posx, posy, oldx, oldy);
                break;
            case 5:
                this.sq_0101(posx, posy, oldx, oldy);
                break;
            case 6:
                this.sq_0110(posx, posy, oldx, oldy);
                break;
            case 7:
                this.sq_0111(posx, posy, oldx, oldy);
                break;
            case 8:
                this.sq_1000(posx, posy, oldx, oldy);
                break;
            case 9:
                this.sq_1001(posx, posy, oldx, oldy);
                break;
            case 10:
                this.sq_1010(posx, posy, oldx, oldy);
                break;
            case 11:
                this.sq_1011(posx, posy, oldx, oldy);
                break;
            case 12:
                this.sq_1100(posx, posy, oldx, oldy);
                break;
            case 13:
                this.sq_1101(posx, posy, oldx, oldy);
                break;
            case 14:
                this.sq_1110(posx, posy, oldx, oldy);
                break;
            case 0:
                this.sq_0000(posx, posy, oldx, oldy);
                break;
            case 15:
                this.sq_1111(posx, posy, oldx, oldy);
            // break;
        }
    }

    // I don't want to draw duplicates, so I check if the variable exists 
    // in the list of nodes ready for draw
    if_in_nodes(v) {
        if (this.nodes.hasOwnProperty(v[0] + '_' + v[1])) {
            this.drawArray[this.current_ball] = [];
            return true;
        } else {
            // if not ad new value to nodes list
            this.nodes[v[0] + '_' + v[1]] = 1;
            this.drawArray[this.current_ball].push(v);
            return false;
        };
    };

    linearY(ax, ay, bx, by) {
        // console.log(this.pointsArray);
        let iax, iay, ibx, iby;
        iax = ax / this.cell;
        iay = ay / this.cell;
        ibx = bx / this.cell;
        iby = by / this.cell;
        return ay + (by - ay) * ((1 - this.pointsArray[iax][iay]) /
            (this.pointsArray[ibx][iby] - this.pointsArray[iax][iay]));
    };

    linearX(ax, ay, bx, by) {
        let i_ax, i_ay, i_bx, i_by;
        i_ax = ax / this.cell;
        i_ay = ay / this.cell;
        i_bx = bx / this.cell;
        i_by = by / this.cell;
        return ax + (bx - ax) * ((1 - this.pointsArray[i_ax][i_ay]) /
            (this.pointsArray[i_bx][i_by] - this.pointsArray[i_ax][i_ay]));
    };

    sq_0001(x, y, oldx, oldy) {
        let v = [x, this.linearY(x, y, x, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x - this.cell, y, x, y)
        }
    }
    sq_1010(x, y, oldx, oldy) {
        if (oldx > x) {
            let v = [this.linearX(x, y + this.cell, x + this.cell, y + this.cell), y + this.cell];
            if (!this.if_in_nodes(v)) {
                this.traverse(x, y + this.cell, x, y)
            }
        } else if (oldx < x) {
            let v = [this.linearX(x, y, x + this.cell, y), y];
            if (!this.if_in_nodes(v)) {
                this.traverse(x, y - this.cell, x, y)
            }
        } else {
            console.log('SOMETHING WENT WRONG!')
        }
    }
    sq_0101(x, y, oldx, oldy) {
        if (oldy > y) {
            let v = [x + this.cell, this.linearY(x + this.cell, y, x + this.cell, y + this.cell)];
            if (!this.if_in_nodes(v)) {
                this.traverse(x + this.cell, y, x, y)
            }
        } else if (oldy < y) {
            let v = [x, this.linearY(x, y, x, y + this.cell)];
            if (!this.if_in_nodes(v)) {
                this.traverse(x - this.cell, y, x, y)
            }
        } else {
            console.log('SOMETHING WENT WRONG!')
        }
    }
    sq_1001(x, y, oldx, oldy) {
        let v = [this.linearX(x, y, x + this.cell, y), y];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y - this.cell, x, y)
        }
    }
    sq_0110(x, y, oldx, oldy) {
        let v = [this.linearX(x, y + this.cell, x + this.cell, y + this.cell), y + this.cell];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y + this.cell, x, y)
        }
    }
    sq_1100(x, y, oldx, oldy) {
        // let test = this.emptyArr()
        // console.log(test)
        let v = [x + this.cell, this.linearY(x + this.cell, y, x + this.cell, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x + this.cell, y, x, y);
        };
    };
    sq_0011(x, y, oldx, oldy) {
        let v = [x, this.linearY(x, y, x, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x - this.cell, y, x, y);
        };
    };
    sq_1111(x, y, oldx, oldy) {
        // no call should be made to function 0 in this optimised version
        console.log('SOMETHING WENT WRONG! Number 15 has been caled!!')
        this.traverse(x, y + this.cell, x, y)
    }
    sq_0111(x, y, oldx, oldy) {
        let v = [x, this.linearY(x, y, x, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x - this.cell, y, x, y)
        }
    }
    sq_1000(x, y, oldx, oldy) {
        let v = [this.linearX(x, y, x + this.cell, y), y];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y - this.cell, x, y)
        }
    }
    sq_1011(x, y, oldx, oldy) {
        let v = [this.linearX(x, y, x + this.cell, y), y];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y - this.cell, x, y)
        }
    }
    sq_0100(x, y, oldx, oldy) {
        let v = [x + this.cell, this.linearY(x + this.cell, y, x + this.cell, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x + this.cell, y, x, y)
        }
    }
    sq_1101(x, y, oldx, oldy) {
        let v = [x + this.cell, this.linearY(x + this.cell, y, x + this.cell, y + this.cell)];
        if (!this.if_in_nodes(v)) {
            this.traverse(x + this.cell, y, x, y)
        }
    }
    sq_1110(x, y, oldx, oldy) {
        let v = [this.linearX(x, y + this.cell, x + this.cell, y + this.cell), y + this.cell];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y + this.cell, x, y)
        }
    }
    sq_0010(x, y, oldx, oldy) {
        let v = [this.linearX(x, y + this.cell, x + this.cell, y + this.cell), y + this.cell];
        if (!this.if_in_nodes(v)) {
            this.traverse(x, y + this.cell, x, y)
        }
    }
    sq_0000(x, y, oldx, oldy) {
        // no call should be made to function 0 in this optimised version
        // 0 is empty function that dosn-t have a geometry
        console.log('SOMETHING WENT WRONG! Number 0 has been caled!!')
        return undefined;
    }
}

class Ball {
    constructor(startx, starty) {
        this.position = createVector(startx, starty);
        this.velocity;
        this.speed = random(0.8, 4.0);
        // this.speed = 2;
        this.angle = random(360);
        // this.angle = 180;
        this.radius = Math.floor(random(35, 70));
        this.findVelocity();
    }
    findVelocity() {
        this.velocity = p5.Vector.fromAngle(radians(this.angle));
        this.velocity.mult(this.speed);
    }
    get posx() {
        return this.position.x;
    }
    get posy() {
        return this.position.y;
    }
    get rad() {
        return this.radius;
    }

    move() {
        /// maybe to use vector rotate here
        var newPos = p5.Vector.add(this.position, this.velocity);
        // print(newPos) and small random angle
        let ranAngle = random(-2.0, 2.0);
        if (newPos.x > width - (this.radius + 60) || newPos.x < 0 + (this.radius + 60)) {
            this.angle = 180 - this.angle + ranAngle;
            this.findVelocity();
        }
        if (newPos.y > height - (this.radius + 60) || newPos.y < 0 + (this.radius + 60)) {
            this.angle = 360 - this.angle + ranAngle;
            this.findVelocity();
        }
        this.position.add(this.velocity);
        // debuging
        // ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
        // console.log(this.position.x, this.position.y, this.radius)
    }
}
