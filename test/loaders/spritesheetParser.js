'use strict';

const path = require('path');

describe('InkPaint.loaders.spritesheetParser', function ()
{
    it('should exist and return a function', function ()
    {
        expect(InkPaint.loaders.spritesheetParser).to.be.a('function');
        expect(InkPaint.loaders.spritesheetParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not JSON', function ()
    {
        const spy = sinon.spy();
        const res = {};

        InkPaint.loaders.spritesheetParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is JSON, but improper format', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(InkPaint.loaders.Resource.TYPE.JSON, {});

        InkPaint.loaders.spritesheetParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should load the image & create textures if json is properly formatted', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(InkPaint.loaders.Resource.TYPE.JSON, getJsonSpritesheet());
        const loader = new InkPaint.loaders.Loader();
        const addStub = sinon.stub(loader, 'add');
        const imgRes = createMockResource(InkPaint.loaders.Resource.TYPE.IMAGE, new Image());

        imgRes.texture = new InkPaint.Texture(new InkPaint.BaseTexture(imgRes.data));

        addStub.yields(imgRes);

        InkPaint.loaders.spritesheetParser().call(loader, res, spy);

        addStub.restore();

        expect(spy).to.have.been.calledOnce;
        expect(addStub).to.have.been.calledWith(
            `${res.name}_image`,
            `${path.dirname(res.url)}/${res.data.meta.image}`
        );
        expect(res).to.have.property('textures')
            .that.is.an('object')
            .with.keys(Object.keys(getJsonSpritesheet().frames))
            .and.has.property('0.png')
                .that.is.an.instanceof(InkPaint.Texture);

        expect(res.textures['0.png'].frame.x).to.equal(14);
        expect(res.textures['0.png'].frame.y).to.equal(28);
        expect(res.textures['0.png'].defaultAnchor.x).to.equal(0.3);
        expect(res.textures['0.png'].defaultAnchor.y).to.equal(0.4);
        expect(res.textures['1.png'].defaultAnchor.x).to.equal(0.0); // default of defaultAnchor is 0,0
        expect(res.textures['1.png'].defaultAnchor.y).to.equal(0.0);

        expect(res).to.have.property('spritesheet')
            .to.have.property('animations')
            .to.have.property('png123');
        expect(res.spritesheet.animations.png123.length).to.equal(3);
        expect(res.spritesheet.animations.png123[0]).to.equal(res.textures['1.png']);
    });

    it('should not load binary images as an image loader type', function (done)
    {
        const loader = new InkPaint.loaders.Loader();

        // provide a mock pre-loader that creates an empty base texture for compressed texture assets
        // this is necessary because the spritesheetParser expects a baseTexture on the resource
        loader.pre((resource, next) =>
        {
            if (resource.extension === 'crn')
            {
                resource.texture = InkPaint.Texture.EMPTY;
            }
            next();
        })
        .add(`atlas_crn`, path.join(__dirname, 'resources', 'atlas_crn.json'))
        .add(`atlas`, path.join(__dirname, 'resources', 'atlas.json'))
        .load((loader, resources) =>
        {
            expect(resources.atlas_image.data).to.be.instanceof(HTMLImageElement);
            expect(resources.atlas_crn_image.data).to.not.be.instanceof(HTMLImageElement);
            loader.reset();
            done();
        });
    });

    it('should dispatch an error failing to load spritesheet image', function (done)
    {
        const spy = sinon.spy((error, ldr, res) =>
        {
            expect(res.name).to.equal('atlas_image');
            expect(res.error).to.equal(error);
            expect(error.toString()).to.have.string('Failed to load element using: IMG');
        });
        const loader = new InkPaint.loaders.Loader();

        loader.add('atlas', path.join(__dirname, 'resources', 'atlas_error.json'));
        loader.onError.add(spy);
        loader.load((loader, resources) =>
        {
            expect(resources.atlas_image.error).to.be.instanceof(Error);
            expect(spy.calledOnce).to.be.true;
            loader.reset();
            done();
        });
    });

    it('should build the image url', function ()
    {
        function getResourcePath(url, image)
        {
            return InkPaint.loaders.getResourcePath({
                url,
                data: { meta: { image } },
            });
        }

        let result = getResourcePath('http://some.com/spritesheet.json', 'img.png');

        expect(result).to.be.equals('http://some.com/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', 'img.png');
        expect(result).to.be.equals('http://some.com/some/dir/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', './img.png');
        expect(result).to.be.equals('http://some.com/some/dir/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', '../img.png');
        expect(result).to.be.equals('http://some.com/some/img.png');

        result = getResourcePath('/spritesheet.json', 'img.png');
        expect(result).to.be.equals('/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', 'img.png');
        expect(result).to.be.equals('/some/dir/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', './img.png');
        expect(result).to.be.equals('/some/dir/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', '../img.png');
        expect(result).to.be.equals('/some/img.png');
    });

    // TODO: Test that rectangles are created correctly.
    // TODO: Test that bathc processing works correctly.
    // TODO: Test that resolution processing works correctly.
    // TODO: Test that metadata is honored.
});

function createMockResource(type, data)
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `http://localhost/doesnt_exist/${name}`,
        name,
        type,
        data,
        metadata: {},
    };
}

function getJsonSpritesheet()
{
    /* eslint-disable */
    return {"frames": {
    "0.png":
    {
        "frame": {"x":14,"y":28,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14},
        "anchor": {"x":0.3,"y":0.4}
    },
    "1.png":
    {
        "frame": {"x":14,"y":42,"w":12,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":12,"h":14},
        "sourceSize": {"w":12,"h":14}
    },
    "2.png":
    {
        "frame": {"x":14,"y":14,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "3.png":
    {
        "frame": {"x":42,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "4.png":
    {
        "frame": {"x":28,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "5.png":
    {
        "frame": {"x":14,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "6.png":
    {
        "frame": {"x":0,"y":42,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "7.png":
    {
        "frame": {"x":0,"y":28,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "8.png":
    {
        "frame": {"x":0,"y":14,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "9.png":
    {
        "frame": {"x":0,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    }},
    "animations": {
        "png123": [ "1.png", "2.png", "3.png" ]
    },
    "meta": {
        "app": "http://www.texturepacker.com",
        "version": "1.0",
        "image": "hud.png",
        "format": "RGBA8888",
        "size": {"w":64,"h":64},
        "scale": "1",
        "smartupdate": "$TexturePacker:SmartUpdate:47025c98c8b10634b75172d4ed7e7edc$"
    }
    };
    /* eslint-enable */
}
