import PathTool from '../../classes/tools/PathTool';

export function parseCartridgePath(path: string) {
  const parsedLocation = /^.*\/(.*)\/cartridge(.*)$/.exec(PathTool.toPosixPath(path));

  return {
    cartridge: parsedLocation?.[1] || 'Unknown cartridge',
    cartridgeRelatedPath: parsedLocation?.[2] || '',
  };
}
