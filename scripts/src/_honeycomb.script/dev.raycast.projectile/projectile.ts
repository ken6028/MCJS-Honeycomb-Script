import type { BlockRaycastHit, Dimension, Entity, EntityRaycastHit, Vector2, Vector3 } from "@minecraft/server";
import { AutoIncrementID } from "../_utils/id.js";

export type RaycastProjectileOptions = {
    /**発射位置 */
    location: Vector3;
    /**発射角度 */
    rotation: Vector2;
    /**速度 */
    speed: number;
    /**重力*/
    gravity: number;
    /**慣性 */
    inertia: number;
    /**最大寿命*/
    maxAge: number;
    /**発射元の次元 */
    dimension: Dimension;
    /**エンティティに当たったときの処理 */
    onHitEntities: OnHitEntitiesCallback;
    /**ブロックに当たったときの処理 */
    onHitBlock: OnHitBlockCallback;
}



type OnHitEntitiesCallback = (hits: EntityRaycastHit[]) => void;
type OnHitBlockCallback = (hit: BlockRaycastHit) => void;


export class RaycastProjectile extends AutoIncrementID {
    //初期
    #dimension: Dimension;
    #maxAge: number;
    #gravity: number;
    #inertia: number;

    #onHitEntities: OnHitEntitiesCallback;
    #onHitBlock: OnHitBlockCallback;


    get dimension() {
        return this.#dimension;
    }
    
    get location() {
        return this.#location;
    }


    //更新
    #currentAge = 0;
    #location: Vector3;
    #velocity: Vector3;


    //自動計算
    get speed() {
        return Math.sqrt(this.#velocity.x ** 2 + this.#velocity.y ** 2 + this.#velocity.z ** 2);
    }

    set speed(speed: number) {
        const rotation = this.rotation;
        const rotX = rotation.x * (Math.PI / 180);
        const rotY = rotation.y * (Math.PI / 180);
        this.#velocity = {
            x: -Math.sin(rotY) * Math.cos(rotX) * speed,
            y: -Math.sin(rotX) * speed,
            z: Math.cos(rotY) * Math.cos(rotX) * speed,
        }
    }

    get rotation(): Vector2 {
        const rotX = Math.asin(-this.#velocity.y / Math.sqrt(this.#velocity.x ** 2 + this.#velocity.y ** 2 + this.#velocity.z ** 2)) * (180 / Math.PI);
        const rotY = Math.atan2(-this.#velocity.x, this.#velocity.z) * (180 / Math.PI);
        return { x: rotX, y: rotY };
    }

    set rotation(rotation: Vector2) {
        const speed = this.speed;
        const rotX = rotation.x * (Math.PI / 180);
        const rotY = rotation.y * (Math.PI / 180);
        this.#velocity = {
            x: -Math.sin(rotY) * Math.cos(rotX) * speed,
            y: -Math.sin(rotX) * speed,
            z: Math.cos(rotY) * Math.cos(rotX) * speed,
        };
    }


    constructor(options: RaycastProjectileOptions) {
        super();
        this.#dimension = options.dimension;
        this.#maxAge = options.maxAge;
        this.#gravity = options.gravity;
        this.#inertia = options.inertia;
        this.#onHitEntities = options.onHitEntities;
        this.#onHitBlock = options.onHitBlock;

        this.#location = options.location;

        //角度から速度ベクトル
        const rotX = options.rotation.x * (Math.PI / 180);
        const rotY = options.rotation.y * (Math.PI / 180);
        this.#velocity = {
            x: -Math.sin(rotY) * Math.cos(rotX) * options.speed,
            y: -Math.sin(rotX) * options.speed,
            z: Math.cos(rotY) * Math.cos(rotX) * options.speed,
        }
    }
    
    tick() {
        if (this.#currentAge++ > this.#maxAge) return false;


        const speed = this.speed;
        if (speed === 0) return false;
        
        //衝突
        const hitEntities = this.checkEntityHit();
        if (hitEntities.length > 0) {
            this.#onHitEntities(hitEntities);
        } else {
            //エンティティに当たらなかった場合はブロックに当たったか確認
            const hitBlock = this.checkBlockHit();
            if (hitBlock) this.#onHitBlock(hitBlock);
        }


        //位置の更新
        this.#location.x += this.#velocity.x;
        this.#location.y += this.#velocity.y;
        this.#location.z += this.#velocity.z;

        //重力と慣性の影響
        this.#velocity.x *= this.#inertia;
        this.#velocity.y *= this.#inertia;
        this.#velocity.z *= this.#inertia;
        this.#velocity.y -= this.#gravity;

        return true;
    }

    checkEntityHit(): EntityRaycastHit[] {
        const speed = this.speed;
        if (speed === 0) return [];
        return this.#dimension.getEntitiesFromRay(this.#location, this.#velocity, {
            maxDistance: speed,
        });
    }

    checkBlockHit(): BlockRaycastHit | undefined {
        const speed = this.speed;
        if (speed === 0) return;
        return this.#dimension.getBlockFromRay(this.#location, this.#velocity, {
            maxDistance: Math.ceil(speed),
        });
    }
}



export class RaycastProjectile_Particle extends RaycastProjectile {
    tick(): boolean {
        try {
            this.dimension.spawnParticle("minecraft:balloon_gas_particle", this.location);
        } catch {
            
        }
        return super.tick();
    }
}