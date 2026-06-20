import kaplay from "kaplay";
import "kaplay/global";

const GRAVITY = 200;

const UP_FORCE = 2000;
const DOWN_FORCE = 2000;

const k = kaplay({
    width: 700,
    height: 700,
    background: "#AACCD6",
    canvas: document.querySelector("#kaplay-game")
});

loadRoot("./"); // A good idea for Itch.io publishing later

loadSprite("bird", "sprites/bird.png");

setGravity(GRAVITY);

function createBird() {
    const bird = add([
        sprite("bird"),
        scale(0.25),

        anchor("center"),
        rotate(90),

        pos(center()),
        area(),
        body(),
    ]);

    return bird
}

function createBorders() {
    const floorThickness = 50;
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

    return [ceiling, ground]
}

scene("game_loop", () => {
    const [ceiling, ground] = createBorders();
    const bird = createBird();

    add(ceiling);
    add(ground);

    onClick(() => addKaboom(mousePos()));

    // onUpdate(() => {
    //     if (isKeyDown("space")) {

    //     }
    // });

    onKeyDown("up", () => {
        bird.vel.y -= dt() * UP_FORCE;
    })

    onKeyDown("down", () => {
        bird.vel.y += dt() * DOWN_FORCE;
    })
})

go("game_loop")