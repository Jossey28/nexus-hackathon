import kaplay from "kaplay";
import "kaplay/global";

const GRAVITY = 150;

const UP_FORCE = 500;
const DOWN_FORCE = 500;

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

scene("game_loop", () => {
    const floorThickness = 25;
    const floorColor = Color.fromHex("#8B5E3C")

    const ceiling = add([
        rect(width(), floorThickness),
        pos(0, 0),
        color(Color.fromHex("#8B5E3C")),
    ]);

    const ground = add([
        rect(width(), floorThickness),
        pos(0, height() - floorThickness),
        color(floorColor),
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

    bird.onUpdate(() => {
        if ((bird.pos.y) >= (height() - floorThickness) || (bird.pos.y) <= (floorThickness)) {
            debug.log("you just died");
            go("title_screen");
        }
    })


    onClick(() => addKaboom(mousePos()));

    onButtonDown("flyUp", () => {
        bird.vel.y -= dt() * UP_FORCE;
    })

    onButtonDown("flyDown", () => {
        bird.vel.y += dt() * DOWN_FORCE;
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
        rect(400, 400, { radius: 10 }),
        color(255, 255, 255),
        outline(4),
        anchor("center"),
        pos(center()),
    ]);

    const title = instructionsMenu.add([
        text("Instructions", { size: 40 }),
        color(BLACK),
        anchor("top"),
        pos(0, -instructionsMenu.height / 2),
    ]);

    title.add([
        text("Words and blabber"),
        color(BLACK),
        anchor("top"),
        pos(0, title.height),
    ])

    instructionsMenu.add([
        anchor("center"),
        pos(0, instructionsMenu.height / 2.5),
        scale(1),

        {
            add() {
                this.btnWidth = instructionsMenu.width - 64;
                this.btnHeight = this.height + 24;

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