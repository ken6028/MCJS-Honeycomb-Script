import { MCUtil } from "./mc.util.js";

export class StringUI {
    #size = 20;
    get size() {
        return this.#size;
    }
    set size(value: number) {
        this.#size = value;
    }

    #ui: StringUI_Value[];
    get ui() {
        return this.#ui;
    }
    constructor(ui: StringUI_Value[]) {
        this.#ui = ui;
    }


    toString() {
        return this.#ui.map(ui => this.#GenUI(ui)).join("§r\n");
    }


    

    static #color: StringUI_Color = Object.freeze({
        black: "§0",
        dark_blue: "§1",
        dark_green: "§2",
        dark_aqua: "§3",
        dark_red: "§4",
        dark_purple: "§5",
        gold: "§6",
        gray: "§7",
        dark_gray: "§8",
        blue: "§9",
        green: "§a",
        aqua: "§b",
        red: "§c",
        light_purple: "§d",
        yellow: "§e",
        white: "§f",
        minecoin_gold: "§g",
        material_quartz: "§h",
        material_iron: "§i",
        material_netherite: "§j",
        material_redstone: "§m",
        material_copper: "§n",
        material_gold: "§p",
        material_emerald: "§q",
        material_diamond: "§s",
        material_lapis: "§t",
        material_amethyst: "§u",
        material_resin: "§v"
    });

    static get color() {
        return this.#color;
    }

    #GenUI(ui: StringUI_Value): string {
        const { type, label, value, min, max, color, backColor, secondColor } = ui;
        const tc = color ? StringUI.color[color] : StringUI.color.gray;
        const bc = backColor ? StringUI.color[backColor] : StringUI.color.white;
        const sc = secondColor ? StringUI.color[secondColor] : StringUI.color.green;
        const hasMin = typeof min === "number";
        const hasMax = typeof max === "number";
        const hasMinMax = hasMin && hasMax;
        switch (type) {
            case "none": return "";
            case "text": {
                return `${label}: ${tc}${value}`;
            }
            case "checkbox": {
                return `${tc}${value ? "▣" : "☐"}§r : ${label}`;
            }


            case "gauge":
            case "range":
            case "progress": {
                if (hasMinMax) {
                    const v = Number(value);
                    const minMax = this.#minMax(min, max);
                    const rate = (v - minMax.min) / (minMax.max - minMax.min) * 100;
                    switch (type) {
                        case "gauge":       return `${label}: ${tc}${value}§r (${rate.toFixed(1)}%)\n${this.#gauge(v, minMax, sc, bc, true)}`;
                        case "range":       return `${label}: ${tc}${value}§r\n${this.#gauge(v, minMax, sc, bc, false)}`;
                        case "progress":    return `${label}: ${tc}${rate.toFixed(1)}§r%\n${this.#gauge(v, minMax, sc, bc, true)}`;
                    }
                }
                return type === "progress" ?
                    `${label}: ${tc}${value}§r%` :
                    `${label}: ${tc}${value}`;
            }


            case "time": {
                const HMS = MCUtil.timeToHMS(Number(value));
                const { hours: h, minutes: m, seconds: s } = HMS;
                return `${label}: ${tc}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
            }
        }
    }

    #gauge(value: number, minMax: MinMax, tc: string, bc: string, fill: boolean) {
        const _min = minMax.min;
        const _max = minMax.max;
        const size = _max - _min;
        const rate = (value - _min) / size;
        const start = Math.max(0, Math.min(this.#size, Math.floor(rate * this.#size)-1));
        const after = this.#size - start - 1;
        return fill ?
            `${tc}${".".repeat(start+1)}${bc}${".".repeat(after)}` :
            `${bc}${".".repeat(start)}${tc}${"."}${bc}${".".repeat(after)}`;
    }

    #minMax(v1: number, v2: number): MinMax {
        return {
            min: Math.min(v1, v2),
            max: Math.max(v1, v2)
        }
    }
}

type MinMax = {
    min: number;
    max: number;
}


type StringUI_Color = {
    black: "§0",
    dark_blue: "§1",
    dark_green: "§2",
    dark_aqua: "§3",
    dark_red: "§4",
    dark_purple: "§5",
    gold: "§6",
    gray: "§7",
    dark_gray: "§8",
    blue: "§9",
    green: "§a",
    aqua: "§b",
    red: "§c",
    light_purple: "§d",
    yellow: "§e",
    white: "§f",
    minecoin_gold: "§g",
    material_quartz: "§h",
    material_iron: "§i",
    material_netherite: "§j",
    material_redstone: "§m",
    material_copper: "§n",
    material_gold: "§p",
    material_emerald: "§q",
    material_diamond: "§s",
    material_lapis: "§t",
    material_amethyst: "§u",
    material_resin: "§v"
}


type StringUI_Type = "none" | "text" | "range" | "checkbox" | "gauge" | "progress" | "time";

export type StringUI_Value = {
    type: StringUI_Type;
    label: string;
    value: string | number | boolean;
    min?: number;
    max?: number;
    color?: keyof StringUI_Color;
    backColor?: keyof StringUI_Color;
    secondColor?: keyof StringUI_Color;
}


