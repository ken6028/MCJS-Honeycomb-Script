import { MCManager } from "../../scripts/src/_honeycomb.script/mc.manager.js";
const manager = new MCManager();

//MGR
import PlayerManager from "../../scripts/src/_honeycomb.script/player/mgr.js";
const playerManager = manager.use(PlayerManager);

//PLG
import Input from "../../scripts/src/_honeycomb.script/player/plug.input.js";
playerManager.use(Input);


//example
manager.on("playerInput:jumpStart", (ev) => {
    const { wrapper } = ev;
    const player = wrapper.player;
    player.sendMessage("ジャンプ開始");
});