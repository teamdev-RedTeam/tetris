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

// メインフィールド
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// サブフィールド
const miniCanvas = document.getElementById("miniCanvas");
const miniCtx = miniCanvas.getContext("2d");

const FIELD_COL = 12;
const FIELD_ROW = 22;

const MINI_F_COL = 4;
const MINI_F_ROW = 4;

const BLOCK_SIZE = 30;
const TETRO_SIZE = 4;

const SCREEN_W = FIELD_COL * BLOCK_SIZE; // 360px
const SCREEN_H = FIELD_ROW * BLOCK_SIZE; // 660px
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;

const MINISCREEN_W = MINI_F_COL * BLOCK_SIZE; // 120px
const MINISCREEN_H = MINI_F_ROW * BLOCK_SIZE; // 120px
miniCanvas.width = MINISCREEN_W;
miniCanvas.height = MINISCREEN_H;

// 中央から出るようにするため
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

let tetro_x = START_X;
let tetro_y = START_Y;

let id;
// レベルが上がるごとに速くする
let dropSpeed = 600;

const TETRO_COLORS = [
    [102, 204, 255],    //0水色
    [255, 153, 34],     //1オレンジ
    [102, 102, 255],    //2青
    [204, 85, 204],     //3紫
    [255, 221, 34],     //4黄色
    [255, 68, 68],      //5赤
    [85, 187, 85],      //6緑
    [184, 154, 80],     //7黄土
    [125, 118, 119],    //8灰色
    [0, 0, 0],          //9黒
];

// 消したライン数
let lines;

// 7種類のテトロミノ
const TETRO_PATTERN = [
    [
        // I型
        [ 0, 0, 0, 0 ],
        [ 1, 1, 1, 1 ],
        [ 0, 0, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [   // L型
        [ 0, 0, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ]
    ],

    [   // J型
        [ 0, 0, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 1, 1, 0 ]
    ],

    [   // T型
        [ 0, 0, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 0, 0 ]
    ],

    [   // O型
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [   // Z型
        [ 0, 0, 0, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
    ],

    [   // S型
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 1, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
    ]
];

const MIN = 0;
const MAX = TETRO_PATTERN.length - 1;

function generateRandomInt() {
    return Math.floor( Math.random() * (MAX + 1 - MIN) ) + MIN;
}

let tetroType = generateRandomInt();
let tetro = TETRO_PATTERN[tetroType];

// 次のテトロミノ
let nextTetroType = generateRandomInt();
let nextTetro = TETRO_PATTERN[nextTetroType];

let field = [];
let miniField = [];

// ワンブロックを描画する
function drawBlock(context, x, y, color, opacity, strokeColor = 9) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    context.fillStyle = `rgb(${TETRO_COLORS[color]})`;
    context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = `rgb(${TETRO_COLORS[strokeColor]}, ${opacity})`;
    context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

function initializeField() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = [];
        for (let x = 0; x < FIELD_COL; x++) {
            if (y == 21 || x == 0 || x == 11) field[y][x] = 7;
            else if (y == 0 && (x >= 1 && x <= 10)) field[y][x] = 8;
            // フィールド内
            else field[y][x] = 9;
        }
    }
}

// フィールド全体を描画する
function drawField() {
    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

    for (let y = 0; y < FIELD_ROW; y++) {
        for (let x = 0; x < FIELD_COL; x++) {
            if (field[y][x] == 7) drawBlock(ctx, x, y, 7, 0.7);
            else if (field[y][x] == 8) drawBlock(ctx, x, y, 8, 0);
            else drawBlock(ctx, x, y, field[y][x], 0.5, 8);
        }
    }
    drawPredictedLandingPoint();
}

// ミニフィールドを初期化する
function initializeMiniField() {
    for (let y = 0; y < MINI_F_ROW; y++) {
        miniField[y] = [];
        for (let x = 0; x < MINI_F_COL; x++) {
            miniField[y][x] = 1;
        }
    }
}

function drawMiniField() {
    miniCtx.clearRect(0, 0, MINISCREEN_W, MINISCREEN_H);

    for (let y = 0; y < MINI_F_ROW; y++) {
        for (let x = 0; x < MINI_F_COL; x++) {
            if (miniField[y][x] == 1) {
                drawBlock(miniCtx, x, y, 7, 0.1);
            }
        }
    }
}

// 当たり判定を行う
function checkMove(mx, my, newTetro) {
    if(newTetro == undefined) newTetro = tetro;
    for(let y = 0; y < TETRO_SIZE; y++){
        for(let x = 0; x < TETRO_SIZE; x++){
            if(newTetro[y][x]){
                let nx = tetro_x + mx + x; // 2
                let ny = tetro_y + my + y; // 0
                if(ny < 1 || nx < 1
                || ny >= FIELD_ROW - 1 || nx >= FIELD_COL - 1
                || field[ny][nx] != 9)
                return false;
            }
        }
    }
    return true;
}

// テトロミノを回転させる
function rotateTetro() {
    let newTetro = [];

    for (let y = 0; y < TETRO_SIZE; y++) {
        newTetro[y] = [];
        for (let x = 0; x < TETRO_SIZE; x++) {
            newTetro[y][x] = tetro[TETRO_SIZE-x-1][y];
        }
    }
    return newTetro;
}

//横にそろったら消す
function checkLine(){
    // score用に消した行数をカウント
    let linec = 0;
    
    // フィールド外枠を除外
    for(let y = 1; y < FIELD_ROW-1; y++) {
        let flag = true;
        for(let x = 1; x < FIELD_COL-1; x++) {
            if(!field[y][x]) {
                flag = false;
                break;
            }
        }
        if (flag){
            linec++;

            for(let ny = y; ny > 1; ny--) {
                for(let nx = 1; nx < FIELD_COL-1; nx++) {
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

// それ以上下に行くことができないので固定する
function fixTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) field[tetro_y + y][tetro_x + x] = tetroType;
        }
    }    
}

// 一定間隔ごとにテトロミノを落とす
function dropTetro() {
    if (checkMove(0, 1)) tetro_y++;
    else {
        fixTetro();
        tetroType = nextTetroType;
        tetro = TETRO_PATTERN[tetroType];
        nextTetroType = generateRandomInt();
        nextTetro = TETRO_PATTERN[nextTetroType];
        tetro_x = START_X;
        tetro_y = START_Y;
    }

    drawField();
    drawTetro();
    drawMiniField();
    drawTetroMini();
}

function drawTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) {
                drawBlock(ctx, tetro_x + x, tetro_y + y, tetroType, 0.2);
            }
        }
    }
}

