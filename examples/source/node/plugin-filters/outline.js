var app = new InkPaint.Application();
document.body.appendChild(app.view);

module.exports = app;


app.stage.position.set(400, 300);

var outlineFilterBlue = new InkPaint.filters.OutlineFilter(2, 0x99ff99);
var outlineFilterRed = new InkPaint.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5);

function filterOn() {
    this.filters = [outlineFilterRed];
}

function filterOff() {
    this.filters = [outlineFilterBlue];
}

for (var i = 0; i < 20; i++) {
    var bunny = InkPaint.Sprite.fromImage(paths('source/assets/bunny.png'));
    // bunny.anchor.set(0.5);
    bunny.interactive = true;
    bunny.position.set((Math.random() * 2 - 1) * 300 | 0, (Math.random() * 2 - 1) * 200 | 0);
    bunny.scale.x = (Math.random() * 3 | 0 * 0.1) + 1;
    bunny.on('pointerover', filterOn)
        .on('pointerout', filterOff);
    filterOff.call(bunny);
    app.stage.addChild(bunny);
}
