const SIZE_MAP = { X: 40, Y: 24 };

type TType = "free" | "wall" | "hero" | "NPC" | "sword" | "heal";

interface IMap {
    id: number;
    type: TType;

    x?: number;
    y?: number; 
    hp?: number;
}

interface IHero {
    x: number;
    y: number;
    hp: number;
    strength: number;
}

class Game {
    public sizeMap;
    public map: Array<Array<IMap>>;
    public hero: IHero;

    constructor(sizeMap: { X: number; Y: number }) {
        this.sizeMap = sizeMap;
        this.map = [];
        this.hero = { x: 0, y: 0, hp: 0, strength: 0 };
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

        for (let i = 0; i < initMap.length; i += this.sizeMap.Y) {
            let row = initMap.slice(i, i + this.sizeMap.Y).reverse();
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

            const randomRoomSizeX = Math.floor(Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)) + sizeRoomFrom;
            const randomRoomSizeY = Math.floor(Math.random() * (sizeRoomBefore - sizeRoomFrom + 1)) + sizeRoomFrom;

            // Рандомно определяем начальные координаты
            const randomIdMapX = Math.floor(Math.random() * (SIZE_MAP.X - randomRoomSizeX));
            const randomIdMapY = Math.floor(Math.random() * (SIZE_MAP.Y - randomRoomSizeY));

            // Задаем от начальной точки длину и ширину от 3 до 8
            for (let index = 0; index < randomRoomSizeX; index++) {
                for (let i = 0; i < randomRoomSizeY; i++) {
                    this.map[randomIdMapX + index][randomIdMapY + i].type = "free";
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

            for (let index = 0; index < this.sizeMap.Y; index++) {
                // 0 - 24
                this.map[coordinateStartLineX][index].type = "free";
            }
        }
        // Чертим линии по оси X
        for (let i = 0; i < countLineY; i++) {
            const coordinateStartLineY = Math.floor(Math.random() * this.sizeMap.Y); // 0 - 24

            for (let index = 0; index < this.sizeMap.X; index++) {
                // 0 - 40
                this.map[index][coordinateStartLineY].type = "free";
            }
        }

        this.renderMap();
    }

    // ●	Поместить героя в случайное пустое место
    spawnHero() {
        for (let index = 0; index < this.sizeMap.X; index++) {
            for (let i = 0; i < this.sizeMap.Y; i++) {
                const block = this.map[index][i];
                if (block.type === "free") {
                    this.hero = { x: index, y: i, hp: 100, strength: 25 };
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
        const freeBlock = this.map.map((item) =>
            item.filter((el) => el.type === "free")
        );

        // Геренирем количество элементов
        for (let index = 0; index < count; index++) {
            const spawnY = Math.floor(Math.random() * freeBlock.length);
            const spawnX = Math.floor(Math.random() * freeBlock[spawnY].length);

            // Берем наше поле
            const fieldsFree = this.map.find((item) =>
                item.find((el) => freeBlock[spawnY][spawnX].id === el.id)
            );
            if (!fieldsFree) return;
            const field = fieldsFree.find(
                (item) => item.id === freeBlock[spawnY][spawnX].id
            );
            if (!field) return;

            // Добавляем поле в локацию
            this.map = this.map.map((row, i) => {
                return row.map((el, index) => {
                    if (el.id === field.id) {
                        // Добавляем NPC 100 hp
                        if (type === "NPC")
                            return { id: field.id, x: i, y: index, type: type, hp: 100 };
                        else return { id: field.id, type: type };
                    } else {
                        return el;
                    }
                });
            });
        }
        this.renderMap();
    }

    // ●	Сделать возможность передвижения героя клавишами WASD (влево-вверх-вниз-вправо) ●	Сделать возможность атаки клавишей пробел ВСЕХ противников находящихся на соседних клетках
    pressButton() {
        addEventListener("keydown", (event) => {
            const isArrow =
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown";
            if (isArrow) pressArray(event.key);

            const isSpace = event.key === " ";
            if (isSpace) pressSpace();
        });

        const pressArray = (key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown") => {
            this.map[this.hero.x][this.hero.y].type = "free";

            const forSounds = (type: TType) => {
                if (type === "sword") this.playSound("sounds/sword.mp3");
                if (type === "heal") this.playSound("sounds/heal.mp3");
                if (type === "free") this.playSound("sounds/step.mp3");
            };

            if (key === "ArrowLeft") {
                const type = this.map[this.hero.x - 1][this.hero.y].type;
                if (type === "wall" || type === "NPC") return;
                if (type === 'heal' && this.hero.hp < 100) this.hero.hp = this.hero.hp + 25
                if (type === "sword") this.hero.strength = this.hero.strength + 25
                forSounds(type);
                this.hero.x = this.hero.x - 1;
            }
            if (key === "ArrowRight") {
                const type = this.map[this.hero.x + 1][this.hero.y].type;
                if (type === "wall" || type === "NPC") return;
                if (type === 'heal' && this.hero.hp < 100) this.hero.hp = this.hero.hp + 25
                if (type === "sword") this.hero.strength = this.hero.strength + 25
                forSounds(type);
                this.hero.x = this.hero.x + 1;
            }
            if (key === "ArrowUp") {
                const type = this.map[this.hero.x][this.hero.y + 1].type;
                if (type === "wall" || type === "NPC") return;
                if (type === 'heal' && this.hero.hp < 100) this.hero.hp = this.hero.hp + 25
                if (type === "sword") this.hero.strength = this.hero.strength + 25
                forSounds(type);
                this.hero.y = this.hero.y + 1;
            }
            if (key === "ArrowDown") {
                const type = this.map[this.hero.x][this.hero.y - 1].type;
                if (type === "wall" || type === "NPC") return;
                if (type === 'heal' && this.hero.hp < 100) this.hero.hp = this.hero.hp + 25
                if (type === "sword") this.hero.strength = this.hero.strength + 25
                forSounds(type);
                this.hero.y = this.hero.y - 1;
            }

            this.map[this.hero.x][this.hero.y].type = "hero";
            this.renderMap();
        };

        const pressSpace = () => {
            const coord = {
                xt: this.map[this.hero.x + 1][this.hero.y],
                xb: this.map[this.hero.x - 1][this.hero.y],
                yt: this.map[this.hero.x][this.hero.y + 1],
                yb: this.map[this.hero.x][this.hero.y - 1],
            };
            const isNPC =
                coord.xt.type === "NPC" ||
                coord.xb.type === "NPC" ||
                coord.yt.type === "NPC" ||
                coord.yb.type === "NPC";

            if (!isNPC) {
                this.playSound("sounds/not-hit.mp3");
                return;
            }

            if (coord.xt.type === "NPC")
                this.map[this.hero.x + 1][this.hero.y].hp = coord.xt.hp! - this.hero.strength;
            if (coord.xb.type === "NPC")
                this.map[this.hero.x - 1][this.hero.y].hp = coord.xb.hp! - this.hero.strength;
            if (coord.yt.type === "NPC")
                this.map[this.hero.x][this.hero.y + 1].hp = coord.yt.hp! - this.hero.strength;
            if (coord.yb.type === "NPC")
                this.map[this.hero.x][this.hero.y - 1].hp = coord.yb.hp! - this.hero.strength;

            const isDeath =
                this.map[this.hero.x + 1][this.hero.y].hp === 0 ||
                this.map[this.hero.x - 1][this.hero.y].hp === 0 ||
                this.map[this.hero.x][this.hero.y + 1].hp === 0 ||
                this.map[this.hero.x][this.hero.y - 1].hp === 0;
            if (isDeath) this.playSound("sounds/death.mp3");
            else this.playSound("sounds/hit.mp3");

            this.renderMap();
        };
    }
    // ●	Сделать случайное передвижение противников (на выбор, либо передвижение по одной случайной оси, либо случайное направление каждый ход, либо поиск и атака героя) ●	Сделать атаку героя противником, если герой находится на соседней клетке с противником
    autoMoveNPC(time: number) {
        // 1. Находим NPC
        // 2. Определяем свободные поля
        // 3. Рандомно выбираем поле и идем туда

        setInterval(() => {
            const NPC = []

            for (let i = 0; i < this.sizeMap.X; i++) {
                for (let index = 0; index < this.sizeMap.Y; index++) {
                    if (this.map[i][index].type === "NPC") NPC.push(this.map[i][index])
                }
            }
    
            for (let i = 0; i < NPC.length; i++) {
                const item = NPC[i];
                const freeBlock: Array<string> = []

                if(!item.x || !item.y) continue 

                const right = this.map[item.x + 1]?.[item.y]
                const left = this.map[item.x - 1]?.[item.y]
                const top = this.map[item.x]?.[item.y + 1]
                const bottom = this.map[item.x]?.[item.y - 1]

                if (right?.type === 'free') freeBlock.push('right')
                if (left?.type === 'free') freeBlock.push('left')
                if (top?.type === 'free') freeBlock.push('top')
                if (bottom?.type === 'free') freeBlock.push('bottom')

                const randomBlock = Math.floor(Math.random() * freeBlock.length);

                // Атака героя противниками
                const attackNPC = (item: IMap) => {
                    if(!item.x || !item.y) return 

                    const rightHero = this.map[item.x + 1]?.[item.y]
                    const leftHero = this.map[item.x - 1]?.[item.y]
                    const topHero = this.map[item.x]?.[item.y + 1]
                    const bottomHero = this.map[item.x]?.[item.y - 1]

                    if(rightHero?.type === "hero" || leftHero?.type === "hero" || topHero?.type === "hero" || bottomHero?.type === "hero") {
                        this.hero.hp = this.hero.hp - 25
                        this.playSound("sounds/hit-hero.mp3")
                    }
                }

                const side = freeBlock[randomBlock]
                if (side === 'right'){
                    this.map[item.x][item.y] = {...this.map[item.x + 1][item.y], id: this.map[item.x][item.y].id}
                    this.map[item.x + 1][item.y] = {...item, id: this.map[item.x + 1][item.y].id, x: item.x + 1}
                    attackNPC(this.map[item.x + 1][item.y])
                } 
                else if (side === 'left'){
                    this.map[item.x][item.y] = {...this.map[item.x - 1][item.y], id: this.map[item.x][item.y].id}
                    this.map[item.x - 1][item.y] = {...item, id: this.map[item.x - 1][item.y].id, x: item.x - 1}
                    attackNPC(this.map[item.x - 1][item.y])
                }
                else if (side === 'top'){
                    this.map[item.x][item.y] = {...this.map[item.x][item.y + 1], id: this.map[item.x][item.y].id}
                    this.map[item.x][item.y + 1] = {...item, id: this.map[item.x][item.y + 1].id, y: item.y + 1}
                    attackNPC(this.map[item.x][item.y + 1])
                }
                else if (side === 'bottom'){
                    this.map[item.x][item.y] = {...this.map[item.x][item.y - 1], id: this.map[item.x][item.y].id}
                    this.map[item.x][item.y - 1] = {...item, id: this.map[item.x][item.y - 1].id, y: item.y - 1}
                    attackNPC(this.map[item.x][item.y - 1])
                }
                
                if (side.length !== 0) this.playSound("sounds/step-npc.mp3")
            }
    
            this.renderMap()
        }, time)
    }

    findMapId(id: number) {
        return this.map
            .map((row) => {
                return row.filter((el) => {
                    if (el.id === id) return el;
                });
            })
            .filter((item) => item.length !== 0)[0][0];
    }

    playSound(url: string) {
        const audio = new Audio();
        audio.src = url;
        audio.play();
    }

    renderMap() {
        // Если type элемента поменялось, мы делаем перерендер
        this.map.forEach((element, index) => {
            element.forEach((item: IMap, i) => {
                const img: any = document.getElementById(`${item.id}`);

                switch (item.type) {
                    case "free":
                        const divFree = img.parentElement;
                        divFree.classList = "field__img";
                        img.src = "images/tile-.png";
                        break;

                    case "wall":
                        img.src = "images/tile-W.png";
                        break;

                    case "hero":
                        const fieldHero = document.querySelector('.field') as HTMLElement
                        const divHero = img.parentElement;
                        divHero.classList.add("hero");
                        divHero.style.width = `${fieldHero.offsetWidth*this.hero.hp!/100}px`;
                        if (this.hero.hp === 0) {
                            console.log('ENG GAME')
                            window.location.reload()
                        } else img.src = "images/tile-P.png";
                        
                        break;

                    case "NPC":
                        const fieldNPC = document.querySelector('.field') as HTMLElement
                        const divNPC = img.parentElement;
                        divNPC.classList.add("NPC");
                        divNPC.style.width = `${fieldNPC.offsetWidth*item.hp!/100}px`;
                        if (item.hp! <= 0) {
                            img.src = "images/tile-.png";
                            divNPC.classList = "field__img";
                            divNPC.style.width = `${fieldNPC.offsetWidth}px`

                            this.map[index][i] = { id: item.id, type: "free" }
                            this.renderMap()
                        } else img.src = "images/tile-E.png";
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

    static create() {
        const game = new Game(SIZE_MAP);
        game.init();
        game.generateRandomVerticalHorizontalLine();
        game.generateRandomRoom();
        game.spawnHero();
        game.spawnItems("NPC", 10);
        game.spawnItems("sword", 2);
        game.spawnItems("heal", 10);
        game.pressButton();
        game.autoMoveNPC(2000)
    }
}

Game.create()