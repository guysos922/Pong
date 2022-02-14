function start() {
    document.body.innerHTML = '<h1>Pong</h1>' +
        '<h2 id="score">score:0</h2>' +
        '<h2 id="wins">wins:0</h2>' +
        '<div class ="grass" id="grass_1"></div>' +
        '<div id="line_up"></div>' +
        '<canvas id="field"></canvas>' +
        '<div id="line_down"></div>' +
        '<div class ="grass" id="grass_2"></div>' +
        '<div id="credits">made by guy shindel</div>';
    document.getElementsByTagName('h1')[0].style.animation = "text-pop-up-top 1s  linear alternate both";

    startGame()
}

function startGame() {
    const canvas = document.getElementById("field");
    const game = new Game(canvas);
    game.startGame();
}

class Game {
    constructor(canvas) {
        var ballSpeed = 5;
        var botSpeed = 5;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.paddle = new Paddle(this.ctx, "#0095DD", 0, this.canvasHeight / 2, 10, 50, 5, this.canvasHeight, this.canvasWidth, false);
        this.bot_paddle = new Paddle(this.ctx, "#0095DD", this.canvasWidth - 10, this.canvasHeight / 2, 10, 50, botSpeed, this.canvasHeight, this.canvasWidth, true);
        this.ball = new Ball(this.ctx, "#0095DD", 10, this.canvasWidth / 2, this.canvasHeight / 2, this.paddle, this.bot_paddle, ballSpeed, ballSpeed, this.canvasHeight, this.canvasWidth);
        this.intervalId = 0;
        this.paused = false;
        this.score = 0;
        this.wonScore = 0;
        document.addEventListener("keydown", ev => this.keyDownHandler(ev));
    }

    startGame() {
        this.intervalId = setInterval(this.draw.bind(this), 30);
    }

    draw() {
        this.checkLost();
        this.checkWon();
        this.checkScore();
        this.canvas.getContext("2d").clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        var [ballX, ballY] = this.ball.draw();
        //this.ball.printXY();
        this.paddle.draw(ballX, ballY);
        this.bot_paddle.draw(ballX, ballY);
    }

    getCanvas() {
        return this.canvas;
    }

    checkLost() {
        if (this.ball.x < 0 + this.ball.ballRadius) {
            clearInterval(this.intervalId);
            alert("Lost")
            document.location.reload();
        }
    }

    checkWon() {
        if (this.ball.x > this.canvasWidth - this.ball.ballRadius) {
            const score = document.getElementById("wins");
            this.wonScore +=1
            score.innerHTML = "wins:" + this.wonScore;
            clearInterval(this.intervalId);
            this.restart()
        }
    }

    checkScore(){
        if(this.ball.checkPaddle()){
            this.score +=1
            const score = document.getElementById("score");
            score.innerHTML = "score:" + this.score;
        }
    }

    keyDownHandler(e) {
        if (e.keyCode == 32) {
            if (!this.paused) {
                console.log("paused")
                this.pause();
            }
            else {
                this.resume();
            }
        }
    }

    pause() {
        if (!this.paused) {
            clearInterval(this.intervalId);
            this.paused = true;
        }
    }

    resume() {
        if (this.paused) {
            this.intervalId = setInterval(this.draw.bind(this), 30);
            this.paused = false;
        }
    }

    restart(){
        this.ball.restart(5);
        this.paddle.restart(5);
        this.bot_paddle.restart(5);
        this.startGame();
    }
}


class Ball {
    constructor(ctx, ballColor, ballRadius, starting_x, starting_y, paddle, bot_paddle, dx, dy, canvasHeight, canvasWidth) {
        this.ctx = ctx;

        this.ballColor = ballColor;
        this.ballRadius = ballRadius;
        this.x = starting_x;
        this.y = starting_y;

        this.paddle = paddle;
        this.bot_paddle = bot_paddle;

        this.dx = dx;
        this.dy = dy;

        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
    }

    draw() {
        this.ctx.beginPath();
        this.checkPosition();
        this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ballColor;
        this.ctx.shadowColor = 'black';
        this.ctx.strokeStyle = "rgba(0,0,0,1)";
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 1;
        this.ctx.fill();
        this.ctx.closePath();

        return [this.x, this.y]
    }

