const config = {
    initialPage : document.getElementById("initialPage"),
    mainPage : document.getElementById("mainPage"),
}

function displayNone(ele) {
    ele.classList.remove("d-block");
    ele.classList.add("d-none");
}

function displayBlock(ele) {
    ele.classList.remove("d-none");
    ele.classList.add("d-block");
}

function switchPages(page1, page2) {
    displayNone(page1);
    displayBlock(page2);
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// const miniCanvas = document.getElementById("miniCanvas");
// const miniContext = miniCanvas.getContext("2d");

let dropSpeed = 600;

const FILED_COL = 12;
const FILED_ROW = 22;

const TETRO_SIZE = 4;
const BLOCK_SIZE = 30;

const SCREEN_W = FILED_COL * BLOCK_SIZE; // 360px
const SCREEN_H = FILED_ROW * BLOCK_SIZE; // 660px
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;
// canvas.style.border = "4px solid black";

// const MINISCREEN_W = TETRO_SIZE * BLOCK_SIZE; // 120px
// const MINISCREEN_H = TETRO_SIZE * BLOCK_SIZE; // 120px
// miniCanvas.width = MINISCREEN_W;
// miniCanvas.height = MINISCREEN_H;

let tetro_x = 1;
let tetro_y = 0;

// 7種類のテトロミノ
const TETRO_PATTERN = [
    [
        [ 0, 0, 0, 0 ],
        [ 1, 1, 1, 1 ],
        [ 0, 0, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 1, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 0, 1, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 0, 0, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ]
];

// 色はここに登録
const colorRGB = {
    "white":  [255, 255, 255],
    "black":  [0, 0, 0],
    "yellow": [255, 255, 0],
    "red":    [255, 0, 0],
    "blue":   [0, 0, 255],
    "green":  [0, 255, 0],
    "oudo":   [184, 154, 80],
    "gray":   [125, 125, 125],
    "water":  [170, 202, 222],
}

let field = [];
let miniField = [];

let tetro_t;
let tetro;

tetro_t = Math.floor(Math.random() * (TETRO_PATTERN.length-1))+1;
tetro = TETRO_PATTERN[tetro_t];


function initializeField() {
    for (let y = 0; y < FILED_ROW; y++) {
        field[y] = [];
        for (let x = 0; x < FILED_COL; x++) {
            if (y == 21 || x == 0 || x == 11) field[y][x] = 1;
            else if (y == 0 && (x >= 1 && x <= 10)) field[y][x] = 2;
            else field[y][x] = 0;
        }
    }    
}

// ワンブロックを描画する
function drawBlock(x, y, color, opacity, strokeColor = "black") {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    context.fillStyle = `rgb(${colorRGB[color]})`;
    context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = `rgb(${colorRGB[strokeColor]}, ${opacity})`;
    context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

// フィールド全体を描画する
function drawField() {
    context.clearRect(0, 0, SCREEN_W, SCREEN_H);

    for (let y = 0; y < FILED_ROW; y++) {
        for (let x = 0; x < FILED_COL; x++) {
            if (field[y][x] == 1) drawBlock(x, y, "oudo", 0.7);
            else if (field[y][x] == 2) drawBlock(x, y, "gray", 0);
            else drawBlock(x, y, "black", 0.5, "gray");
        }
    }
}

function initializeMiniField() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        miniField[y] = [];
        for (let x = 0; x < TETRO_SIZE; x++) {
            miniField[y][x] = 3;
        }
    }
}

function drawMiniField() {
    miniContext.clearRect(0, 0, MINISCREEN_W, MINISCREEN_H);

    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (miniField[y][x] == 3) {
                console.log(miniField[y][x]);
                drawBlock(x, y, "water", 0.7, "gray");
            }
        }
    }
}

initializeField();
drawField();
// initializeMiniField();
// drawMiniField();
drawTetro();

// 当たり判定を行う
function checkMove(mx, my) {
    for(let y = 0; y < TETRO_SIZE; y++){
        for(let x = 0; x < TETRO_SIZE; x++){
            if(tetro[y][x]){
                let nx = tetro_x + mx + x; // 2
                let ny = tetro_y + my + y; // 0
                if(ny < 0 || nx < 0
                || ny >= FILED_ROW || nx >= FILED_COL
                || field[ny][nx] ) return false;
            }
        }
    }
    return true;
}

// テトロミノを回転させる
function rotateTetro() {

}

// 下矢印を押したときと同じ処理
function dropTetro() {

}


function drawTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) {
                drawBlock(tetro_x + x, tetro_y + y, "red", 0.2)
            }
        }
    }
    
    document.onkeydown = (e) => {
        switch(e.key) {
            case "ArrowLeft":
                if(checkMove(-1, 0)) tetro_x--;
                break;
            case "ArrowRight":
                if(checkMove(1, 0)) tetro_x++;
                break;
            case "ArrowDown":
                if(checkMove(0, 1)) tetro_y++;
                break;
            case "ArrowUp":
                // let newTetoro = rotateTetro();
                // if (checkMove()) TETRO_PATTERN[0] = newTetoro;
                if(checkMove(0, -1)) tetro_y--;
                break;
            default:
                return;
        }
        drawField();
        drawTetro();
    };
}