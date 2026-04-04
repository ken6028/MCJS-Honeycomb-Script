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
        return this.#ui.map(ui => this.#GenUI(ui)).join("\n");
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
        const { type, label, value, min, max, color, backColor } = ui;
        const tc = color ? StringUI.color[color] : "";
        const bc = backColor ? StringUI.color[backColor] : "";
        const hasMin = typeof min === "number";
        const hasMax = typeof max === "number";
        const hasMinMax = hasMin && hasMax;
        switch (type) {
            case "none": return "";
            case "text": {
                return `$${label}: ${tc}${value}`;
            }
            case "range": {
                if (hasMinMax) {
                    return `${label}: ${tc}${value}\n${this.#gauge(Number(value), min, max, tc, bc, false)}`;
                }
                return `${label}: ${tc}${value}`;
            }
            case "checkbox": {
                return `${tc}${value ? "▣" : "☐"} : ${label}`;
            }
            case "gauge": {
                if (hasMinMax) {
                    return `${label}: ${tc}${value}\n${this.#gauge(Number(value), min, max, tc, bc, true)}`;
                }
                return `${label}: ${tc}${value}`;
            }
        }
    }

    #gauge(value: number, min: number, max: number, tc: string, bc: string, fill: boolean) {
        const _min = Math.min(min, max);
        const _max = Math.max(min, max);
        const size = _max - _min;
        const rate = (value - _min) / size;
        const start = Math.max(0, Math.min(this.#size, Math.floor(rate * this.#size)-1));
        const after = this.#size - start - 1;
        return fill ?
            `${tc}${".".repeat(start+1)}${bc}${".".repeat(after)}` :
            `${bc}${".".repeat(start)}${tc}${"."}${bc}${".".repeat(after)}`;
    }
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


type StringUI_Type = "none" | "text" | "range" | "checkbox" | "gauge";

export type StringUI_Value = {
    type: StringUI_Type;
    label: string;
    value: string | number | boolean;
    min?: number;
    max?: number;
    color?: keyof StringUI_Color;
    backColor?: keyof StringUI_Color;
}


