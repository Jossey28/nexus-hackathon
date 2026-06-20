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
    color(RED),

    anchor("center"),
    pos(center()),
    rotate(90),
])



scene("display_bird", () => {
    add([

    ]);
})

onUpdate(() => {
    if (isKeyDown("h")) {

    }
})

onKeyPress("space", () => {
    debug.log("spaced");
});

onAdd("shape", () => {
    debug.log("shaped");
});

// k.onClick(() => k.addKaboom(k.mousePos()));

k.go("display_bird")