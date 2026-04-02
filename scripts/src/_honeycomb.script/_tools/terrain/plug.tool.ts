import { BlockVolume, GameMode, Player, system, world, type Vector3 } from "@minecraft/server";
import { TerrainGenerator } from "./terrain.js";
import type { PlayerPluginEntry } from "../../player/mgr.js";
import { EX_ActionForm } from "../../_utils/form.js";

const plugin: PlayerPluginEntry<void> = (core) => {
    const manager = core.MCManager();
    manager.on("playerManager:addPlayer", ({ wrapper}) => {
        wrapper.plugTerrain = {
            generator: undefined,
            location: undefined,
            lastToggleTick: 0,
        };
    })
    
    
    
    
    manager.subscribe("itemUse", (ev) => {
        const { source, itemStack } = ev;
        //使用条件
        if (source.getGameMode() !== GameMode.Creative || itemStack?.typeId !== "minecraft:wooden_axe") return;
        const wrapper = core.playerManager.getPlayer(source);
        if (!wrapper) return;

        const { plugTerrain } = wrapper;
        const terrain = plugTerrain.generator;
        if (!terrain) return;

        const form = new EX_ActionForm();
        form.button({text: "エリアを解除", onClick() {
            plugTerrain.generator = undefined;
        }})

        form.button({text: "エリアをリセット", onClick() {
            const data = terrain.terrainMap;
            const minY = Math.min(...data.map(v => v.y));
            const maxY = Math.max(...data.map(v => v.y));
            
            const loc1 = { x: terrain.minX, y: minY, z: terrain.minZ };
            const loc2 = { x: terrain.maxX, y: maxY, z: terrain.maxZ };

            const area = new BlockVolume(loc1, loc2);
            source.dimension.fillBlocks(area, "minecraft:air");

            data.forEach(vec => {
                source.dimension.setBlockType(vec, "minecraft:glass");
            });
        }});

        form.show(source);
    });
    
    
    core.MCManager().subscribeBefore("playerBreakBlock", (ev) => {
        const { player, block, itemStack } = ev;
        if (player.getGameMode() !== GameMode.Creative || itemStack?.typeId !== "minecraft:wooden_axe") return;
        const wrapper = core.playerManager.getPlayer(player);
        if (!wrapper) return;

        
        ev.cancel = true;


        const { plugTerrain } = wrapper;
        const { location, lastToggleTick } = plugTerrain
        const terrain = plugTerrain.generator;
        //連打防止
        const now = system.currentTick;
        if (lastToggleTick + 3 > now) return;
        plugTerrain.lastToggleTick = now;

        if (terrain) {
            terrain.toggleMapping(block.location);
            
        } else {
            if (!location) {
                plugTerrain.location = block.location;
                player.sendMessage("エリアの始点を設定しました。");
                return;
            }
            const newTerrain = new TerrainGenerator(location, block.location);
            plugTerrain.generator = newTerrain;
            plugTerrain.location = undefined;
            player.sendMessage("エリアを設定しました。");
            plugTerrain.lastToggleTick = 0;
        }

    });


    manager.subscribe("playerPlaceBlock", (ev) => {
        const { player, block } = ev;
        if (player.getGameMode() !== GameMode.Creative) return;
        const wrapper = core.playerManager.getPlayer(player);
        if (!wrapper) return;

        const { plugTerrain } = wrapper;
        const terrain = plugTerrain.generator;
        if (!terrain) return;

        const blockLoc = block.location;
        const data = terrain.getMapping(blockLoc);
        if (!data?.isUserSet || data?.y !== blockLoc.y) return;
        
        const { terrainData } = terrain;
        const { dimension } = player;

        const minY = Math.min(...terrainData.map(v => v.y));
        terrainData.forEach(v => {
            const volume = new BlockVolume(v, {...v, y: minY});
            dimension.fillBlocks(volume, block.permutation);
        })
    })



    manager.on("tick", ({currentTick}) => {
        if (currentTick % 20 * 5 !== 0) return;
        const allPlayers = core.playerManager.allPlayers;

        allPlayers.forEach(wrapper => {
            const { player, plugTerrain } = wrapper;
            const terrainLocation = plugTerrain.location;
            const terrain = plugTerrain.generator;
            if (player.getGameMode() !== GameMode.Creative) return;
            if (!terrain) {
                if (terrainLocation) blockPerticle(terrainLocation, player);
                return;
            }


            const { location } = player;
            terrain.terrainData.forEach(vec => {
                const loc = {x: vec.x + 0.5, y: vec.y + 0.5, z: vec.z + 0.5};
                const distance = Math.sqrt((loc.x - location.x) ** 2 + (loc.z - location.z) ** 2);
                if (distance > 10) return;
                
                player.spawnParticle(
                    "minecraft:endrod",
                    {x: vec.x + 0.5, y: vec.y + 0.5, z: vec.z + 0.5}
                );
            });
            terrain.terrainMap.forEach(vec => {
                blockPerticle(vec, player);
            })
        });
    });
}


function blockPerticle(loc: Vector3, player: Player) {
    const b = (v: Vector3[], e: (v: Vector3) => Vector3): Vector3[] => {
        return v.map(v => (
            [v, e(v)]
        )).flat();
    };
    
    const x = (v: Vector3[]) => b(v, v => ({...v, x: v.x+1}));
    const y = (v: Vector3[]) => b(v, v => ({...v, y: v.y+1}));
    const z = (v: Vector3[]) => b(v, v => ({...v, z: v.z+1}));
    
    const corners = x(y(z([loc])));
    // world.sendMessage(JSON.stringify(corners.length));
    corners.forEach(v => {
        player.spawnParticle("minecraft:basic_flame_particle", v);
    });
}







export default plugin;



declare module "../../player/wrapper.js" {
    interface PlayerWrapper {
        plugTerrain: {
            generator: TerrainGenerator | undefined;
            location: Vector3 | undefined;
            lastToggleTick: number;
        }
        // terrain: TerrainGenerator | undefined;
        // terrainLocation: Vector3 | undefined;
        // lastToggleTick: number;
    }
}