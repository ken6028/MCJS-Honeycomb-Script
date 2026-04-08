import { MCManager } from "../../scripts/src/_honeycomb.script/mc.manager.js";
const manager = new MCManager();

//MGR
import PlayerManager from "../../scripts/src/_honeycomb.script/player/mgr.js";
const playerManager = manager.use(PlayerManager);


//example
manager.on("playerManager:addPlayer", (ev) => {
    ev.wrapper.player.sendMessage("Hello, World!");
});
manager.on("tick", () => {
    const { allPlayers } = playerManager;

    allPlayers.forEach((wrapper) => {
        //...
    });
});