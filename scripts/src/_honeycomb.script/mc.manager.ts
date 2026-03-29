import { system, world, WorldBeforeEvents, type WorldAfterEvents } from "@minecraft/server";
import { Manager, type PluginEntryType } from "./_manager.js";




type Listeners = {
    [key in keyof WorldAfterEvents]?: Parameters<WorldAfterEvents[key]["subscribe"]>[0][];
}

type BeforeListeners = {
    [key in keyof WorldBeforeEvents]?: Parameters<WorldBeforeEvents[key]["subscribe"]>[0][];
}




export interface EX_EventDataMap {
    init: {
        currentTick: number;
    },
    tick: {
        currentTick: number;
    }
}


export type MCManagerCore = {
    MCManager: () => MCManager;
    emit<K extends keyof EX_EventDataMap>(event: K, data: EX_EventDataMap[K]): void;
}



/**
 * MCManagerのプラグインの関数型
 */
export type PluginEntry<result> = PluginEntryType<MCManagerCore, result>;

export class MCManager extends Manager<MCManagerCore, EX_EventDataMap> {


    constructor() {
        super(
            {
                MCManager: () => this,
                emit: (event, data) => {
                    super.emit(event, data);
                }
            }
        );
        system.run(() => {
            super.emit("init", {
                currentTick: system.currentTick
            });
        });
        system.runInterval(() => {
            super.emit("tick", {
                currentTick: system.currentTick
            });
        }, 1);
    }

    emit<K extends keyof EX_EventDataMap>(event: K, data: EX_EventDataMap[K]): this {
        //外部からの呼び出しを禁止
        return this;
    }
    





    #listeners: Listeners = {};
    subscribe<K extends keyof Listeners, V extends Parameters<WorldAfterEvents[K]["subscribe"]>[0]>(event: K, callback: V): V {
        if (!this.#listeners[event]) {
            const listeners = this.#listeners[event] = [] as Listeners[K];

            //イベントを全体に流す
            world.afterEvents[event].subscribe((ev) => {
                //!!!
                listeners!.forEach(listener => listener(ev as any));
            })
        }
        this.#listeners[event]!.push(callback);
        return callback;
    }

    unsubscribe<K extends keyof Listeners, V extends Parameters<WorldAfterEvents[K]["subscribe"]>[0]>(event: K, callback: V) {
        const listeners = this.#listeners[event];
        if (!listeners) return;
        listeners.splice(listeners.indexOf(callback), 1);
    }





    #beforeListeners: BeforeListeners = {};
    subscribeBefore<K extends keyof BeforeListeners, V extends Parameters<WorldBeforeEvents[K]["subscribe"]>[0]>(event: K, callback: V): V {
        if (!this.#beforeListeners[event]) {
            const listeners = this.#beforeListeners[event] = [] as BeforeListeners[K];

            //イベントを全体に流す
            world.beforeEvents[event].subscribe((ev) => {
                //!!!
                listeners!.forEach(listener => listener(ev as any));
            })
        }
        this.#beforeListeners[event]!.push(callback);
        return callback;
    }

    unsubscribeBefore<K extends keyof BeforeListeners, V extends Parameters<WorldBeforeEvents[K]["subscribe"]>[0]>(event: K, callback: V) {
        const listeners = this.#beforeListeners[event];
        if (!listeners) return;
        listeners.splice(listeners.indexOf(callback), 1);
    }

}
