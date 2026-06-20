import kaplay from "kaplay";
import "kaplay/global";

const GRAVITY = 0;

const MAX_UP_FORCE = -10;
const MAX_DOWN_FORCE = 10;

const k = kaplay({
    width: 700,
    height: 700,
    background: "#AACCD6",
    canvas: document.querySelector("#kaplay-game"),

    buttons: {
        "flyUp": {
            keyboard: ["up", "w"],
            mouse: ["left"]
        },
        "flyDown": {
            keyboard: ["down", "d"],
            mouse: ["right"]
        }
    }
});

loadRoot("./"); // A good idea for Itch.io publishing later

loadSprite("bird", "sprites/bird.png");

setGravity(GRAVITY);

window.deathPixel = document.createElement("div");
window.deathPixel.textContent = "alive";

scene("game_loop", () => {
    const floorThickness = 25;
    const floorColor = Color.fromHex("#8B5E3C")

    const ceiling = add([
        rect(width(), floorThickness),
        pos(0, 0),
        color(Color.fromHex("#8B5E3C")),
        area({ isSensor: true }),
    ]);

    const ground = add([
        rect(width(), floorThickness),
        pos(0, height() - floorThickness),
        color(floorColor),
        area(),
        area({ isSensor: true }),
    ]);


    const stalactite = add([
        rotate(180),
        pos(0, (floorThickness - 10)),

        polygon(
            [
                vec2(-15, 10),
                vec2(15, 10),
                vec2(0, -10),
            ]
        ),

        area({
            shape: new Polygon(
                [
                    vec2(-15, 10),
                    vec2(15, 10),
                    vec2(0, -10),
                ]
            )
        }),

        color(RED),
    ])

    const bird = add([
        sprite("bird"),
        scale(0.25),

        anchor("center"),
        rotate(90),

        pos(center()),
        area(),
        body(),
    ]);

    // bird.onUpdate(() => {
    //     if ((bird.pos.y) >= (height() - floorThickness) || (bird.pos.y) <= (floorThickness)) {

    //     }
    // })

    bird.onCollide(() => {
        debug.log("you just died");

        window.deathPixel.textContent = "dead";
        go("title_screen");
    })


    onClick(() => addKaboom(mousePos()));

    onButtonDown("flyUp", () => {
        bird.applyImpulse(vec2(0, MAX_UP_FORCE * Math.random()));
    })

    onButtonDown("flyDown", () => {
        bird.applyImpulse(vec2(0, MAX_DOWN_FORCE * Math.random()));
    })
})

scene("title_screen", () => {
    const titleMenu = add([
        rect(300, 260, { radius: 10 }),
        color(255, 255, 255),
        outline(4),
        anchor("center"),
        pos(center()),
    ]);

    titleMenu.add([
        text("Bird", { size: 40 }),
        color(BLACK),
        anchor("top"),
        pos(0, -100),
    ]);

    titleMenu.buttons = [
        ["Escape!!", () => go("game_loop"), rgb(244, 66, 94)],
        ["How to play", () => go("instructions")],
    ].map(([txt, fn, bg], i) =>
        titleMenu.add([
            anchor("center"),
            pos(0, 60 * i - 20),
            {
                add() {
                    this.btnWidth = titleMenu.width - 64;
                    this.btnHeight = this.height + 24;

                    this.use(
                        area({
                            shape: new Rect(vec2(0), this.btnWidth, this.btnHeight),
                        })
                    );

                    fn && this.onClick(fn);
                    this.onHover(() => tween(vec2(1), vec2(1.06), 0.15, s => this.scale = s, easings.easeOutBack));
                    this.onHoverEnd(() => tween(this.scale, vec2(1), 0.15, s => this.scale = s, easings.easeOutBack));
                },

                draw() {
                    drawRect({
                        width: this.btnWidth,
                        height: this.btnHeight,
                        color: bg ?? rgb(0, 127, 255),
                        radius: 8,
                        outline: { width: 4, color: BLACK },
                        anchor: this.anchor,
                    });
                },
            },
            text(txt, { size: 22 }),
            scale(1),
        ])
    );

})

scene("instructions", () => {
    const instructionsMenu = add([
        rect(400, 300, { radius: 10 }),
        color(255, 255, 255),
        outline(4),
        anchor("center"),
        pos(center()),
    ]);

    const title = instructionsMenu.add([
        text("Instructions", { size: 40 }),
        color(BLACK),
        anchor("top"),
        pos(0, -instructionsMenu.height / 2.3),
    ]);

    title.add([
        text("w/up/left-click => hold to increase upwards velocity\n\ns/down/right-click => hold to increase downwards velocity.\n\nTry not to get hit!!", { size: 19, width: instructionsMenu.width - instructionsMenu.width / 20 }),
        color(BLACK),
        anchor("top"),
        pos(instructionsMenu.width / 20, title.height * 1.5),
    ])

    instructionsMenu.add([
        anchor("center"),
        pos(0, instructionsMenu.height / 2.5),
        scale(1),

        {
            add() {
                this.btnWidth = instructionsMenu.width - 64;
                this.btnHeight = this.height + 20;

                this.use(
                    area({
                        shape: new Rect(vec2(0), this.btnWidth, this.btnHeight),
                    })
                );

                this.onClick(() => go("title_screen"));
                this.onHover(() => tween(vec2(1), vec2(1.06), 0.15, s => this.scale = s, easings.easeOutBack));
                this.onHoverEnd(() => tween(this.scale, vec2(1), 0.15, s => this.scale = s, easings.easeOutBack));
            },

            draw() {
                drawRect({
                    width: this.btnWidth,
                    height: this.btnHeight,
                    color: rgb(0, 127, 255),
                    radius: 8,
                    outline: { width: 4, color: BLACK },
                    anchor: this.anchor,
                });
            },
        },

        text("Main Menu", { size: 22 }),
    ])
})

go("title_screen")