    printXY() {
        console.log(this.x + "," + this.y);
    }

    checkPosition() {
        //if it got to right border
        /*if (this.x + this.dx > this.canvasWidth - this.ballRadius) {
            this.dx = -this.dx;
        }*/
        //if it got to left border
        /*if (this.x + this.dx < 0 + this.ballRadius) {
            this.dx = -this.dx;
        }*/
        //if it got to up or down border
        if (this.y + this.dy > this.canvasHeight - this.ballRadius || this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        }

        if(this.checkPaddle()){
            //change his direction
            this.dx = -this.dx;
            //make his speed bigger
            this.dx += 1;
            this.dy += 1;

            this.paddle.paddleSpeed +=1;
        }
        if(this.checkBotPaddle()){
            this.dx = -this.dx;
        }

        this.x += this.dx;
        this.y += this.dy;
    }

    checkPaddle() {
        var paddle_x = this.paddle.x + this.paddle.width;
        var paddle_y_1 = this.paddle.y;
        var paddle_y_2 = this.paddle.y + this.paddle.height;
        if (this.x - this.ballRadius <= paddle_x) {
            if (paddle_y_2 >= this.y && this.y >= paddle_y_1) {
                return true;
            }
        }
    }
    checkBotPaddle() {
        var paddle_x = this.bot_paddle.x - this.bot_paddle.width;
        var paddle_y_1 = this.bot_paddle.y;
        var paddle_y_2 = this.bot_paddle.y + this.bot_paddle.height;
        if (this.x + this.ballRadius >= paddle_x) {
            if (paddle_y_2 >= this.y && this.y >= paddle_y_1) {
                return true;
            }
        }
    }

    restart(ballSpeed){
        this.x = this.canvasWidth /2
        this.y = this.canvasHeight /2

        this.dx = ballSpeed;
        this.dy = ballSpeed;
    }
}

class Paddle {
    constructor(ctx, color, starting_x, starting_y, width, height, paddleSpeed, canvasHeight, canvasWidth, isItBot) {
        this.ctx = ctx;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;

        this.color = color;
        this.x = starting_x;
        this.y = starting_y;
        this.width = width;
        this.height = height;
        this.paddleSpeed = paddleSpeed;

        this.upPressed = false;
        this.downPressed = false;

        this.isItBot = isItBot;


        if (!this.isItBot) {
            document.addEventListener("keydown", ev => this.keyDownHandler(ev));
            document.addEventListener("keyup", ev => this.keyUpHandler(ev));
        }
    }

    checkPosition(ballX, ballY) {
        if (this.isItBot) {
            if (this.y < ballY - this.height / 2) {
                this.y += this.paddleSpeed;
                if (this.y + this.height + this.paddleSpeed > this.canvasHeight) {
                    this.y = this.canvasHeight - this.height;
                }
            }
            else {
                this.y -= this.paddleSpeed;
                if (this.y < 0) {
                    this.y = 0;
                }
            }
        }
        else {
            if (this.downPressed) {
                this.y += this.paddleSpeed;
                if (this.y + this.height + this.paddleSpeed > this.canvasHeight) {
                    this.y = this.canvasHeight - this.height;
                }
            }
            if (this.upPressed) {
                this.y -= this.paddleSpeed;
                if (this.y < 0) {
                    this.y = 0;
                }
            }
        }
    }

    draw(ballX, ballY) {
        this.ctx.beginPath();
        this.checkPosition(ballX, ballY);
        this.ctx.rect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    keyDownHandler(e) {
        if (e.keyCode == 38) {
            this.upPressed = true;
        }
        else if (e.keyCode == 40) {
            this.downPressed = true;
        }

    }

    keyUpHandler(e) {
        if (e.keyCode == 38) {
            this.upPressed = false;
        }
        if (e.keyCode == 40) {
            this.downPressed = false;
        }
    }

    restart(paddleSpeed){
        this.y = this.canvasHeight/2;
        this.paddleSpeed = paddleSpeed;
    }
}