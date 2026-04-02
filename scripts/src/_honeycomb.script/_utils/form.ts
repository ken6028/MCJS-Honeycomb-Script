import type { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { PlayerWrapper } from "../player/wrapper.js";


type Callback = () => void;
type FormButton = {
    text: string;
    onClick: Callback;
    icon?: string;
};

export class EX_ActionForm extends ActionFormData {
    #buttonCallbacks: Callback[] = [];
    button({text, onClick, icon}: FormButton) {
        super.button(text, icon);
        this.#buttonCallbacks.push(onClick);

        return this;
    }


    show(player: Player | PlayerWrapper) {
        const p = player instanceof PlayerWrapper ? player.player : player;
        const res = super.show(p);
        res.then((res) => {
            const { selection } = res;
            if (selection === undefined) return;
            const callback = this.#buttonCallbacks[selection];
            callback?.();
        });
        return res;
    }
}