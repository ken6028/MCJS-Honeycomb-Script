/** イベントデータマップの型 */
export type Event_DataMap_Type = Record<string, any>;

/** イベントコールバックの型 */
export type Event_Callback_Type<D> = (data: D) => void;

/** イベントマップの型 */
export type Event_Map_Type<Map extends Event_DataMap_Type, K extends keyof Map> = Record<K, Event_Callback_Type<Map[K]>>;

/** イベントリスナーの型 */
export type Event_Listener_Type<Map extends Event_DataMap_Type, K extends keyof Map> = {
    [P in K]?: Event_Callback_Type<Map[P]>[]
}



export class EventEmitter<Map extends Event_DataMap_Type> {
    #events: Event_Listener_Type<Map, keyof Map> = {};
    
    on<K extends keyof Map>(event: K, callback: Event_Callback_Type<Map[K]>) {
        if (!this.#events[event]) this.#events[event] = [];
        this.#events[event]!.push(callback);
        return callback;
    }

    emit<K extends keyof Map>(event: K, data: Map[K]) {
        const listeners = this.#events[event];
        if (!listeners) return this;
        listeners.forEach(listener => listener(data));
        return this;
    }

    off<K extends keyof Map>(event: K, callback: Event_Callback_Type<Map[K]>) {
        const listeners = this.#events[event];
        if (!listeners) return this;
        listeners.splice(listeners.indexOf(callback), 1);
        return this;
    }
}