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

// モーダル
function displayGameOverModal() {
    let modal = document.getElementById("game-over-modal");
    modal.style.display = "block";
  }
  
function hideGameOverModal() {
    let modal = document.getElementById("game-over-modal");
    modal.style.display = "none";
  }

const BLOCK_SIZE = 30;
const TETRO_SIZE = 4;

// メインフィールド
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FIELD_COL = 12;
const FIELD_ROW = 22;

const SCREEN_W = FIELD_COL * BLOCK_SIZE; // 360px
const SCREEN_H = FIELD_ROW * BLOCK_SIZE; // 660px
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;

// ネクストフィールド
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const NEXT_F_COL = 6;
const NEXT_F_ROW = 12;

const NEXTSCREEN_W = NEXT_F_COL * BLOCK_SIZE;
const NEXTSCREEN_H = NEXT_F_ROW * BLOCK_SIZE;
nextCanvas.width = NEXTSCREEN_W;
nextCanvas.height = NEXTSCREEN_H;

// ホールドフィールド
const holdCanvas = document.getElementById("holdCanvas");
const holdCtx = holdCanvas.getContext("2d");

const HOLD_F_COL = 6;
const HOLD_F_ROW = 4;

const HOLDSCREEN_W = HOLD_F_COL * BLOCK_SIZE;
const HOLDSCREEN_H = HOLD_F_ROW * BLOCK_SIZE;
holdCanvas.width = HOLDSCREEN_W;
holdCanvas.height = HOLDSCREEN_H;

// 中央から出るようにするため
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2;
const START_Y = 0;

let tetro_x = START_X;
let tetro_y = START_Y;

const MUSIC = new Audio("assets/sounds/bonkers-for-arcades.mp3");
const STACK_SOUND = new Audio("assets/sounds/zapsplat_bambo_swoosh.mp3");
const DELETE_SOUND = new Audio("assets/sounds/retro-chip-power.mp3");
const GAMEOVER_SOUND = new Audio("assets/sounds/power-down-13.mp3");

const TETRO_COLORS = [
    [102, 204, 255],    //0水色
    [255, 153, 34],     //1オレンジ
    [102, 102, 255],    //2青
    [204, 85, 204],     //3紫
    [255, 221, 34],     //4黄色
    [255, 68, 68],      //5赤
    [85, 187, 85],      //6緑
    [190, 160, 90],     //7黄土
    [125, 118, 119],    //8灰色
    [50, 50, 50],       //9黒
    [255, 255, 255],    //10白
];

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

// スコア・レベル
const DROP_SPEED_INTERVAL = 100; //レベルアップするごとにアップする速度[msec]
const MAX_LEVEL = 10;
let lines = 0;
let score = 0;
let level = 1;

// インターバルID
let id;
let gameOver = false;

// 現在のテトロミノ
let tetroType = generateRandomInt();
let tetro = TETRO_PATTERN[tetroType];

//　ネクスト1
let nextTetroType_1 = generateRandomInt();
let nextTetro_1 = TETRO_PATTERN[nextTetroType_1];

// ネクスト2
let nextTetroType_2 = generateRandomInt();
let nextTetro_2 = TETRO_PATTERN[nextTetroType_2];

// ネクスト3
let nextTetroType_3 = generateRandomInt();
let nextTetro_3 = TETRO_PATTERN[nextTetroType_3];

//ホールド
let holdTetroType;
let holdTetro;

let field = [];
let nextField = [];
let holdField = [];

function generateRandomInt() {
    const MIN = 0;
    const MAX = TETRO_PATTERN.length - 1;

    return Math.floor( Math.random() * (MAX + 1 - MIN) ) + MIN;
}

// ワンブロックを描画する
function drawBlock(context, x, y, color, opacity, strokeColor = 9) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    const predictedOpacity = 0.4;
    let newopacity = opacity == predictedOpacity ? opacity : 1;

    context.fillStyle = `rgb(${TETRO_COLORS[color]}, ${newopacity})`;
    context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = `rgb(${TETRO_COLORS[strokeColor]}, ${opacity})`;
    context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    if (color < TETRO_PATTERN.length && newopacity == 1) decorateBlock(context, px, py, color);
}

function drawNextHoldBlock(context, x, y, i, color) {
    let px = x * BLOCK_SIZE + BLOCK_SIZE;
    let py = (y * BLOCK_SIZE) + (i * 120);

    context.fillStyle = `rgb(${TETRO_COLORS[color]})`;
    context.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = `rgb(${TETRO_COLORS[9]}, .3)`;
    context.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    if (color < TETRO_PATTERN.length) decorateBlock(context, px, py, color);
}


function decorateBlock(context, px, py, color) {
    context.fillStyle = `rgb(${TETRO_COLORS[10]})`;
    context.fillRect(px, py, 4, 4);
    context.fillStyle = `rgb(${TETRO_COLORS[10]})`;
    context.fillRect(px + 4, py + 4, 8, 8);
    context.fillStyle = `rgb(${TETRO_COLORS[color]})`;
    context.fillRect(px + 8, py + 8, 4, 4);
}

