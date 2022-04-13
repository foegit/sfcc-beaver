export default class SFCCCartridge {
    private path : string;
    private name : string = '';

    constructor(path : string) {
        this.path = path;
    }

    getProjectFile() {
        
    }

    getName() : string {
        if (!this.name) {
            const parsedPath = this.path.match(/^.*[\/\\](.*)$/);

            this.name = parsedPath ? parsedPath[1] : 'unknown';
        }

        return this.name;
    }
}