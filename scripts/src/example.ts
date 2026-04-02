import { MCManager } from "./_honeycomb.script/mc.manager.js";


const manager = new MCManager();

//MGR-プレイヤー
import MGR_Player from "./_honeycomb.script/player/mgr.js";
const playerManager = manager.use(MGR_Player);
//PLG-プレイヤー入力
import Input from "./_honeycomb.script/player/plug.input.js";
playerManager.use(Input);
// //PLG-プレイヤーチーム
// import Team from "./_honeycomb.script/player/plug.team.js";
// const teamPlugin = playerManager.use(Team);


import Terrain from "./_honeycomb.script/_tools/terrain/plug.tool.js";
playerManager.use(Terrain);


manager.on("playerInput:sneakEnd", (ev) => {
    const { wrapper, sneakDuration } = ev;
    const player = wrapper.player;

    const vector = player.getViewDirection();
    vector.x *= sneakDuration * 0.1;
    vector.y *= sneakDuration * 0.1;
    vector.z *= sneakDuration * 0.1;

    player.applyImpulse(vector);
});