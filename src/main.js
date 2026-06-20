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

    const ceiling = [
        rect(width(), floorThickness),
        pos(0, 0),
        color(Color.fromHex("#8B5E3C")),
    ];

    const ground = [
        rect(width(), floorThickness),
        pos(0, height() - floorThickness),
        color(floorColor),
    ];

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
        if (bird.pos.y >= (height() - floorThickness) || bird.pos.y <= (floorThickness)) {
            debug.log("you just died");
            go("title_screen");
        }
    })

    add(ceiling);
    add(ground);

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
        text("Escape!!", { size: 40 }),
        color(BLACK),
        anchor("top"),
        pos(0, -100),
    ]);

    titleMenu.button = [
        ""
    ]

    onKeyPress(() => {
        go("game_loop");
    })
})

go("title_screen")