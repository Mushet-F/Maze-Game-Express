const {Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

let cellsHorizontal = 4;
let cellsVertical = 3;
const width = window.innerWidth;
const height = window.innerHeight;

let unitLengthX = width / cellsHorizontal;
let unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Introduction
const playButton = document.querySelector("#play");

playButton.addEventListener("click", function(){
    document.querySelector('.row').classList.add('hidden');
});

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// Maze generation
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter); 

        counter --;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

let grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));
// Cant use .fill(false) as it will reference share reference point


let verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));


let horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    // if i have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }
    
    // mark this cell as visited
    grid[row][column] = true;

    // assemble randomly-ordered list of neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    
    // For each neighbour
    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;
        // See if neighbour is out of bound
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }
        // if we have visited that neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn]) {
            continue;
        }
        // remove a wall from either horizontals or verticals
        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if (direction === 'right'){
            verticals[row][column] = true;
        } else if (direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if (direction === 'down'){
            horizontals[row][column] = true;
        }
        
        stepThroughCell(nextRow, nextColumn);
    }

    // visit the next cell 
};

stepThroughCell(startRow, startColumn);

const createWalls = (arrH, arrV) => {
    arrH.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            } 

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX, 
                5,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                },
            );

            World.add(world, wall);

        });
    });

    arrV.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            } 
    
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                5,
                unitLengthY, 
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                },
            );
    
            World.add(world, wall);
        });
    });
}

createWalls(horizontals, verticals);

// Goal 
const createGoal = () => {
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX * .7,
        unitLengthY * .7,
        {
            label: 'goal',
            isStatic: true,
            render: {
                fillStyle: 'green'
            }
        }
    );
    World.add(world, goal);
}

createGoal();

// Ball
const createBall = () => {
    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
        {
            label: 'ball',
            render: {
                fillStyle: 'blue'
            }
        }
    );
    World.add(world, ball);

    document.addEventListener('keydown', event => {
        const { x, y} = ball.velocity;
    
        // 'w' key pressed
        if (event.keyCode === 87) {
            Body.setVelocity(ball, {x , y: y - 3});
        }
        // 'd' key pressed
        if (event.keyCode === 68) {
            Body.setVelocity(ball, { x: x + 3, y });
        }
        // 's' key pressed
        if (event.keyCode === 83) {
            Body.setVelocity(ball, { x, y: y + 3 });
        }
        // 'a' key pressed
        if (event.keyCode === 65) {
            Body.setVelocity(ball, { x: x - 3, y });
        }
    });
}

createBall();

// Win Condition
let level = 1;
let reachGoal = false;

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collison => {
        const labels = ['ball', 'goal'];
        if(
            labels.includes(collison.bodyA.label) &&
            labels.includes(collison.bodyA.label)
        ) {
            if (level > 2) {
                document.querySelector('.complete').classList.remove('hidden');
            } else {
                document.querySelector('.next').classList.remove('hidden');
            }
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
            reachGoal = true;
            if(timerOver) {
                document.querySelector('.next').classList.add('hidden');
            }
        }
    });
});

// Lose Condition
let timerOver = false;
let lost = false;
const lose = () => {
    if( timerOver === true && reachGoal === false) {
        document.querySelector('.lost').classList.remove('hidden');
        lost = true;
        level = 1;
    }
}

const nextButton = document.querySelector("#next");
const loseButton = document.querySelector("#lose");

function reset(){
    World.clear(world);

    engine.world.gravity.y = 0;

    if(lost) {
        cellsHorizontal = 4;
        cellsVertical = 3;
        document.querySelector('.lost').classList.add('hidden');
    } else {
        level++;
        cellsHorizontal += 4;
        cellsVertical += 3;
        document.querySelector('.next').classList.add('hidden');
    }

    unitLengthX = width / cellsHorizontal;
    unitLengthY = height / cellsVertical;

    reachGoal = false;
    lost = false;
    timerOver = false;
}

nextButton.addEventListener("click", function(){

    reset();
    
    World.add(world, walls);

    grid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    verticals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false));

    horizontals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    startRow = Math.floor(Math.random() * cellsVertical);
    startColumn = Math.floor(Math.random() * cellsHorizontal);

    stepThroughCell(startRow, startColumn);

    createWalls(horizontals, verticals);

    createGoal();

    createBall();

    timer();
});

loseButton.addEventListener("click", function(){

    reset();
    
    World.add(world, walls);

    grid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    verticals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false));

    horizontals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    startRow = Math.floor(Math.random() * cellsVertical);
    startColumn = Math.floor(Math.random() * cellsHorizontal);

    stepThroughCell(startRow, startColumn);

    createWalls(horizontals, verticals);

    createGoal();

    createBall();

    timer();
});

// Timer 
const durationInput = document.querySelector('#duration');
const bar = document.getElementById('timer');

let duration;
let correction = 1;

const timer = () => {
    const timer = new Timer(durationInput, playButton, nextButton, loseButton, {
        onStart(totalDuration){
            duration = totalDuration;
        },
        onTick(timeRemaining){
            let progress = timeRemaining / duration * 100;
            bar.style.width = progress + "%";
        },
        onComplete(){
            timerOver = true;
            lose();
            clearInterval(this.interval);
        }
    });
}

timer();