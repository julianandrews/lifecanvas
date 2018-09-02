"use strict";
class World {
    constructor(width, height, fillDensity) {
        this.width = width;
        this.height = height;
        this.liveCells = [];
        this.populate(fillDensity);
    }
    step() {
        const keyFromXY = (x, y) => `${x},${y}`;
        const neighborCounts = {};
        for (const cell of this.liveCells) {
            for (const i of [-1, 0, 1]) {
                for (const j of [-1, 0, 1]) {
                    const x = cell.x + i;
                    const y = cell.y + j;
                    if (0 <= x && x < this.width && 0 <= y && y < this.height) {
                        const key = keyFromXY(x, y);
                        if (!(key in neighborCounts)) {
                            neighborCounts[key] = {
                                point: { x: x, y: y },
                                count: 0
                            };
                        }
                        neighborCounts[key].count++;
                    }
                }
            }
        }
        const newLiveCells = [];
        for (const key in neighborCounts) {
            if (neighborCounts[key].count === 3) {
                newLiveCells.push(neighborCounts[key].point);
            }
        }
        for (const cell of this.liveCells) {
            const key = keyFromXY(cell.x, cell.y);
            if (neighborCounts[key].count === 4) {
                newLiveCells.push(cell);
            }
        }
        this.liveCells = newLiveCells;
    }
    populate(fillDensity) {
        this.liveCells = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (Math.random() < fillDensity) {
                    this.liveCells.push({ x: x, y: y });
                }
            }
        }
    }
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.liveCells.filter((cell) => cell.x <= width && cell.y <= height);
    }
}
class LifeCanvas {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.interval = null;
        this.config = Object.assign({ cellColor: "#000", cellSize: 10, cellPadding: 1, stepTime: 500, fillDensity: 0.2, width: canvas.clientWidth, height: canvas.clientHeight }, config || {});
        this.world = new World(Math.ceil(this.config.width / this.config.cellSize), Math.ceil(this.config.height / this.config.cellSize), this.config.fillDensity);
        window.addEventListener("resize", () => this.resize());
        this.draw();
        this.start();
    }
    draw() {
        this.resize();
        const ctx = this.canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("Failed to get canvas context.");
        }
        ctx.fillStyle = this.config.cellColor;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const point of this.world.liveCells) {
            ctx.fillRect(point.x * this.config.cellSize + this.config.cellPadding, point.y * this.config.cellSize + this.config.cellPadding, this.config.cellSize - 2 * this.config.cellPadding, this.config.cellSize - 2 * this.config.cellPadding);
        }
    }
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    start() {
        if (this.interval == null) {
            this.interval = setInterval(() => {
                this.world.step();
                this.draw();
            }, this.config.stepTime);
        }
    }
    stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
        }
        this.interval = null;
    }
}
/* Starts drawing to the provided canvas element. */
function attachToCanvas(canvas, config) {
    return new LifeCanvas(canvas, config);
}
/* Conveneience method to attach to canvases matching a given selector. */
function attachToCanvases(selector, config) {
    const nodes = document.querySelectorAll(selector);
    for (const node of nodes) {
        if (node instanceof HTMLCanvasElement) {
            attachToCanvas(node, config);
        }
    }
}
