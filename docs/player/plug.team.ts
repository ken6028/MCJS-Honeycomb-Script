import { world } from "@minecraft/server";
import { MCManager } from "../../scripts/src/_honeycomb.script/mc.manager.js";

const manager = new MCManager();

//MGR
import PlayerManager from "../../scripts/src/_honeycomb.script/player/mgr.js";
const playerManager = manager.use(PlayerManager);

//PLG
import Team from "../../scripts/src/_honeycomb.script/player/plug.team.js";
const teamPlugin = playerManager.use(Team);


//example
const teamA = teamPlugin.createTeam("A");
const teamB = teamPlugin.createTeam("B");

manager.on("playerManager:addPlayer", (ev) => {
    const wrapper = ev.wrapper;
    if (teamA.members.length <= teamB.members.length) {
        teamA.join(wrapper);

    } else {
        teamB.join(wrapper);

    }
});


manager.on("playerTeam:join", (ev) => {
    const { wrapper, team } = ev;
    world.sendMessage(`${wrapper.player.name} joined ${team.name}`);

});


manager.on("playerTeam:leave", (ev) => {
    const { wrapper, team } = ev;
    world.sendMessage(`${wrapper.player.name} left ${team.name}`);

});