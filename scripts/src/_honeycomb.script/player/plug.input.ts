import { PlayerWrapper, type PlayerPluginEntry } from "./mgr.js";


const plugin: PlayerPluginEntry<void> = (core) => {
    //playerManagerの全プレイヤー取得はクローンされるので負荷対策
    const allPlayers: PlayerWrapper[] = [];
    
    //プレイヤーの追加と削除を管理
    const manager = core.MCManager();
    manager.on("playerManager:addPlayer", (ev) => {
        allPlayers.push(ev.wrapper);
        ev.wrapper.input = {
            jumpStart: 0,
            sneakStart: 0,
            sprintStart: 0
        }
    });
    manager.on("playerManager:removePlayer", (ev) => {
        allPlayers.splice(allPlayers.indexOf(ev.wrapper), 1);
    });


    //プレイヤーの入力を管理
    manager.on("tick", ({ currentTick }) => {
        allPlayers.forEach(wrapper => {
            const player = wrapper.player;
            const { isJumping, isSneaking, isSprinting } = player;
            const input = wrapper.input;

            //ジャンプ
            if ( isJumping && input.jumpStart === 0) {
                input.jumpStart = currentTick;
                core.emit("playerInput:jumpStart", {wrapper});

            } else if (!isJumping && input.jumpStart !== 0) {
                const jumpDuration = currentTick - input.jumpStart;
                input.jumpStart = 0;
                core.emit("playerInput:jumpEnd", {wrapper, jumpDuration});
                
            }

            //しゃがみ
            if (isSneaking && input.sneakStart === 0) {
                input.sneakStart = currentTick;
                core.emit("playerInput:sneakStart", {wrapper});
                
            } else if (!isSneaking && input.sneakStart !== 0) {
                const sneakDuration = currentTick - input.sneakStart;
                input.sneakStart = 0;
                core.emit("playerInput:sneakEnd", {wrapper, sneakDuration});
                
            }

            //ダッシュ
            if (isSprinting && input.sprintStart === 0) {
                input.sprintStart = currentTick;
                core.emit("playerInput:sprintStart", {wrapper});

            } else if (!isSprinting && input.sprintStart !== 0) {
                const sprintDuration = currentTick - input.sprintStart;
                input.sprintStart = 0;
                core.emit("playerInput:sprintEnd", {wrapper, sprintDuration});

            }
            
        });
    });
}

export default plugin;





declare module "./mgr.js" {
    interface PlayerWrapper {
        input: {
            /**ジャンプ入力を開始したtick */
            jumpStart: number;
            /**スニーク入力を開始したtick */
            sneakStart: number;
            /**スプリント入力を開始したtick */
            sprintStart: number;
        }
    }
}

declare module "../mc.manager.js" {
    interface EX_EventDataMap {
        "playerInput:jumpStart": {
            wrapper: PlayerWrapper;
        };
        "playerInput:jumpEnd": {
            wrapper: PlayerWrapper;
            jumpDuration: number;
        };
        "playerInput:sneakStart": {
            wrapper: PlayerWrapper;
        };
        "playerInput:sneakEnd": {
            wrapper: PlayerWrapper;
            sneakDuration: number;
        };
        "playerInput:sprintStart": {
            wrapper: PlayerWrapper;
        };
        "playerInput:sprintEnd": {
            wrapper: PlayerWrapper;
            sprintDuration: number;
        };
    }
}
