import { type Vector3, type VectorXZ } from "@minecraft/server";



export type TerrainVector = Vector3 & {
    isUserSet: boolean;
}

export class TerrainGenerator {
    #mappingIndex = new Map<string, TerrainVector>();
    get terrainMap() {
        return [...this.#mappingIndex.values()];
    }

    #minX: number;
    get minX() {
        return this.#minX;
    }
    #minZ: number;
    get minZ() {
        return this.#minZ;
    }
    #maxX: number;
    get maxX() {
        return this.#maxX;
    }
    #maxZ: number;
    get maxZ() {
        return this.#maxZ;
    }

    
    constructor(location1: Vector3, location2: Vector3) {
        const {x: x1, y: y1, z: z1} = location1;
        const {x: x2, y: y2, z: z2} = location2;

        this.#minX = Math.min(x1, x2);
        this.#minZ = Math.min(z1, z2);
        this.#maxX = Math.max(x1, x2);
        this.#maxZ = Math.max(z1, z2);

        const y = (y1 + y2) / 2;

        const minX_minZ: TerrainVector = {x: this.#minX, y, z: this.#minZ, isUserSet: true};
        this.#mappingIndex.set(this.#getMappingKey(minX_minZ), minX_minZ);

        const minX_maxZ: TerrainVector = {x: this.#minX, y, z: this.#maxZ, isUserSet: true};
        this.#mappingIndex.set(this.#getMappingKey(minX_maxZ), minX_maxZ);

        const maxX_minZ: TerrainVector = {x: this.#maxX, y, z: this.#minZ, isUserSet: true};
        this.#mappingIndex.set(this.#getMappingKey(maxX_minZ), maxX_minZ);

        const maxX_maxZ: TerrainVector = {x: this.#maxX, y, z: this.#maxZ, isUserSet: true};
        this.#mappingIndex.set(this.#getMappingKey(maxX_maxZ), maxX_maxZ);

        this.#genTerrainData();

        this.addMapping(location1);
        this.addMapping(location2);
    }



    #getMappingKey(vector: VectorXZ) {
        const {x, z} = vector;
        return `${x},${z}`;
    }
    
    addMapping(vector: Vector3) {
        const {x, z} = vector;
        if (x < this.#minX || x > this.#maxX || z < this.#minZ || z > this.#maxZ) return;
        const key = this.#getMappingKey(vector);
        this.#mappingIndex.set(key, {...vector, isUserSet: true});
        this.#genTerrainData();
    }

    removeMapping(vector: Vector3) {
        const {x, z} = vector;
        //角は削除できないようにする
        if (x === this.#minX && z === this.#minZ) return;
        if (x === this.#minX && z === this.#maxZ) return;
        if (x === this.#maxX && z === this.#minZ) return;
        if (x === this.#maxX && z === this.#maxZ) return;

        const key = this.#getMappingKey(vector);
        this.#mappingIndex.delete(key);
        this.#genTerrainData();
    }

    toggleMapping(vector: Vector3) {
        const key = this.#getMappingKey(vector);
        const current = this.#mappingIndex.get(key);
        if (current?.y === vector.y) {
            this.removeMapping(vector);
        } else {
            this.addMapping(vector);
        }
    }

    getMapping(vector: VectorXZ) {
        const key = this.#getMappingKey(vector);
        return this.#mappingIndex.get(key);
    }



    #terrainData: TerrainVector[] = [];
    get terrainData() {
        return this.#terrainData;
    }


    #genTerrainData() {
        const terrainVectorIndex: Map<string, TerrainVector> = new Map();


        const addLineMapping = (line: TerrainVector[], terrainMap: Map<string, TerrainVector>) => {
            line.forEach((vec, i) => {
                const nextVec = line[i + 1];
                if (!nextVec) {
                    terrainMap.set(this.#getMappingKey(vec), vec);
                    return;
                }
                const lineVec = genLineVector(vec, nextVec);
                lineVec.forEach(v => {
                    const key = this.#getMappingKey(v);
                    const currentVec = terrainMap.get(key);
                    if (currentVec) {
                        currentVec.y = (currentVec.y + v.y) / 2;
                    } else {
                        terrainMap.set(key, v);
                    }
                });
            });
        }
        
        
        const terrainMap = this.terrainMap;
        
        //辺の補完用ベクトル
        const lineMinX = terrainMap.filter(vec => vec.x === this.#minX).sort((a, b) => a.z - b.z);
        addLineMapping(lineMinX, terrainVectorIndex);

        const lineMaxX = terrainMap.filter(vec => vec.x === this.#maxX).sort((a, b) => a.z - b.z);
        addLineMapping(lineMaxX, terrainVectorIndex);

        const lineMinZ = terrainMap.filter(vec => vec.z === this.#minZ).sort((a, b) => a.x - b.x);
        addLineMapping(lineMinZ, terrainVectorIndex);

        const lineMaxZ = terrainMap.filter(vec => vec.z === this.#maxZ).sort((a, b) => a.x - b.x);
        addLineMapping(lineMaxZ, terrainVectorIndex);

        //内部のベクトル
        const insideVectors = terrainMap.filter(vec => vec.x > this.#minX && vec.x < this.#maxX && vec.z > this.#minZ && vec.z < this.#maxZ);
        insideVectors.forEach(vec => {
            terrainVectorIndex.set(this.#getMappingKey(vec), vec);
        });


        //内部の補完用ベクトル
        const terrainX = new Map<string, TerrainVector>();
        for (let x = this.#minX; x <= this.#maxX; x++) {
            const line = [...terrainVectorIndex.values()].filter(vec => vec.x === x).sort((a, b) => a.z - b.z);
            //追加した中点をx軸上に補完
            if (line.length > 2) addLineMapping(line, terrainX);
        }
        //追加した中点をz軸上に補完
        for (let z = this.#minZ; z <= this.#maxZ; z++) {
            const line = [...terrainX.values()].filter(vec => vec.z === z).sort((a, b) => a.x - b.x);
            addLineMapping(line, terrainX);
        }

        const terrainZ = new Map<string, TerrainVector>();
        for (let z = this.#minZ; z <= this.#maxZ; z++) {
            const line = [...terrainVectorIndex.values()].filter(vec => vec.z === z).sort((a, b) => a.x - b.x);
            //追加した中点をz軸上に補完
            if (line.length > 2) addLineMapping(line, terrainZ);
        }
        //追加した中点をx軸上に補完
        for (let x = this.#minX; x <= this.#maxX; x++) {
            const line = [...terrainZ.values()].filter(vec => vec.x === x).sort((a, b) => a.z - b.z);
            addLineMapping(line, terrainZ);
        }



        const minY = Math.min(...this.terrainMap.map(v => v.y));
        for (let x = this.#minX; x <= this.#maxX; x++) {
            for (let z = this.#minZ; z <= this.#maxZ; z++) {
                const key = this.#getMappingKey({x, z});
                const tx = terrainX.get(key);
                const tz = terrainZ.get(key);

                const y = ((tx?.y ?? minY) + (tz?.y ?? minY)) / 2;
                terrainVectorIndex.set(key, {x, y, z, isUserSet: false});
            }
        }


        // for (let x = this.#minX + 1; x < this.#maxX; x++) {
        //     const line = [...terrainVectorIndex.values()].filter(vec => vec.x === x).sort((a, b) => a.z - b.z);
        //     if (line.length > 2) addLineMapping(line, terrainVectorIndex);
        // }
        // for (let z = this.#minZ + 1; z < this.#maxZ; z++) {
        //     const line = [...terrainVectorIndex.values()].filter(vec => vec.z === z).sort((a, b) => a.x - b.x);
        //     if (line.length > 2) addLineMapping(line, terrainVectorIndex);
        // }


        this.#terrainData = [...terrainVectorIndex.values()].map(v => ({
            x: Math.round(v.x),
            y: Math.round(v.y),
            z: Math.round(v.z),
            isUserSet: v.isUserSet
        }));
    }
}



function getLineVector(sY: number, eY: number, distance: number) {
    return (eY - sY) / distance;
}

function getCurrentY(sY: number, vector: number, distance: number) {
    return sY + vector * distance;
}




function genLineVector(start: TerrainVector, end: TerrainVector, override: boolean = false): TerrainVector[] {
    const {x: sX, y: sY, z: sZ} = start;
    const {x: eX, y: eY, z: eZ} = end;
    const minX = Math.min(sX, eX);
    const minZ = Math.min(sZ, eZ);
    const maxX = Math.max(sX, eX);
    const maxZ = Math.max(sZ, eZ);
    const distance = Math.sqrt((maxX - minX) ** 2 + (maxZ - minZ) ** 2);
    const vectorX = getLineVector(sX, eX, distance);
    const vectorY = getLineVector(sY, eY, distance);
    const vectorZ = getLineVector(sZ, eZ, distance);

    const length = Math.floor(distance);
    const result: TerrainVector[] = new Array(length).fill(0).map((_, i) => ({
        x: getCurrentY(sX, vectorX, i),
        y: getCurrentY(sY, vectorY, i),
        z: getCurrentY(sZ, vectorZ, i),
        isUserSet: override ? true : i === 0 ? start.isUserSet : (i === length ? end.isUserSet : false)
    }));
    
    return result;
}