// メインフィールド
function initializeField() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = [];
        for (let x = 0; x < FIELD_COL; x++) {
            if (y == 21 || x == 0 || x == 11) field[y][x] = 7;
            else if (y == 0 && (x >= 1 && x <= 10)) field[y][x] = 8;
            else field[y][x] = 9;
        }
    }
}

function drawField() {
    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

    for (let y = 0; y < FIELD_ROW; y++) {
        for (let x = 0; x < FIELD_COL; x++) {
            if (field[y][x] == 7) drawBlock(ctx, x, y, 7, .7);
            else if (field[y][x] == 8) drawBlock(ctx, x, y, 8, 0);
            else drawBlock(ctx, x, y, field[y][x], .5, 8);
        }
    }
    drawPredictedLandingPoint();
}

function drawTetro() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (tetro[y][x]) {
                drawBlock(ctx, tetro_x + x, tetro_y + y, tetroType, 0.3);
            }
        }
    }
}

// ネクストフィールド
function initializeNextField() {
    for (let y = 0; y < NEXT_F_ROW; y++) {
        nextField[y] = [];
        for (let x = 0; x < NEXT_F_COL; x++) {
            nextField[y][x] = 1;
        }
    }
}

function drawNextField() {
    nextCtx.clearRect(0, 0, NEXTSCREEN_W, NEXTSCREEN_H);

    for (let y = 0; y < NEXT_F_ROW; y++) {
        for (let x = 0; x < NEXT_F_COL; x++) {
            if (nextField[y][x]) drawBlock(nextCtx, x, y, 9, .1);
        }
    }
}

function drawTetroNext() {
    let nextArr = [nextTetroType_1, nextTetroType_2, nextTetroType_3];

    for (let i = 0; i < 3; i++) {
        let tetroType = nextArr[i];
        for (let y = 0; y < TETRO_SIZE; y++) {
            for (let x = 0; x < TETRO_SIZE; x++) {
                if (TETRO_PATTERN[tetroType][y][x]) drawNextHoldBlock(nextCtx, x, y, i, tetroType);
            }
        }
    }
}

// ホールドフィールド
function initializeHoldField() {
    for (let y = 0; y < HOLD_F_ROW; y++) {
        holdField[y] = [];
        for (let x = 0; x < HOLD_F_COL; x++) {
            holdField[y][x] = 1;
        }
    }
}

function drawHoldField() {
    holdCtx.clearRect(0, 0, HOLDSCREEN_W, HOLDSCREEN_H);

    for (let y = 0; y < HOLD_F_ROW; y++) {
        for (let x = 0; x < HOLD_F_COL; x++) {
            if (holdField[y][x]) drawBlock(holdCtx, x, y, 9, .1);
        }
    }
}

function drawTetroHold() {
    for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
            if (holdTetro[y][x]) {
                drawNextHoldBlock(holdCtx, x, y, 0, holdTetroType);
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

                if(field[ny][nx] != 9) return false;
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
    let banishedLine = 0;
    
    // フィールド外枠を除外
    for(let y = 1; y < FIELD_ROW-1; y++) {
        let flag = true;
        for(let x = 1; x < FIELD_COL-1; x++) {
            if(field[y][x] == 9) {
                flag = false;
                break;
            }
        }
        if (flag){
            banishedLine++;

            for(let ny = y; ny > 1; ny--) {
                for(let nx = 1; nx < FIELD_COL-1; nx++) {
                    field[ny][nx] = field[ny-1][nx];
                    DELETE_SOUND.currentTime = 0;
                    DELETE_SOUND.play();
                }
            }
        }
    }
    // スコア用の処理
    calcScore(banishedLine);
    setData();
}

function calcScore(banishedLine) {
    if (!banishedLine) return;

    lines += banishedLine;
    score += level * 10 * banishedLine ** 2;
    if(level < MAX_LEVEL + 1) {
        for(i=level; i<=MAX_LEVEL; i++) {
            if(score >= (level+1)**3 * 4) {
                level += 1;
                clearInterval(id);
                id = startInterval();
            }
        }
    }
}

function setData() {
    document.getElementById("level").innerHTML = level.toString();
    document.getElementById("lines").innerHTML = lines.toString();
    document.getElementById("score").innerHTML = score.toString();
}

//ホールド機能
function setHold() {
    if(!holdTetro) {
        holdTetroType = tetroType;
        holdTetro = tetro;
        setNextTetro();
    } 
    else if (checkMove(0, 0, holdTetro)) {
        // tetroType入れ替え
        let tmp = holdTetroType;
        holdTetroType = tetroType;
        tetroType = tmp;
        // tetro入れ替え
        tmp = holdTetro;
        holdTetro = tetro;
        tetro = tmp;
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
        checkLine();
        setNextTetro();
        drawNextField();
        drawTetroNext();
    }

    if (checkGameOver()) {
        clearInterval(id);
        displayGameOverModal();
        MUSIC.pause();
        DELETE_SOUND.pause();
        MUSIC.currentTime = 0;
        GAMEOVER_SOUND.play();

        let highScoreSec = document.getElementById("highScore");
        let highScore = parseInt(highScoreSec.getAttribute("data-score"), 10);

        if (highScore < score) {
            highScoreSec.setAttribute("data-score", score.toString());
            highScoreSec.innerHTML = `${score.toString()}`;
        }
    }
    
    drawField();
    drawTetro();
}

function drawPredictedLandingPoint() {
    let dummyTetro = tetro;
    let dummyMovementX = 0;
    let dummyMovementY = 0;

    while(checkMove(dummyMovementX, dummyMovementY + 1, dummyTetro)){
        dummyMovementY++;
    }

    for(let y = 0; y < TETRO_SIZE; y++) {
        for(let x = 0; x < TETRO_SIZE; x++) {
            if(tetro[y][x]) drawBlock(ctx, tetro_x + dummyMovementX + x, tetro_y + dummyMovementY + y, tetroType, .4);
        }
    }
}

function checkGameOver() {
    let y = 1;
    for (let x = 1; x < FIELD_COL - 1; x++) {
        if (field[y][x] != 9) return true;
    }
    return false;
}

function initGame() {
    initializeField();
    drawField();
    drawTetro();
    
    initializeNextField();
    drawNextField();
    drawTetroNext();
    
    initializeHoldField();
    drawHoldField();
    
    MUSIC.currentTime = 0;
    musicPlay();

    id = startInterval();
}

// リセット
function resetGame() {
    setNextTetro();
    btn.innerHTML = paused;
    holdTetro = null;
    holdTetroType = null;
    score = 0;
    lines = 0;
    level = 1;

    setData();
}

function setNextTetro() {
    tetroType = nextTetroType_1;
    nextTetroType_1 = nextTetroType_2;
    nextTetroType_2 = nextTetroType_3;
    nextTetroType_3 = generateRandomInt();

    tetro = TETRO_PATTERN[tetroType];
    nextTetro_1 = TETRO_PATTERN[nextTetroType_1];
    nextTetro_2 = TETRO_PATTERN[nextTetroType_2];
    nextTetro_3 = TETRO_PATTERN[nextTetroType_3];

    tetro_x = START_X;
    tetro_y = START_Y;
}

function musicPlay(){
    MUSIC.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);

    MUSIC.play();
}

