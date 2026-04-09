import { world } from "@minecraft/server";
import { MCUtil } from "./_honeycomb.script/_utils/mc.util.js";
import { MCManager } from "./_honeycomb.script/mc.manager.js";


const manager = new MCManager();

//MGR-プレイヤー
import MGR_Player from "./_honeycomb.script/player/mgr.js";
const playerManager = manager.use(MGR_Player);
// //PLG-プレイヤー入力
// import Input from "./_honeycomb.script/player/plug.input.js";
// playerManager.use(Input);
// //PLG-プレイヤーチーム
// import Team from "./_honeycomb.script/player/plug.team.js";
// const teamPlugin = playerManager.use(Team);


//tool
import Terrain from "./_honeycomb.script/_tools/terrain/plug.tool.js";
playerManager.use(Terrain);


//MGR-レイキャスト弾
import Raycast from "./_honeycomb.script/dev.raycast.projectile/mgr.js";
import { RaycastProjectile_Guided } from "./_honeycomb.script/dev.raycast.projectile/projectile.js";
const raycastPlugin = manager.use(Raycast);

manager.subscribe("itemUse", (ev) => {
    const { source, itemStack } = ev;
    if (itemStack.typeId !== "minecraft:stick") return;

    const sourceLoc = source.getHeadLocation();
    const location = MCUtil.addVector3(sourceLoc, source.getViewDirection());

    const gp = new RaycastProjectile_Guided({
        dimension: source.dimension,
        location,
        rotation: source.getRotation(),
        speed: 1,
        gravity: 0,
        inertia: 0,
        maxAge: 20 * 20,
        rotateLimitX: 1,
        rotateLimitY: 1,
        onHitBlock(hit) {
            raycastPlugin.removeProjectile(gp);
        },
        particle(type) {
            switch (type) {
                case "trail": {
                    return [
                        {
                            effectName: "minecraft:balloon_gas_particle"
                        }
                    ]
                }
                case "hitBlock": {
                    return [
                        {
                            effectName: "minecraft:dragon_death_explosion_emitter"
                        }
                    ]
                }
                default: return [];
            }
        }
    });

    gp.target = { x: 0, y: 0, z: 0 };

    raycastPlugin.pushProjectile(gp);
});



//UI
import { StringUI, type StringUI_Value } from "./_honeycomb.script/_utils/string.ui.js";

const time: StringUI_Value = {
    type: "time",
    label: "time",
    value: 0
};


const SUI = new StringUI([
    time
]);


manager.on("tick", () => {
    time.value = world.getTimeOfDay();

    const { allPlayers } = playerManager;
    allPlayers.forEach(wp => {
        wp.player.onScreenDisplay.setActionBar(SUI.toString());
    });
});