export default class EditorFile {
    private absPath : string;

    constructor(absPath : string) {
        this.absPath = absPath;
    }

    getAbsPath() {
        return this.absPath;
    }
}