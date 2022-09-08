
export default class History<T> {
    private history: Array<T> = [];
    private activeIndex: number = 0;

    public push(entry: T) {
        this.history.push(entry);
        this.activeIndex = this.history.length - 1;
    }

    public getActive() {
        return this.history[this.activeIndex];
    }

    public goBack() {
        if (this.activeIndex > 0) {
            const entry = this.history[this.activeIndex - 1];
            this.activeIndex -= 1;

            return entry;
        }

        return null;
    }

    public goForward() {
        if (this.activeIndex + 1 < this.history.length) {
            const entry = this.history[this.activeIndex + 1];
            this.activeIndex += 1;

            return entry;
        }

        return null;
    }
}
