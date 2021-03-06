'use strict';

describe('InkPaint.filters', function ()
{
    it('should correctly form uniformData', function ()
    {
        const sprite = new InkPaint.Sprite(InkPaint.Texture.EMPTY);
        const displ = new InkPaint.filters.DisplacementFilter(sprite);

        expect(!!displ.uniformData.scale).to.be.true;
        expect(!!displ.uniformData.filterMatrix).to.be.true;
        expect(!!displ.uniformData.mapSampler).to.be.true;
        // it does have filterClamp, but it is handled by FilterManager
        expect(!!displ.uniformData.filterClamp).to.be.false;

        const fxaa = new InkPaint.filters.FXAAFilter();

        // it does have filterArea, but it is handled by FilterManager
        expect(!!fxaa.uniformData.filterArea).to.be.false;
    });
});
