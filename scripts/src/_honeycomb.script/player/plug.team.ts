import { AutoIncrementID } from "../_utils/id.js";
import type { PlayerPluginEntry, PlayerWrapper } from "./mgr.js";



type TeamRule = {
    friendlyFire: boolean;
}


class Team extends AutoIncrementID {
    static #teams: Team[] = [];
    static get teams() {
        return [...this.#teams];
    }
    static getTeam(id: number) {
        return this.#teams.find(t => t.id === id);
    }


    static #index = new Map<PlayerWrapper, Team>();
    static getPlayerTeam(wrapper: PlayerWrapper) {
        return this.#index.get(wrapper);
    }
    
    


    #isDeleted = false;
    get isDeleted() {
        return this.#isDeleted;
    }


    #name: string;
    #members: PlayerWrapper[] = [];

    get name() {
        return this.#name;
    }
    set name(value: string) {
        if (this.isDeleted) return;
        this.#name = value;
    }


    get members() {
        return [...this.#members];
    }

    constructor(name: string) {
        super();
        this.#name = name;
        Team.#teams.push(this);
    }

    join(wrapper: PlayerWrapper): boolean {
        if (this.isDeleted) return false;
        //すでに所属している場合は何もしない
        if (this.#members.includes(wrapper)) return false;
        const currentTeam = Team.#index.get(wrapper);
        //別のチームに所属している場合は脱退させる
        if (currentTeam && currentTeam !== this) currentTeam.leave(wrapper);
        this.#members.push(wrapper);
        Team.#index.set(wrapper, this);
        return true;
    }

    leave(wrapper: PlayerWrapper): boolean {
        if (this.isDeleted) return false;
        const index = this.#members.indexOf(wrapper);
        if (index === -1) return false;
        this.#members.splice(index, 1);
        Team.#index.delete(wrapper);
        return true;
    }

    delete(): boolean {
        if (this.isDeleted) return false;
        this.#members.forEach(member => {
            this.leave(member);
        });
        Team.#teams.splice(Team.#teams.indexOf(this), 1);
        return true;
    }
}


type PlugTeam = {
    createTeam(name: string): Team;
    getTeam(id: number): Team | undefined;
    allTeams: Team[];
    getPlayerTeam(wrapper: PlayerWrapper): Team | undefined;
}


const plugin: PlayerPluginEntry<PlugTeam> = (core) => {
    class Team_Wrapper extends Team {
        constructor(name: string) {
            super(name);
            core.emit("playerTeam:createTeam", {team: this});
        }

        join(wrapper: PlayerWrapper): boolean {
            const result = super.join(wrapper);
            if (result) core.emit("playerTeam:join", {wrapper, team: this});
            return result;
        }

        leave(wrapper: PlayerWrapper): boolean {
            const result = super.leave(wrapper);
            if (result) core.emit("playerTeam:leave", {wrapper, team: this});
            return result;
        }

        delete(): boolean {
            const result = super.delete();
            if (result) core.emit("playerTeam:deleteTeam", {team: this});
            return result;
        }
    };




    const MCManager = core.MCManager();
    MCManager.on("playerManager:removePlayer", (ev) => {
        const wrapper = ev.wrapper;
        const team = Team.getPlayerTeam(wrapper);
        if (team) team.leave(wrapper);
    });




    return {
        createTeam(name: string) {
            return new Team_Wrapper(name);
        },
        getTeam(id: number) {
            return Team.getTeam(id);
        },
        get allTeams() {
            return Team.teams;
        },
        getPlayerTeam(wrapper: PlayerWrapper) {
            return Team_Wrapper.getPlayerTeam(wrapper);
        }
    };
    
}

export default plugin;



declare module "../mc.manager.js" {
    interface EX_EventDataMap {
        "playerTeam:createTeam": {
            team: Team;
        };
        "playerTeam:deleteTeam": {
            team: Team;
        };
        "playerTeam:join": {
            wrapper: PlayerWrapper;
            team: Team;
        };
        "playerTeam:leave": {
            wrapper: PlayerWrapper;
            team: Team;
        };
    }
}
