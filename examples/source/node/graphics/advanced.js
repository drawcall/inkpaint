var app = new InkPaint.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);

module.exports = app;


var sprite = InkPaint.Sprite.fromImage(paths('source/assets/bg_rotate.jpg'));

// // BEZIER CURVE ////
// information: https://en.wikipedia.org/wiki/Bézier_curve

var realPath = new InkPaint.Graphics();

realPath.lineStyle(2, 0xFFFFFF, 1);
realPath.moveTo(0, 0);
realPath.lineTo(100, 200);
realPath.lineTo(200, 200);
realPath.lineTo(240, 100);

realPath.position.x = 50;
realPath.position.y = 50;

app.stage.addChild(realPath);

var bezier = new InkPaint.Graphics();

bezier.lineStyle(5, 0xAA0000, 1);
bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);

bezier.position.x = 50;
bezier.position.y = 50;

app.stage.addChild(bezier);

// // BEZIER CURVE 2 ////
var realPath2 = new InkPaint.Graphics();

realPath2.lineStyle(2, 0xFFFFFF, 1);
realPath2.moveTo(0, 0);
realPath2.lineTo(0, -100);
realPath2.lineTo(150, 150);
realPath2.lineTo(240, 100);

realPath2.position.x = 320;
realPath2.position.y = 150;

app.stage.addChild(realPath2);

var bezier2 = new InkPaint.Graphics();

bezier2.bezierCurveTo(0, -100, 150, 150, 240, 100);

bezier2.position.x = 320;
bezier2.position.y = 150;

app.stage.addChild(bezier2);

// // ARC ////
var arc = new InkPaint.Graphics();

arc.lineStyle(5, 0xAA00BB, 1);
arc.arc(600, 100, 50, Math.PI, 2 * Math.PI);

app.stage.addChild(arc);

// // ARC 2 ////
var arc2 = new InkPaint.Graphics();

arc2.lineStyle(6, 0x3333DD, 1);
arc2.arc(650, 270, 60, 2 * Math.PI, 3 * Math.PI / 2);

app.stage.addChild(arc2);

// // ARC 3 ////
var arc3 = new InkPaint.Graphics();

arc3.arc(650, 420, 60, 2 * Math.PI, 2.5 * Math.PI / 2);

app.stage.addChild(arc3);

// / Hole ////
var rectAndHole = new InkPaint.Graphics();

rectAndHole.beginFill(0x00FF00);
rectAndHole.drawRect(350, 350, 150, 150);
rectAndHole.drawCircle(375, 375, 25);
rectAndHole.drawCircle(425, 425, 25);
rectAndHole.drawCircle(475, 475, 25);
rectAndHole.endFill();

app.stage.addChild(rectAndHole);

// // Line Texture Style ////
var beatifulRect = new InkPaint.Graphics();
beatifulRect.beginFill(0xFF0000);
beatifulRect.drawRect(80, 350, 150, 150);
beatifulRect.endFill();

app.stage.addChild(beatifulRect);
app.render();
