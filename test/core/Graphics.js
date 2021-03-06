'use strict';

const withGL = require('../withGL');

describe('InkPaint.Graphics', function ()
{
    describe('constructor', function ()
    {
        it('should set defaults', function ()
        {
            const graphics = new InkPaint.Graphics();

            expect(graphics.fillAlpha).to.be.equals(1);
            expect(graphics.lineWidth).to.be.equals(0);
            expect(graphics.lineColor).to.be.equals(0);
            expect(graphics.tint).to.be.equals(0xFFFFFF);
            expect(graphics.blendMode).to.be.equals(InkPaint.BLEND_MODES.NORMAL);
        });
    });

    describe('lineTo', function ()
    {
        it('should return correct bounds - north', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, 10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - south', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(0, -10);

            expect(graphics.width).to.be.below(1.00001);
            expect(graphics.width).to.be.above(0.99999);
            expect(graphics.height).to.be.equals(10);
        });

        it('should return correct bounds - east', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(10, 0);

            expect(graphics.height).to.be.equals(1);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds - west', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineStyle(1);
            graphics.lineTo(-10, 0);

            expect(graphics.height).to.be.above(0.9999);
            expect(graphics.height).to.be.below(1.0001);
            expect(graphics.width).to.be.equals(10);
        });

        it('should return correct bounds when stacked with circle', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.beginFill(0xFF0000);
            graphics.drawCircle(50, 50, 50);
            graphics.endFill();

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);

            graphics.lineStyle(20, 0);
            graphics.moveTo(25, 50);
            graphics.lineTo(75, 50);

            expect(graphics.width).to.be.equals(100);
            expect(graphics.height).to.be.equals(100);
        });

        it('should return correct bounds when square', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.lineStyle(20, 0, 0.5);
            graphics.moveTo(0, 0);
            graphics.lineTo(50, 0);
            graphics.lineTo(50, 50);
            graphics.lineTo(0, 50);
            graphics.lineTo(0, 0);

            expect(graphics.width).to.be.equals(70);
            expect(graphics.height).to.be.equals(70);
        });

        it('should ignore duplicate calls', function ()
        {
            const graphics = new InkPaint.Graphics();

            graphics.moveTo(0, 0);
            graphics.lineTo(0, 0);
            graphics.lineTo(10, 0);
            graphics.lineTo(10, 0);

            expect(graphics.currentPath.shape.points).to.deep.equal([0, 0, 10, 0]);
        });
    });

    describe('containsPoint', function ()
    {
        it('should return true when point inside', function ()
        {
            const point = new InkPaint.Point(1, 1);
            const graphics = new InkPaint.Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new InkPaint.Point(20, 20);
            const graphics = new InkPaint.Graphics();

            graphics.beginFill(0);
            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false when no fill', function ()
        {
            const point = new InkPaint.Point(1, 1);
            const graphics = new InkPaint.Graphics();

            graphics.drawRect(0, 0, 10, 10);

            expect(graphics.containsPoint(point)).to.be.false;
        });

        it('should return false with hole', function ()
        {
            const point1 = new InkPaint.Point(1, 1);
            const point2 = new InkPaint.Point(5, 5);
            const graphics = new InkPaint.Graphics();

            graphics.beginFill(0)
                .moveTo(0, 0)
                .lineTo(10, 0)
                .lineTo(10, 10)
                .lineTo(0, 10)
                // draw hole
                .moveTo(2, 2)
                .lineTo(8, 2)
                .lineTo(8, 8)
                .lineTo(2, 8)
                .addHole();

            expect(graphics.containsPoint(point1)).to.be.true;
            expect(graphics.containsPoint(point2)).to.be.false;
        });
    });

    describe('arc', function ()
    {
        it('should draw an arc', function ()
        {
            const graphics = new InkPaint.Graphics();

            expect(graphics.currentPath).to.be.null;

            expect(() => graphics.arc(100, 30, 20, 0, Math.PI)).to.not.throw();

            expect(graphics.currentPath).to.be.not.null;
        });

        it('should not throw with other shapes', function ()
        {
            // complex drawing #1: draw triangle, rounder rect and an arc (issue #3433)
            const graphics = new InkPaint.Graphics();

            // set a fill and line style
            graphics.beginFill(0xFF3300);
            graphics.lineStyle(4, 0xffd900, 1);

            // draw a shape
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.endFill();

            graphics.lineStyle(2, 0xFF00FF, 1);
            graphics.beginFill(0xFF00BB, 0.25);
            graphics.drawRoundedRect(150, 450, 300, 100, 15);
            graphics.endFill();

            graphics.beginFill();
            graphics.lineStyle(4, 0x00ff00, 1);

            expect(() => graphics.arc(300, 100, 20, 0, Math.PI)).to.not.throw();
        });

        it('should do nothing when startAngle and endAngle are equal', function ()
        {
            const graphics = new InkPaint.Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 0, 0);

            expect(graphics.currentPath).to.be.null;
        });

        it('should do nothing if sweep equals zero', function ()
        {
            const graphics = new InkPaint.Graphics();

            expect(graphics.currentPath).to.be.null;

            graphics.arc(0, 0, 10, 10, 10);

            expect(graphics.currentPath).to.be.null;
        });
    });

    describe('_calculateBounds', function ()
    {
        it('should only call updateLocalBounds once', function ()
        {
            const graphics = new InkPaint.Graphics();
            const spy = sinon.spy(graphics, 'updateLocalBounds');

            graphics._calculateBounds();

            expect(spy).to.have.been.calledOnce;

            graphics._calculateBounds();

            expect(spy).to.have.been.calledOnce;
        });
    });

    describe('fastRect', function ()
    {
        it('should calculate tint, alpha and blendMode of fastRect correctly', withGL(function ()
        {
            const renderer = new InkPaint.WebGLRenderer(200, 200, {});

            try
            {
                const graphics = new InkPaint.Graphics();

                graphics.beginFill(0x102030, 0.6);
                graphics.drawRect(2, 3, 100, 100);
                graphics.endFill();
                graphics.tint = 0x101010;
                graphics.blendMode = 2;
                graphics.alpha = 0.3;

                renderer.render(graphics);

                expect(graphics.isFastRect()).to.be.true;

                const sprite = graphics._spriteRect;

                expect(sprite).to.not.be.equals(null);
                expect(sprite.worldAlpha).to.equals(0.18);
                expect(sprite.blendMode).to.equals(2);
                expect(sprite.tint).to.equals(0x010203);

                const bounds = sprite.getBounds();

                expect(bounds.x).to.equals(2);
                expect(bounds.y).to.equals(3);
                expect(bounds.width).to.equals(100);
                expect(bounds.height).to.equals(100);
            }
            finally
            {
                renderer.destroy();
            }
        }));
    });

    describe('drawCircle', function ()
    {
        it('should have no gaps in line border', withGL(function ()
        {
            const renderer = new InkPaint.WebGLRenderer(200, 200, {});

            try
            {
                const graphics = new InkPaint.Graphics();

                graphics.lineStyle(15, 0x8FC7E6);
                graphics.drawCircle(100, 100, 30);

                renderer.render(graphics);

                const points = graphics._webGL[renderer.CONTEXT_UID].data[0].points;
                const pointSize = 6; // Position Vec2 + Color/Alpha Vec4
                const firstX = points[0];
                const firstY = points[1];
                const secondX = points[pointSize];
                const secondY = points[pointSize + 1];
                const secondToLastX = points[points.length - (pointSize * 2)];
                const secondToLastY = points[points.length - (pointSize * 2) + 1];
                const lastX = points[points.length - pointSize];
                const lastY = points[points.length - pointSize + 1];

                expect(firstX).to.equals(secondToLastX);
                expect(firstY).to.equals(secondToLastY);
                expect(secondX).to.equals(lastX);
                expect(secondY).to.equals(lastY);
            }
            finally
            {
                renderer.destroy();
            }
        }));
    });
});
