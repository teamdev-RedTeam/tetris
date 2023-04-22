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

// 消したライン数
let lines;

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
function checkMove() {
    return true;
}

// テトロミノを回転させる
function rotateTetro() {
    let newTetro = [];

    for (let y = 0; y < TETRO_SIZE; y++) {
        newTetro[y] = [];
        for (let x = 0; x < TETRO_SIZE; x++) {
            // tetroが定義されてないので, ひとまずTETRO_PATTERN[0]を回転
            // 実際: newTetro[y][x] = tetro[TETRO_SIZE-x-1][y]
            newTetro[y][x] = TETRO_PATTERN[0][TETRO_SIZE-x-1][y];
        }
    }    
    return newTetro;
}


//横にそろったら消す
function checkLine(){
    // score用に消した行数をカウント
    let linec = 0;
    
    // フィールド外枠を除外
    for(let y = 1; y < FILED_ROW-1; y++) {
        let flag = true;
        for(let x = 1; x < FILED_COL-1; x++) {
            if(!field[y][x]) {
                flag = false;
                break;
            }
        }
        if (flag){
            linec++;

            for(let ny = y; ny > 1; ny--) {
                for(let nx = 1; nx < FILED_COL-1; nx++) {
                    field[ny][nx] = field[ny-1][nx];
                }
            }
        }
    }
    
    // （修正必須！！）スコア用の処理
    if(linec) {
        lines += linec;
    }
}

// 下矢印を押したときと同じ処理
function dropTetro() {

}


function drawTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (TETRO_PATTERN[0][y][x]) {
                drawBlock(tetro_x + x, tetro_y + y, "red", 0.2)
            }
        }
    }
    
    document.onkeydown = (e) => {
        switch(e.key) {
            case "ArrowLeft":
                tetro_x--;
                break;
            case "ArrowRight":
                tetro_x++;
                break;
            case "ArrowDown":
                tetro_y++;
                break;
            case "ArrowUp":
                let newTetro = rotateTetro();
                if (checkMove(0, 0, newTetro)) TETRO_PATTERN[0] = newTetro;
                tetro_y--;
                break;
            default:
                return;
        }
        drawField();
        drawTetro();
    };
}