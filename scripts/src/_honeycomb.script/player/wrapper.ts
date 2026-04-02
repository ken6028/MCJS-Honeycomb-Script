import type { Player } from "@minecraft/server";

export class PlayerWrapper {
    #player: Player;
    get player() {
        return this.#player;
    }

    get inventory() {
        return this.#player.getComponent("minecraft:inventory");
    }

    get container() {
        return this.inventory?.container;
    }


    constructor(player: Player) {
        this.#player = player;
    }
}