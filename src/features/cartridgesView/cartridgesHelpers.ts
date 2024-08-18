import PathTool from '../../classes/tools/PathTool';

export function parseCartridgePath(path: string) {
  // src/cartridges/int_custom/cartridge/scripts/index.js
  // inc_custom/cartridge/scripts/index.js
  const parsedLocation = PathTool.toPosixPath(path).split('/');
  const cartridgeKeyWordPosition = parsedLocation.indexOf('cartridge');

  if (cartridgeKeyWordPosition < 1) {
    return {
      cartridge: 'Unknown cartridge',
      cartridgeRelatedPath: '',
    };
  }

  return {
    cartridge: parsedLocation[cartridgeKeyWordPosition - 1],
    cartridgeRelatedPath: parsedLocation.slice(cartridgeKeyWordPosition + 1).join('/'),
  };
}