function keyDownFunc(e) {
    switch(e.key) {
        case "ArrowLeft":
            if(checkMove(-1, 0)) tetro_x--;
            break;
        case "ArrowRight":
            if(checkMove(1, 0)) tetro_x++;
            break;
        case "ArrowDown":
            STACK_SOUND.play();
            while(checkMove(0, 1)) tetro_y++;
            break;
        case "ArrowUp":
           let newTetro = rotateTetro();
            if(checkMove(0, 0, newTetro)) tetro = newTetro;
            break;
        case "Shift":
            setHold();
            drawHoldField();
            drawTetroHold();
            break;
        default:
            return;
        }
        
    drawField();
    drawTetro();
}

// デフォルトのキーイベント
document.onkeydown = keyDownFunc;

// セットインターバル
function startInterval() {
    let id = setInterval(() => {
        dropTetro();
    }, 1000 - (level-1) * DROP_SPEED_INTERVAL);

    return id;
}

// スタートボタン
document.getElementById("startBtn").addEventListener("click", () => {
    switchPages(config.initialPage, config.mainPage);
    initGame();
});

//　リセットボタン
document.getElementById("resetBtn").addEventListener("click", () => {
    let result = confirm("Start New Game?");
    
    if (result) {
        document.onkeydown = keyDownFunc;
        clearInterval(id);
        resetGame();
        initGame();
    } else {
        document.onkeydown = keyDownFunc;
        btn.innerHTML = paused;
        clearInterval(id);
        id = startInterval();
    };
});

let btn = document.getElementById("pauseBtn");
const paused = `<i class="fa-solid fa-pause fa-2x"></i>`;
const restart = `<i class="fa-solid fa-play fa-2x"></i>`; 

// 一時停止ボタン
document.getElementById("pauseBtn").addEventListener("click", () => {
    if (btn.innerHTML == paused) {
        btn.innerHTML = restart;
        clearInterval(id);
        MUSIC.pause();
        // キーを無効化する
        document.onkeydown = null;
    } else {
        btn.innerHTML = paused;
        document.onkeydown = keyDownFunc;
        id = startInterval();
        MUSIC.play();
    }
});

// プレイヤーが続けるを選択したとき
document.getElementById("play-again-button").addEventListener("click", () => {
    hideGameOverModal();
    resetGame();
    initGame();
});

// プレイヤーがやめるを選択したとき
document.getElementById("quit-button").addEventListener("click", () => {
    hideGameOverModal();
    resetGame();
    switchPages(config.mainPage, config.initialPage);
});

// 操作方法の表示・非表示
const modal = document.getElementById("infoModal");

document.getElementById("infoBtn").addEventListener("click", () => {
    displayBlock(modal);
});

window.onclick = (event) => {
    if (event.target == modal) displayNone(modal);
}

// 音量調節
const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', function() {
    MUSIC.volume = this.value;
    STACK_SOUND.volume = this.value;
    DELETE_SOUND.volume = this.value;
}, false);