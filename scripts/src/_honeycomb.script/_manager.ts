import { EventEmitter, type Event_DataMap_Type } from "./_emitter.js";

export interface ManagerType<Core extends ManagerCoreType> {
    use<plugin extends PluginEntryType<Core>>(plug: plugin): ReturnType<plugin>;
}

type ManagerCoreType = Record<string, any>;

export type PluginEntryType<Core extends ManagerCoreType, result = any> = (core: Core) => result;




export class Manager<Core extends ManagerCoreType, EventDataMap extends Event_DataMap_Type> extends EventEmitter<EventDataMap> implements ManagerType<Core> {

    #core: Core;

    constructor(core: Core) {
        super();
        this.#core = core;
    }
    
    
    use<plugin extends PluginEntryType<Core>>(plug: plugin): ReturnType<plugin> {
        return plug(this.#core);
    }
}