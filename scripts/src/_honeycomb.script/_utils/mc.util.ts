import { TicksPerDay, type Vector2, type Vector3 } from "@minecraft/server";

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



const radToDeg = 180 / Math.PI;
const degToRad = Math.PI / 180;


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

    static addVector3(v1: Vector3, v2: Vector3): Vector3 {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        }
    }

    static subVector3(v1: Vector3, v2: Vector3): Vector3 {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        }
    }


    static getRotation(from: Vector3, to: Vector3): Vector2 {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance === 0) return { x: 0, y: 0 };

        const rotY = Math.atan2(-dx, dz) * radToDeg;
        const rotX = Math.asin(dy / distance) * radToDeg;

        return { x: rotX, y: rotY };
    }


    static getRotateDiff(a: number, b: number): number {
        const diff = (b - a + 180) % 360 - 180;
        return diff < -180 ? diff + 360 : diff;
    }
}