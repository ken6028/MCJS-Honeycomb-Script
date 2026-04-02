import { MCManager } from "../../mc.manager";

const manager = new MCManager();

//MGR
import PlayerManager from "../../player/mgr.js";
const playerManager = manager.use(PlayerManager);

//PLG
import Input from "../../player/plug.input.js";
playerManager.use(Input);


//example
manager.on("playerInput:jumpStart", (ev) => {
    const { wrapper } = ev;
    const player = wrapper.player;
    player.sendMessage("ジャンプ開始");
});