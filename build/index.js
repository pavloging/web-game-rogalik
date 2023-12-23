"use strict";
const SIZE_MAP = { X: 40, Y: 24 };
class Game {
    constructor(sizeMap) {
        this.sizeMap = sizeMap;
        this.map = [];
    }
    // ● Сгенерировать карту 40x24 и ● Залить всю карту стеной
    init() {
        // Получение элемента с классом field-box
        const field = document.querySelector(".field-box");
        if (!field)
            throw new Error("Class field is not found");
        // Расчет размеров стен
        const sizeWallX = Math.ceil(field.clientWidth / this.sizeMap.X); // 25.6 -> 26
        const sizeWallY = Math.ceil(field.clientHeight / this.sizeMap.Y); // 26.666 -> 27
        // Применение стилей
        const border = 2; // 2px
        field.style.gridTemplateColumns = `repeat(${this.sizeMap.X}, 1fr)`;
        field.style.gridTemplateRows = `repeat(${this.sizeMap.Y}, 1fr)`;
        field.style.border = `${border}px solid #d0d0d0;`;
        field.style.width = `${this.sizeMap.X * sizeWallX + border * 2}px`;
        field.style.height = `${this.sizeMap.Y * sizeWallY + border * 2}px`;
        const multWallXY = this.sizeMap.X * this.sizeMap.Y;
        const initMap = [];
        // Создание стен
        for (let i = 0; i < multWallXY; i++) {
            const newDiv = document.createElement("div");
            newDiv.className = "field";
            newDiv.style.width = `${sizeWallX}px`;
            newDiv.style.height = `${sizeWallY}px`;
            const newImg = document.createElement("img");
            newImg.src = "./images/tile-W.png";
            newImg.className = "field__img";
            newImg.id = `${i}`;
            newImg.style.width = `${sizeWallX}px`;
            newImg.style.height = `${sizeWallY}px`;
            newDiv.appendChild(newImg);
            field.appendChild(newDiv);
            initMap.push({ id: i, value: 1 });
        }
        // Создание двухмерного массива 40 на 24
        const twoDimArray = [];
        for (let i = 0; i < initMap.length; i += this.sizeMap.X) {
            let row = initMap.slice(i, i + this.sizeMap.X);
            twoDimArray.push(row);
        }
        this.map = twoDimArray;
    }
    // ● Разместить случайное количество (5 - 10) прямоугольных “комнат” со случайными размерами (3 - 8 клеток в длину и ширину)
    generateRandomRoom() {
        // Определяем количество комнат
        const randomCountRoom = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        // Определяем размер комнаты
        for (let i = 0; i < randomCountRoom; i++) {
            const sizeRoomBefore = 8;
            const sizeRoomFrom = 3;
            const randomRoomSizeX = Math.floor(Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)) + sizeRoomFrom;
            const randomRoomSizeY = Math.floor(Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)) + sizeRoomFrom;
            // Рандомно определяем начальные координаты
            const randomIdMapX = Math.floor(Math.random() * (SIZE_MAP.X - randomRoomSizeX));
            const randomIdMapY = Math.floor(Math.random() * (SIZE_MAP.Y - randomRoomSizeY));
            // Задаем от начальной точки длину и ширину от 3 до 8
            for (let index = 0; index < randomRoomSizeY; index++) {
                for (let i = 0; i < randomRoomSizeX; i++) {
                    this.map[randomIdMapY + index][randomIdMapX + i].value = 0;
                }
            }
            this.renderMap();
        }
    }
    // ●	Разместить случайное количество (3 - 5 по каждому направлению) вертикальных и горизонтальных проходов шириной в 1 клетку
    generateRandomVerticalHorizontalLine() {
        const countLineX = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // 5-3
        const countLineY = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // 5-3
        // Чертим линии по оси Y
        for (let i = 0; i < countLineX; i++) {
            const coordinateStartLineX = Math.floor(Math.random() * this.sizeMap.X); // 0 - 40
            console.log('coordinateStartLineX', coordinateStartLineX);
            for (let index = 0; index < this.sizeMap.Y; index++) { // 0 - 24
                this.map[index][coordinateStartLineX].value = 0;
            }
        }
        // Чертим линии по оси X
        for (let i = 0; i < countLineY; i++) {
            const coordinateStartLineY = Math.floor(Math.random() * this.sizeMap.Y); // 0 - 24
            console.log('coordinateStartLineY', coordinateStartLineY);
            for (let index = 0; index < this.sizeMap.X; index++) { // 0 - 40
                this.map[coordinateStartLineY][index].value = 0;
            }
        }
        this.renderMap();
    }
    spavnHero() {
        for (const coordY of this.map) {
            for (const item of coordY) {
                if (item.value === 0) {
                    const img = document.getElementById(`${item.id}`);
                    item.value = 2;
                    return img.src = 'images/tile-P.png';
                }
            }
        }
    }
    pressButton() {
        addEventListener("keydown", (event) => {
            const isArrow = event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown";
            if (isArrow)
                press(event.key);
        });
        const press = (key) => {
            console.log(key);
            // Допилить ходьбу
        };
    }
    renderMap() {
        // Если value элемента поменялось, мы делаем перерендер
        this.map.forEach((element) => {
            element.forEach((item) => {
                if (item.value === 0) {
                    const img = document.getElementById(`${item.id}`);
                    img.src = 'images/tile-.png';
                }
                else {
                    const img = document.getElementById(`${item.id}`);
                    img.src = 'images/tile-W.png';
                }
            });
        });
    }
}
const game = new Game(SIZE_MAP);
game.init();
game.generateRandomVerticalHorizontalLine();
game.generateRandomRoom();
game.pressButton();
game.spavnHero();
