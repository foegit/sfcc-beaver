import { expect } from 'chai';
import PathTool from '../../classes/tools/PathTool';

describe('PathTool', () => {
    it('hasFolder', () => {
        expect(PathTool.hasFolder('d:\\test\\', 'test')).true;
        expect(PathTool.hasFolder('d:/test/', 'test')).true;
        expect(PathTool.hasFolder('d:\\test2\\', 'test')).false;
        expect(PathTool.hasFolder('d:/test2/', 'test')).false;
        expect(PathTool.hasFolder('d:\\test/', 'test')).false;
        expect(PathTool.hasFolder('d:\\test', 'test')).true;
        expect(PathTool.hasFolder('d:\\test.js', 'test')).false;
    });

    it('indexOfFolder', () => {
        expect(PathTool.indexOfFolder('d:\\test\\', 'test')).equal(2);
        expect(PathTool.indexOfFolder('d:\\test\\subfolder\\', 'subfolder')).equal(7);
        expect(PathTool.indexOfFolder('d:\\test', 'test')).equal(2);
        expect(PathTool.indexOfFolder('d:\\test2\\', 'test')).equal(-1);
        expect(PathTool.indexOfFolder('d:\\test2', 'test')).equal(-1);
    });
});