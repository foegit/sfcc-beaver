import PathTool from '../../classes/tools/PathTool';

export function parseCartridgePath(path: string) {
  // src/cartridges/int_custom/cartridge/scripts/index.js
  // inc_custom/cartridge/scripts/index.js
  const parsedLocation2 = PathTool.toPosixPath(path).split('/');
  const cartridgeKeyWordPosition = parsedLocation2.indexOf('cartridge');

  if (cartridgeKeyWordPosition < 1) {
    return {
      cartridge: 'Unknown cartridge',
      cartridgeRelatedPath: '',
    };
  }

  return {
    cartridge: parsedLocation2[cartridgeKeyWordPosition - 1],
    cartridgeRelatedPath: parsedLocation2.slice(cartridgeKeyWordPosition + 1).join('/'),
  };
}
