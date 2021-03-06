import { Matrix } from "../../../math";

export function calculateScreenSpaceMatrix(
  outputMatrix,
  filterArea,
  textureSize
) {
  const mappedMatrix = outputMatrix.identity();
  mappedMatrix.translate(
    filterArea.x / textureSize.width,
    filterArea.y / textureSize.height
  );
  mappedMatrix.scale(textureSize.width, textureSize.height);

  return mappedMatrix;
}

export function calculateNormalizedScreenSpaceMatrix(
  outputMatrix,
  filterArea,
  textureSize
) {
  const mappedMatrix = outputMatrix.identity();
  mappedMatrix.translate(
    filterArea.x / textureSize.width,
    filterArea.y / textureSize.height
  );

  const translateScaleX = textureSize.width / filterArea.width;
  const translateScaleY = textureSize.height / filterArea.height;
  mappedMatrix.scale(translateScaleX, translateScaleY);

  return mappedMatrix;
}

export function calculateSpriteMatrix(
  outputMatrix,
  filterArea,
  textureSize,
  sprite
) {
  const orig = sprite._texture.orig;
  const mappedMatrix = outputMatrix.set(
    textureSize.width,
    0,
    0,
    textureSize.height,
    filterArea.x,
    filterArea.y
  );
  const worldTransform = sprite.worldTransform.copy(Matrix.TEMP_MATRIX);

  worldTransform.invert();
  mappedMatrix.prepend(worldTransform);
  mappedMatrix.scale(1.0 / orig.width, 1.0 / orig.height);
  mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

  return mappedMatrix;
}