function drawTetroMini() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (nextTetro[y][x]) drawBlock(miniCtx, x, y, nextTetroType, 0.3);
        }
    }
}

// drawBlockの最後の引数でopacityを調整したい。
function drawPredictedLandingPoint()
{
    let dummyTetro = tetro;
    let dummyMovementX = 0;
    let dummyMovementY = 0;
    while(checkMove(dummyMovementX, dummyMovementY + 1, dummyTetro)){
        dummyMovementY++;
    }

    for(let y = 0; y < TETRO_SIZE; y++)
    {
        for(let x = 0; x < TETRO_SIZE; x++)
        {
            if(tetro[y][x])
            {
                drawBlock(ctx, tetro_x + dummyMovementX + x, tetro_y + dummyMovementY + y, tetroType, 0.1)
            }
        }
    }
}

function switchPages(page1, page2) {
    displayNone(page1);
    displayBlock(page2);
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
            while(checkMove(0, 1)) tetro_y++;
            break;
        case "ArrowUp":
            let newTetoro = rotateTetro();
            if(checkMove(0, 0, newTetoro)) tetro = newTetoro;
            break;
        default:
            return;
        }

    drawField();
    drawTetro();
}

// スタートボタン
document.getElementById("startBtn").addEventListener("click", function(){
    switchPages(config.initialPage, config.mainPage);
    initializeField();
    drawField();
    drawTetro();
    initializeMiniField();
    drawMiniField();
    drawTetroMini();

    id = setInterval(() => {
        dropTetro();
    }, dropSpeed);
});

//　リセットボタン
document.getElementById("resetBtn").addEventListener("click", function(){
    let result = confirm("スタート画面に戻りますか？");
    
    if (result) location.reload();
    else return;

    clearInterval(id);
});

// 一時停止ボタン
document.getElementById("pauseBtn").addEventListener("click", function(){
    let btn = document.getElementById("pauseBtn");
    const paused = `<i class="fa-solid fa-pause fa-2x"></i>`;
    const restart = `<i class="fa-solid fa-play fa-2x"></i>`; 

    if (btn.innerHTML == paused) {
        btn.innerHTML = restart;
        clearInterval(id);
    } else {
        btn.innerHTML = paused;
        id = setInterval(() => {
            dropTetro();
        }, dropSpeed);
    }
});