"use strict";

describe("getLocalBounds", function() {
    it("should register correct local-bounds with a LOADED Sprite", function() {
        const parent = new InkPaint.Container();
        const texture = InkPaint.RenderTexture.create(10, 10);

        const sprite = new InkPaint.Sprite(texture);

        parent.addChild(sprite);

        let bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it("should register correct local-bounds with Graphics", function() {
        const parent = new InkPaint.Container();

        const graphics = new InkPaint.Graphics();

        graphics.beginFill(0xff0000).drawCircle(0, 0, 10);

        parent.addChild(graphics);

        const bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(-10);
        expect(bounds.y).to.equal(-10);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);
    });

    it("should register correct local-bounds with Graphics after clear", function() {
        const parent = new InkPaint.Container();

        const graphics = new InkPaint.Graphics();

        graphics.beginFill(0xff0000).drawRect(0, 0, 20, 20);

        parent.addChild(graphics);

        let bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.clear();
        graphics.beginFill(0xff, 1);
        graphics.drawRect(0, 0, 10, 10);
        graphics.endFill();

        bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it("should register correct local-bounds with Graphics after generateCanvasTexture and clear", function() {
        const parent = new InkPaint.Container();

        const graphics = new InkPaint.Graphics();

        graphics.beginFill(0xff0000).drawRect(0, 0, 20, 20);

        parent.addChild(graphics);

        let bounds = graphics.getLocalBounds();

        graphics.generateCanvasTexture();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.clear();
        graphics.beginFill(0xff, 1);
        graphics.drawRect(0, 0, 10, 10);
        graphics.endFill();

        bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it("should register correct local-bounds with an empty Container", function() {
        const parent = new InkPaint.Container();

        const container = new InkPaint.Container();

        parent.addChild(container);

        const bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);
    });

    it("should register correct local-bounds with an item that has already had its parent Container transformed", function() {
        const parent = new InkPaint.Container();

        const container = new InkPaint.Container();

        const graphics = new InkPaint.Graphics()
            .beginFill(0xff0000)
            .drawRect(0, 0, 10, 10);

        parent.addChild(container);
        container.addChild(graphics);

        container.position.x = 100;
        container.position.y = 100;

        const bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);
    });

    it("should register correct local-bounds with a cachAsBitmap item inside after a render", function() {
        const parent = new InkPaint.Container();

        const graphic = new InkPaint.Graphics();

        graphic.beginFill(0xffffff);
        graphic.drawRect(0, 0, 100, 100);
        graphic.endFill();
        graphic.cacheAsBitmap = true;

        parent.addChild(graphic);

        const renderer = new InkPaint.CanvasRenderer(100, 100);

        renderer.sayHello = () => {
            /* empty */
        };
        renderer.render(parent);

        const bounds = parent.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(100);
        expect(bounds.height).to.equal(100);
    });

    it("should register correct local-bounds with a Text", function() {
        const text = new InkPaint.Text("hello");
        const bounds = text.getLocalBounds();

        expect(bounds.width).to.not.equal(0);
        expect(bounds.height).to.not.equal(0);
    });
});
