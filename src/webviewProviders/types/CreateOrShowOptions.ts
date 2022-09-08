export default class CreateOrShowOptions {
    public relativeLink: string;
    public baseURL: string;

    constructor(url: string) {
        this.relativeLink = url;
        this.baseURL = url;
    }
}
