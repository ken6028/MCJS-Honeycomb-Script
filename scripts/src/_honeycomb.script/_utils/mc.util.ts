import { TicksPerDay } from "@minecraft/server";

const day = TicksPerDay;
const hour = day / 24;
const minute = hour / 60;
const second = minute / 60;
//Minecraftの基準時間
const timeOffset = hour * 6;


type HM = {
    hours: number;
    minutes: number;
}

type HMS = HM & {
    seconds: number;
}


export class MCUtil {
    static get TicksPerDay() {return day;}

    static get TicksPerHour() {return hour;}

    static get TicksPerMinute() {return minute;}

    static get TicksPerSecond() {return second;}

    static get TimeOffset() {return timeOffset;}

    static timeToHMS(time: number): HMS {
        const now = (time + this.TimeOffset) % this.TicksPerDay;
        const hours = Math.floor(now / this.TicksPerHour);
        const minutes = Math.floor((now % this.TicksPerHour) / this.TicksPerMinute);
        const seconds = Math.floor((now % this.TicksPerMinute) / this.TicksPerSecond);
        return { hours, minutes, seconds };
    }

    static timeToHM(time: number): HM {
        const now = (time + this.TimeOffset) % this.TicksPerDay;
        const hours = Math.floor(now / this.TicksPerHour);
        const minutes = Math.floor((now % this.TicksPerHour) / this.TicksPerMinute);
        return { hours, minutes };
    }

}