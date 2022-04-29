import IFileCreator from '../../IFileCreator';

export default class StaticFileCreator implements IFileCreator {
    constructor(private staticContent: string = '') {}

    create(): string {
        return this.staticContent;
    }
}