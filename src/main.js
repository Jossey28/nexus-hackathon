import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix


const k = kaplay({
    // width: 700,
    // height: 700,
    background: "#AACCD6",
    canvas: document.querySelector("#kaplay-game")
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

k.loadSprite("bird", "sprites/bird.png");

const bird = add([
    sprite("bird"),
    scale(0.25),

    anchor("center"),
    pos(center()),
    rotate(90),
])

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

    add(ceiling);
    add(ground);
})



// k.onClick(() => k.addKaboom(k.mousePos()));

k.go("game_loop")