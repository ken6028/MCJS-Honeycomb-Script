import { world, type Player } from "@minecraft/server";
import type { MCManagerCore, PluginEntry } from "../mc.manager.js";
import type { ManagerType, PluginEntryType } from "../_manager.js";
import { PlayerWrapper } from "./wrapper.js";








export type PlayerManagerCore = MCManagerCore & {
    playerManager: PlayerManager;
}


export type PlayerPluginEntry<result> = PluginEntryType<PlayerManagerCore, result>;



class PlayerManager implements ManagerType<PlayerManagerCore> {
    #playerIndex = new Map<Player, PlayerWrapper>();
    #nameIndex = new Map<string, PlayerWrapper>();
    
    #core: PlayerManagerCore;
    constructor(core: MCManagerCore) {
        this.#core = {
            ...core,
            playerManager: this
        };


        const listener = core.MCManager();

        listener.on("init", () => {
            const players = world.getAllPlayers();
            players.forEach(player => this.addPlayer(player));
        });
        listener.subscribe("playerSpawn", (ev) => {
            if (ev.initialSpawn) this.addPlayer(ev.player);
        });
        listener.subscribe("playerLeave", (ev) => {
            this.removePlayer(ev.playerId);
        });
    }



    use<plugin extends PluginEntryType<PlayerManagerCore, any>>(plug: plugin): ReturnType<plugin> {
        return plug(this.#core);
    }
    


    

    addPlayer(player: Player) {
        if (this.#playerIndex.has(player)) return;
        const wrapper = new PlayerWrapper(player);
        this.#playerIndex.set(player, wrapper);
        this.#nameIndex.set(player.name, wrapper);
        this.#core.emit("playerManager:addPlayer", {wrapper});
    }

    removePlayer(player: Player | string) {
        const wrapper = typeof player === "string" ? this.#nameIndex.get(player) : this.#playerIndex.get(player);
        if (!wrapper) return;
        this.#playerIndex.delete(wrapper.player);
        this.#nameIndex.delete(wrapper.player.name);
        this.#core.emit("playerManager:removePlayer", {wrapper});
    }

    getPlayer(player: Player | string) {
        return typeof player === "string" ? this.#nameIndex.get(player) : this.#playerIndex.get(player);
    }

    get allPlayers() {
        return [...this.#playerIndex.values()];
    }
}





const plugin: PluginEntry<PlayerManager> = (core) => {
    const manager = new PlayerManager(core);
    return manager;
};

export default plugin;



declare module "../mc.manager.js" {
    interface EX_EventDataMap {
        "playerManager:addPlayer": {
            wrapper: PlayerWrapper
        };
        "playerManager:removePlayer": {
            wrapper: PlayerWrapper
        }
    }
}