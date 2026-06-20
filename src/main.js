import kaplay from "kaplay";
import "kaplay/global";


const k = kaplay({
    width: 700,
    height: 700,
    background: "#AACCD6",
    canvas: document.querySelector("#kaplay-game")
});

loadRoot("./"); // A good idea for Itch.io publishing later

loadSprite("bird", "sprites/bird.png");

setGravity(3200);

function createBird() {
    const bird = [
        sprite("bird"),
        scale(0.25),

        anchor("center"),
        pos(center()),
        rotate(90),

        area({ isSensor: true }),
        body(),
    ];

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

    add(bird);

    onClick(() => addKaboom(mousePos()));

    // onUpdate(() => {
    //     if (isKeyDown("space")) {

    //     }
    // });

    onKeyPress("up", () => {
        // bird.pos = pos(0, height());
        bird.pos.move(1, 1);
        debug.log("ts not working bro");
    })

    onKeyPress("down", () => {
        bird.pos = pos(0, 0);
        debug.log("ts not working bro 2");
    })
})

go("game_loop")