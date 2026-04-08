import { system, world } from "@minecraft/server";
import { StringUI, type StringUI_Value } from "../../scripts/src/_honeycomb.script/_utils/string.ui.js";




const name: StringUI_Value = {
    type: "text",
    label: "name",
    value: ""
};

const jump: StringUI_Value = {
    type: "checkbox",
    label: "Jump",
    value: false
};

const sneak: StringUI_Value = {
    type: "checkbox",
    label: "Sneak",
    value: false
};

const sprint: StringUI_Value = {
    type: "checkbox",
    label: "Sprint",
    value: false
};

const time: StringUI_Value = {
    type: "time",
    label: "time",
    value: 0
};


const SUI = new StringUI([
    name,
    jump,
    sneak,
    sprint,
    time
]);


system.runInterval(() => {
    time.value = world.getTimeOfDay();
    
    
    const players = world.getAllPlayers();
    players.forEach(p => {
        name.value = p.name;
        jump.value = p.isJumping;
        sneak.value = p.isSneaking;
        sprint.value = p.isSprinting;

        p.onScreenDisplay.setActionBar(SUI.toString());
    });
}, 1);