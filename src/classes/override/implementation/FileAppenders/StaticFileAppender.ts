import IFileAppender from '../../IFileAppender';

export default class StaticFileAppender implements IFileAppender {
    constructor(private staticContent: string = '') { }

    append(): string {
        return this.staticContent;
    }
}