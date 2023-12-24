const SIZE_MAP = { X: 40, Y: 24 };

type TType = "free" | "wall" | "hero" | "NPC" | "sword" | "heal"

interface IMap {
    id: number;
    type: TType;
}

interface IHero {
    x: number;
    y: number;
}

class Game {
    public sizeMap;
    public map: Array<Array<IMap>>;
    public hero: IHero;

    constructor(sizeMap: { X: number; Y: number }) {
        this.sizeMap = sizeMap;
        this.map = [];
        this.hero = { x: 0, y: 0 };
    }

    // ●    Сгенерировать карту 40x24 ● Залить всю карту стеной
    init() {
        // Получение элемента с классом field-box
        const field = document.querySelector(".field-box") as HTMLElement;
        if (!field) throw new Error("Class field is not found");

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
        const initMap: Array<IMap> = [];
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
            initMap.push({ id: i, type: "wall" });
        }

        // Создание двухмерного массива 40 на 24
        const twoDimArray = [];

        for (let i = 0; i < initMap.length; i += this.sizeMap.X) {
            let row = initMap.slice(i, i + this.sizeMap.X);
            twoDimArray.push(row);
        }
        this.map = twoDimArray;
    }

    // ●    Разместить случайное количество (5 - 10) прямоугольных “комнат” со случайными размерами (3 - 8 клеток в длину и ширину)
    generateRandomRoom() {
        // Определяем количество комнат
        const randomCountRoom = Math.floor(Math.random() * (10 - 5 + 1)) + 5;

        // Определяем размер комнаты
        for (let i = 0; i < randomCountRoom; i++) {
            const sizeRoomBefore = 8;
            const sizeRoomFrom = 3;

            const randomRoomSizeX =
                Math.floor(
                    Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)
                ) + sizeRoomFrom;
            const randomRoomSizeY =
                Math.floor(
                    Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)
                ) + sizeRoomFrom;

            // Рандомно определяем начальные координаты
            const randomIdMapX = Math.floor(
                Math.random() * (SIZE_MAP.X - randomRoomSizeX)
            );
            const randomIdMapY = Math.floor(
                Math.random() * (SIZE_MAP.Y - randomRoomSizeY)
            );

            // Задаем от начальной точки длину и ширину от 3 до 8
            for (let index = 0; index < randomRoomSizeY; index++) {
                for (let i = 0; i < randomRoomSizeX; i++) {
                    this.map[randomIdMapY + index][randomIdMapX + i].type =
                        "free";
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
            const coordinateStartLineX = Math.floor(
                Math.random() * this.sizeMap.X
            ); // 0 - 40

            for (let index = 0; index < this.sizeMap.Y; index++) {
                // 0 - 24
                this.map[index][coordinateStartLineX].type = "free";
            }
        }
        // Чертим линии по оси X
        for (let i = 0; i < countLineY; i++) {
            const coordinateStartLineY = Math.floor(
                Math.random() * this.sizeMap.Y
            ); // 0 - 24

            for (let index = 0; index < this.sizeMap.X; index++) {
                // 0 - 40
                this.map[coordinateStartLineY][index].type = "free";
            }
        }

        this.renderMap();
    }

    // ●	Поместить героя в случайное пустое место
    spawnHero() {
        for (let index = 0; index < this.sizeMap.Y; index++) {
            for (let i = 0; i < this.sizeMap.X; i++) {
                const block = this.map[i][index];
                if (block.type === "free") {
                    this.hero = { x: i, y: index };
                    const img: any = document.getElementById(`${block.id}`);
                    block.type = "hero";
                    return (img.src = "images/tile-P.png");
                }
            }
        }
    }

    // ●	Поместить 10 противников с случайные пустые места  ●	Разместить мечи (2 шт) и зелья здоровья (10 шт) в пустых местах
    spawnItems(type: TType, count: number) {
        // Ищем пустые места
        const freeBlock = this.map.map((item) => item.filter((el) => el.type === "free"));

        // Геренирем количество элементов
        for (let index = 0; index < count; index++) {
            const spawnY = Math.floor(Math.random() * freeBlock.length);
            const spawnX = Math.floor(Math.random() * freeBlock[spawnY].length);

            // Берем наше поле
            const fieldsFree = this.map.find((item) =>item.find((el) => freeBlock[spawnY][spawnX].id === el.id));
            if (!fieldsFree) return;
            const field = fieldsFree.find((item) => item.id === freeBlock[spawnY][spawnX].id);
            if (!field) return;

            // Добавляем поле в локацию
            this.map = this.map.map((row) => {
                return row.map((el) => {
                    if (el.id === field.id) {
                        return { id: field.id, type: type };
                    } else {
                        return el;
                    }
                });
            });
        }
        this.renderMap();
    }

    // ●	Сделать возможность передвижения героя клавишами WASD (влево-вверх-вниз-вправо)
    pressButton() {
        addEventListener("keydown", (event) => {
            const isArrow =
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown";
            if (isArrow) press(event.key);
        });

        const press = (
            key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown"
        ) => {
            this.map[this.hero.x][this.hero.y].type = "free";

            if (key === "ArrowLeft") {
                const type = this.map[this.hero.x][this.hero.y - 1].type
                if (type === "wall" || type === "NPC") return;
                this.hero.y = this.hero.y - 1;
            }
            if (key === "ArrowRight") {
                const type = this.map[this.hero.x][this.hero.y + 1].type
                if (type === "wall" || type === "NPC") return;
                this.hero.y = this.hero.y + 1;
            }
            if (key === "ArrowUp") {
                const type = this.map[this.hero.x - 1][this.hero.y].type 
                if (type === "wall" || type === "NPC") return;
                this.hero.x = this.hero.x - 1;
            }
            if (key === "ArrowDown") {
                const type = this.map[this.hero.x + 1][this.hero.y].type
                if (type === "wall" || type === "NPC") return;
                this.hero.x = this.hero.x + 1;
            }

            this.map[this.hero.x][this.hero.y].type = "hero";
            this.renderMap();
        };
    }

    renderMap() {
        // Если type элемента поменялось, мы делаем перерендер
        this.map.forEach((element) => {
            element.forEach((item: IMap) => {
                const img: any = document.getElementById(`${item.id}`);

                switch (item.type) {
                    case "free":
                        img.src = "images/tile-.png";
                        break;

                    case "wall":
                        img.src = "images/tile-W.png";
                        break;

                    case "hero":
                        img.src = "images/tile-P.png";
                        break;

                    case "NPC":
                        img.src = "images/tile-E.png";
                        break;
                    
                    case "sword":
                        img.src = "images/tile-SW.png";
                        break;
                
                    case "heal":
                        img.src = "images/tile-HP.png";
                        break;

                    default:
                        break;
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
game.spawnHero();
game.spawnItems("NPC", 10);
game.spawnItems("sword", 2);
game.spawnItems("heal", 10);

