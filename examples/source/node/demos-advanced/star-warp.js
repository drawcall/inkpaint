var app = new InkPaint.Application(800, 600, { backgroundColor: 0x000000 });
document.body.appendChild(app.view);

module.exports = app;


// Get the texture for rope.
var starTexture = InkPaint.Texture.fromImage(paths('source/assets/star.png'));

var starAmount = 1000;
var cameraZ = 0;
var fov = 20;
var baseSpeed = 0.025;
var speed = 0;
var warpSpeed = 0;
var starStretch = 5;
var starBaseSize = 0.05;


// Create the stars
var stars = [];
for (var i = 0; i < starAmount; i++) {
    var star = {
        sprite: new InkPaint.Sprite(starTexture),
        z: 0,
        x: 0,
        y: 0
    };
    star.sprite.anchor.x = 0.5;
    star.sprite.anchor.y = 0.7;
    randomizeStar(star, true);
    app.stage.addChild(star.sprite);
    stars.push(star);
}

function randomizeStar(star, initial) {
    star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    var deg = Math.random() * Math.PI * 2;
    var distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
}

// Change flight speed every 5 seconds
setInterval(function() {
    warpSpeed = warpSpeed > 0 ? 0 : 1;
}, 5000);

// Listen for animate update
var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function(delta) {
    app.render();
    // Simple easing. This should be changed to proper easing function when used for real.
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (var i = 0; i < starAmount; i++) {
        var star = stars[i];
        if (star.z < cameraZ) randomizeStar(star);

        // Map star 3d position to 2d with really simple projection
        var z = star.z - cameraZ;
        star.sprite.x = star.x * (fov / z) * app.renderer.screen.width + app.renderer.screen.width / 2;
        star.sprite.y = star.y * (fov / z) * app.renderer.screen.width + app.renderer.screen.height / 2;

        // Calculate star scale & rotation.
        var dxCenter = star.sprite.x - app.renderer.screen.width / 2;
        var dyCenter = star.sprite.y - app.renderer.screen.height / 2;
        var distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter + dyCenter);
        var distanceScale = Math.max(0, (2000 - z) / 2000);
        star.sprite.scale.x = distanceScale * starBaseSize;
        // Star is looking towards center so that y axis is towards center.
        // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
});
