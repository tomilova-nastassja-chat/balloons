// Время игры и общий счет
let balloonsCount = 0;
let gameScore = 0;
let gameTimeInSeconds = 60;

setTimeout(() => {
    clearTimeout(screenTimerId); // остановка отсчета времени на экране
    clearTimeout(ballonsFlowTimeoutId); // остановка создания шариков
    clearTimeout(needle.needleTimeout); // остановка отрисовки иглы
    needle.clearNeedle();

    document.querySelector("#gameTime").parentNode.innerHTML = "Время вышло";
    document.querySelector("#gameScore").innerHTML = `Лопнуто шариков ${gameScore}<br> Пропущено шариков ${balloonsCount - gameScore}`;
}, gameTimeInSeconds * 1000);

let timeLeft = gameTimeInSeconds - 1;
let screenTimerId = setInterval(() => {
    document.querySelector("#gameTime").innerHTML = timeLeft--;
}, 1000);



// ИГРА
let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
let gameZoneSize = 300;



// Иголка и управление
class Needle {
    constructor(x) {
        this.X = x;
        this.Y = 12
        this.Step = 10;
    }

    drawNeedle() {
        this.needleTimeout = setInterval(() => {
            this.clearNeedle();
            ctx.beginPath();
            ctx.moveTo(this.X - 2, this.Y - 12);
            ctx.lineTo(this.X - 2, this.Y - 7);
            ctx.lineTo(this.X, this.Y); // отсчет координаты X относительно конца иглы
            ctx.lineTo(this.X + 2, this.Y - 7);
            ctx.lineTo(this.X + 2, this.Y - 12);
            ctx.fillStyle = "Black";
            ctx.fill();
        }, 10);
    }

    clearNeedle() {
        ctx.clearRect(this.X - 2, 0, 4, 12);
    }

    moveLeft() {
        this.clearNeedle();
        let newX = this.X - this.Step;
        this.X = newX > 3 ? newX : 3; // иголка не покинет видимую область игрового поля
    }

    moveRight() {
        this.clearNeedle();
        let newX = this.X + this.Step;
        this.X = newX < (gameZoneSize - 2) ? newX : (gameZoneSize - 2); // иголка не покинет видимую область игрового поля
    }
}

let needle = new Needle(gameZoneSize / 2);
needle.drawNeedle();

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 37) {
        needle.moveLeft();
    } else if (e.keyCode === 39) {
        needle.moveRight();
    }
})



// Ветер
class Wind {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
        this.IsRight = (x == 0) ? true : false;
        this.IsBlow = false;
    }

    clearWindBlow() {
        ctx.clearRect(this.X - 30, this.Y - 30, 60, 60);
    }

    runWindBlow() {
        this.IsBlow = true;
        this.windBlowTimeout = setInterval(() => {
            this.clearWindBlow();
            if (this.IsRight) {
                this.drawWindBlowRight()
            } else {
                this.drawWindBlowLeft()
            };
        }, 10);

        // анимация выдвижения ветра
        let windAnimationTimeout = setInterval(() => {
            if (this.IsRight) {
                this.X = this.X + 10;
            } else {
                this.X = this.X - 10;
            }
        }, 1000);

        // ветер пропадает через 3 секунды
        setTimeout(() => {
            clearTimeout(windAnimationTimeout);
            clearTimeout(this.windBlowTimeout);
            this.clearWindBlow();
            this.IsBlow = false;
        }, 3000);
    }

    drawWindBlowLeft() {
        ctx.strokeStyle = "Blue";
        ctx.beginPath();
        ctx.arc(this.X + 20, this.Y, 30, Math.PI * 5 / 6, Math.PI * 7 / 6, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.X + 30, this.Y, 30, Math.PI * 4 / 6, Math.PI * 8 / 6, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.X + 43, this.Y, 30, Math.PI * 3 / 6, Math.PI * 9 / 6, false);
        ctx.stroke();
    }

    drawWindBlowRight() {
        ctx.strokeStyle = "Blue";
        ctx.beginPath();
        ctx.arc(this.X - 20, this.Y, 30, Math.PI * 11 / 6, Math.PI * 13 / 6, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.X - 30, this.Y, 30, Math.PI * 10 / 6, Math.PI * 14 / 6, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.X - 43, this.Y, 30, Math.PI * 9 / 6, Math.PI * 15 / 6, false);
        ctx.stroke();
    }
}

let getRandomNumber = function (from, to) {
    return Math.floor(Math.random() * (to - from)) + from;
}

// Запуск ветра в слуайный момент слева или справа
setTimeout(() => {
    let rightOrLeft = getRandomNumber(0, 1);
    let X = rightOrLeft == 0 ? 0 : 300;    
    let wind = new Wind(X, 150);
    wind.runWindBlow();
}, getRandomNumber(1, 60) * 1000);



// Описание шарика и зачет очков
class Balloon {
    constructor(x, y, radius, color, speed) {
        this.X = x;
        this.Y = y;
        this.Radius = radius;
        this.Color = color;
        this.Speed = speed;
    }

    drawBalloon() {
        if (!this.isBalloonPopped()) // проверка не попал ли шарик на кончик иголки
        {
            ctx.beginPath();
            ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.Color;
            ctx.fill();
        }
    }

    clearBalloon() {
        ctx.clearRect(this.X - this.Radius, this.Y - this.Radius + this.Speed, this.Radius * 2, this.Radius * 2);
    }

    runBalloon() {
        this.balloonTimeout = setInterval(() => {
            this.clearBalloon();
            this.Y = this.Y - this.Speed;
            this.drawBalloon();
        }, 50);
    }

    isBalloonPopped() {
        if (needle.Y - this.Radius <= this.Y && this.Y <= needle.Y + this.Radius) {
            if (needle.X - this.Radius <= this.X && this.X <= needle.X + this.Radius) {
                clearTimeout(this.balloonTimeout);
                this.clearBalloon();
                gameScore++;

                return true;
            }
        }
        return false;
    }
}

// Генирация параметров шарика случайным образом
let balloonsColors = ["Red", "Orange", "Yellow", "Green", "Aqua", "Blue", "DarkViolet"];
let createRandomBalloon = function (acceleration) {
    let randomRadius = getRandomNumber(10, 22);
    let randomX = getRandomNumber(randomRadius, gameZoneSize - randomRadius); // шарик всегда вмещается в ширину игрового поля
    let startY = gameZoneSize + randomRadius; // шарик появляется за видимой областью игрового поля
    let randomColor = balloonsColors[getRandomNumber(0, balloonsColors.length)];
    let randomSpeed = getRandomNumber(1, 3);

    let balloon = new Balloon(randomX, startY, randomRadius, randomColor, randomSpeed + acceleration);
    balloonsCount++;
    balloon.runBalloon();
}



// Создание потока шариков
let ballonsFlowTimeoutId = 0;
let acceleration = 1;

createRandomBalloon(acceleration);
createBalloonsFlow = function () {
    clearTimeout(ballonsFlowTimeoutId);

    ballonsFlowTimeoutId = setInterval(() => {
        acceleration = acceleration + 0.09;
        createRandomBalloon(acceleration / 2); // приращение скорости + 0.05px за шаг

        createBalloonsFlow();
    }, 3500 / acceleration); // уменьшение времени таймаута, чтобы шарики выпускались чаще
}

createBalloonsFlow();