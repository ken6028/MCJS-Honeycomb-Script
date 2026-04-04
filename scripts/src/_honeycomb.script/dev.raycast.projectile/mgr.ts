import { Block, Entity, type Vector3 } from "@minecraft/server";
import type { ManagerType, PluginEntryType } from "../_manager.js";
import type { MCManagerCore, PluginEntry } from "../mc.manager.js";
import { RaycastProjectile, type RaycastProjectileOptions } from "./projectile.js";


type ManagerCore = MCManagerCore & {
    raycastProjectile: {
        manager: RaycastProjectileManager;
        addProjectile: (projectile: RaycastProjectile) => void;
        removeProjectile: (projectile: RaycastProjectile) => void;
    };
}


export type RaycastProjectile_PluginEntry<result> = PluginEntryType<ManagerCore, result>;

class RaycastProjectileManager implements ManagerType<ManagerCore> {
    #projectiles = new Map<number, RaycastProjectile>();
    
    #core: ManagerCore;

    constructor(core: MCManagerCore) {
        this.#core = {
            ...core,
            raycastProjectile: {
                manager: this,
                addProjectile: (projectile: RaycastProjectile): void => {
                    this.#projectiles.set(projectile.id, projectile);
                },
                removeProjectile: (projectile: RaycastProjectile): void => {
                    this.#projectiles.delete(projectile.id);
                }
            }
        };

        core.MCManager().on("tick", () => {
            this.#projectiles.forEach((projectile) => {
                const ok = projectile.tick();
                if (!ok) this.removeProjectile(projectile);
            });
        });
    }


    
    use<plugin extends PluginEntryType<ManagerCore, any>>(plug: plugin): ReturnType<plugin> {
        return plug(this.#core);
    }


    addProjectile(options: Omit<RaycastProjectileOptions, "onHitEntities" | "onHitBlock">) {
        const projectile = new RaycastProjectile({
            ...options,
            onHitEntities: (hits) => {
                hits.forEach(hit => {
                    this.#core.emit("raycastProjectile:hitEntity", {
                        projectile,
                        entity: hit.entity
                    });
                });
            },
            onHitBlock: (hit) => {
                this.#core.emit("raycastProjectile:hitBlock", {
                    projectile,
                    block: hit.block,
                    location: hit.faceLocation,
                });
            }
        });
        this.#projectiles.set(projectile.id, projectile);
        this.#core.emit("raycastProjectile:add", { projectile });

        return projectile;
    }

    removeProjectile(projectile: RaycastProjectile) {
        this.#projectiles.delete(projectile.id);
        this.#core.emit("raycastProjectile:remove", { projectile });
    }

    pushProjectile(projectile: RaycastProjectile) {
        this.#projectiles.set(projectile.id, projectile);
        this.#core.emit("raycastProjectile:add", { projectile });
    }
}



declare module "../mc.manager.js" {
    export interface EX_EventDataMap {
        "raycastProjectile:add": {
            projectile: RaycastProjectile;
        };
        "raycastProjectile:remove": {
            projectile: RaycastProjectile;
        };
        "raycastProjectile:hitEntity": {
            projectile: RaycastProjectile;
            entity: Entity;
        };
        "raycastProjectile:hitBlock": {
            projectile: RaycastProjectile;
            block: Block;
            location: Vector3;
        };
    }
}


const plugin: PluginEntry<RaycastProjectileManager> = (core) => {
    return new RaycastProjectileManager(core);
}

export default plugin;