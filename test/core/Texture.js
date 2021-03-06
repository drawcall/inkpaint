'use strict';

const URL = 'foo.png';
const NAME = 'foo';
const NAME2 = 'bar';

function cleanCache()
{
    delete InkPaint.utils.BaseTextureCache[URL];
    delete InkPaint.utils.BaseTextureCache[NAME];
    delete InkPaint.utils.BaseTextureCache[NAME2];

    delete InkPaint.utils.TextureCache[URL];
    delete InkPaint.utils.TextureCache[NAME];
    delete InkPaint.utils.TextureCache[NAME2];
}

describe('InkPaint.Texture', function ()
{
    it('should register Texture from Loader', function ()
    {
        cleanCache();

        const image = new Image();

        const texture = InkPaint.Texture.fromLoader(image, URL, NAME);

        expect(texture.baseTexture.imageUrl).to.equal('foo.png');
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(InkPaint.utils.TextureCache[URL]).to.equal(texture);
        expect(InkPaint.utils.BaseTextureCache[URL]).to.equal(texture.baseTexture);
    });

    it('should remove Texture from cache on destroy', function ()
    {
        cleanCache();

        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());

        InkPaint.Texture.addToCache(texture, NAME);
        InkPaint.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(texture);
        texture.destroy();
        expect(texture.textureCacheIds).to.equal(null);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('should be added to the texture cache correctly, '
     + 'and should remove only itself, not effecting the base texture and its cache', function ()
    {
        cleanCache();

        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());

        InkPaint.BaseTexture.addToCache(texture.baseTexture, NAME);
        InkPaint.Texture.addToCache(texture, NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        InkPaint.Texture.removeFromCache(NAME);
        expect(texture.baseTexture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(InkPaint.utils.BaseTextureCache[NAME]).to.equal(texture.baseTexture);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(undefined);
    });

    it('should remove Texture from entire cache using removeFromCache (by Texture instance)', function ()
    {
        cleanCache();

        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());

        InkPaint.Texture.addToCache(texture, NAME);
        InkPaint.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(texture);
        InkPaint.Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(-1);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(undefined);
    });

    it('should remove Texture from single cache entry using removeFromCache (by id)', function ()
    {
        cleanCache();

        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());

        InkPaint.Texture.addToCache(texture, NAME);
        InkPaint.Texture.addToCache(texture, NAME2);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(1);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(texture);
        InkPaint.Texture.removeFromCache(NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture.textureCacheIds.indexOf(NAME2)).to.equal(0);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(undefined);
        expect(InkPaint.utils.TextureCache[NAME2]).to.equal(texture);
    });

    it('should not remove Texture from cache if Texture instance has been replaced', function ()
    {
        cleanCache();

        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());
        const texture2 = new InkPaint.Texture(new InkPaint.BaseTexture());

        InkPaint.Texture.addToCache(texture, NAME);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture);
        InkPaint.Texture.addToCache(texture2, NAME);
        expect(texture2.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture2);
        InkPaint.Texture.removeFromCache(texture);
        expect(texture.textureCacheIds.indexOf(NAME)).to.equal(-1);
        expect(texture2.textureCacheIds.indexOf(NAME)).to.equal(0);
        expect(InkPaint.utils.TextureCache[NAME]).to.equal(texture2);
    });

    it('destroying a destroyed texture should not throw an error', function ()
    {
        const texture = new InkPaint.Texture(new InkPaint.BaseTexture());

        texture.destroy(true);
        texture.destroy(true);
    });

    it('should clone a texture', function ()
    {
        const baseTexture = new InkPaint.BaseTexture();
        const frame = new InkPaint.Rectangle();
        const orig = new InkPaint.Rectangle();
        const trim = new InkPaint.Rectangle();
        const rotate = 2;
        const anchor = new InkPaint.Point(1, 0.5);
        const texture = new InkPaint.Texture(baseTexture, frame, orig, trim, rotate, anchor);
        const clone = texture.clone();

        expect(clone.baseTexture).to.equal(baseTexture);
        expect(clone.defaultAnchor.x).to.equal(texture.defaultAnchor.x);
        expect(clone.defaultAnchor.y).to.equal(texture.defaultAnchor.y);
        expect(clone.frame).to.equal(texture.frame);
        expect(clone.trim).to.equal(texture.trim);
        expect(clone.orig).to.equal(texture.orig);
        expect(clone.rotate).to.equal(texture.rotate);

        clone.destroy();
        texture.destroy(true);
    });
});
