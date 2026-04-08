import { MCManager } from "../../scripts/src/_honeycomb.script/mc.manager.js";
const manager = new MCManager();

//MGR
import Raycast from "../../scripts/src/_honeycomb.script/dev.raycast.projectile/mgr.js";
import { MCUtil } from "../../scripts/src/_honeycomb.script/_utils/mc.util.js";
const raycastManager = manager.use(Raycast);


//example
manager.subscribe("itemUse", (ev) => {
    const { source, itemStack } = ev;
    if (itemStack.typeId !== "minecraft:stick") return;

    const sourceLoc = source.getHeadLocation();
    const viewDir = source.getViewDirection();
    const location = MCUtil.addVector3(sourceLoc, viewDir);

    raycastManager.addProjectile({
        dimension: source.dimension,
        location,
        rotation: source.getRotation(),
        speed: 5,
        gravity: 0.01,
        inertia: 1,
        maxAge: 20 * 1,
        particle(type) {
            switch (type) {
                case "trail": return [
                    {
                        effectName: "minecraft:balloon_gas_particle"
                    }
                ]
                default: return []
            }
        }
    });
});

manager.on("raycastProjectile:hitBlock", (ev) => {
    const { block: {location: blockLocation}, location } = ev;
    const loc = MCUtil.addVector3(blockLocation, location);
    ev.block.dimension.createExplosion(loc, 5);
});