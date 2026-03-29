export class AutoIncrementID {
    static #current: number = 0;

    #id = AutoIncrementID.#current++;
    get id() {
        return this.#id;
    }
}