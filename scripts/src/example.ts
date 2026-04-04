import { world } from "@minecraft/server";
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


import Raycast from "./_honeycomb.script/dev.raycast.projectile/mgr.js";
const raycastPlugin = manager.use(Raycast);

import { RaycastProjectile_Particle } from "./_honeycomb.script/dev.raycast.projectile/projectile.js";
manager.subscribe("itemUse", (ev) => {
    const { source, itemStack } = ev;
    if (itemStack.typeId !== "minecraft:stick") return;
    
    const projectile = new RaycastProjectile_Particle(
        {
            dimension: source.dimension,
            location: source.getHeadLocation(),
            rotation: source.getRotation(),
            speed: 5,
            gravity: 0.01,
            inertia: 1,
            maxAge: 20 * 1,
            onHitBlock(hit) {
                world.sendMessage(`ブロックに当たった！ ${hit.block.typeId}`);
                hit.block.dimension.createExplosion(hit.block.location, 4);
                raycastPlugin.removeProjectile(projectile);
            },
            onHitEntities(hits) {
                world.sendMessage(`エンティティに当たった！ 数: ${hits.length}`);
            }
        }
    )
    raycastPlugin.pushProjectile(projectile);
});



import { StringUI, type StringUI_Value } from "./_honeycomb.script/_utils/dev.string.ui.js";
const now: StringUI_Value = {
    type: "gauge",
    label: "tick",
    value: 0,
    min: 0,
    max: 20*10,
    color: "red",
    backColor: "white"
}

const sui = new StringUI([
    now,
    {
        type: "checkbox",
        label: "Test",
        value: false
    },
    {
        type: "checkbox",
        label: "Test2",
        value: true
    }
]);
sui.size = 30;

manager.on("tick", ({currentTick}) => {
    const allPlayers = playerManager.allPlayers;


    now.value = currentTick % (20 * 10) + 1;

    allPlayers.forEach(wr => {
        wr.player.onScreenDisplay.setActionBar(sui.toString());
    })
    
});