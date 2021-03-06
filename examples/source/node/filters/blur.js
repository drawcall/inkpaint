var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;


var bg = InkPaint.Sprite.fromImage(paths('source/assets/pixi-filters/bg_depth_blur.jpg'));
bg.width = app.screen.width;
bg.height = app.screen.height;
app.stage.addChild(bg);

var littleDudes = InkPaint.Sprite.fromImage(paths('source/assets/pixi-filters/depth_blur_dudes.jpg'));
littleDudes.x = (app.screen.width / 2) - 315;
littleDudes.y = 200;
app.stage.addChild(littleDudes);

var littleRobot = InkPaint.Sprite.fromImage(paths('source/assets/pixi-filters/depth_blur_moby.jpg'));
littleRobot.x = (app.screen.width / 2) - 200;
littleRobot.y = 100;
app.stage.addChild(littleRobot);

var blurFilter1 = new InkPaint.filters.BlurFilter();
var blurFilter2 = new InkPaint.filters.BlurFilter();

littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

var count = 0;

var ticker = new InkPaint.Ticker();
ticker.start();
ticker.add(function() {
    app.render();
    count += 0.005;

    var blurAmount = Math.cos(count);
    var blurAmount2 = Math.sin(count);

    blurFilter1.blur = 20 * (blurAmount);
    blurFilter2.blur = 20 * (blurAmount2);
});
