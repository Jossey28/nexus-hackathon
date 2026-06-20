import kaplay from "kaplay";
import "kaplay/global";


kaplay({
    // width: 700,
    // height: 700,
    background: "#AACCD6",
    canvas: document.querySelector("#kaplay-game")
});

loadRoot("./"); // A good idea for Itch.io publishing later

loadSprite("bird", "sprites/bird.png");

function createBird() {
    const bird = [
        sprite("bird"),
        // rect(50, 50),
        scale(0.25),

        anchor("center"),
        pos(center()),
        rotate(90),
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
})

go("game_loop")