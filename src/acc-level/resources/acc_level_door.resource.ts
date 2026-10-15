import { AccLevelDoor } from "../entities/acc_level_door.entity.js";
import { AccLevelDoorInterface } from "../interfaces/index.js";

export class AccLevelDoorResource {
    static accLevelDoorCollection(accLevelDoors: AccLevelDoor[]) {
        return accLevelDoors.map(accLevelDoor => this.accLevelDoorResource(accLevelDoor))
    }

    static accLevelDoorResource(accLevelDoor: AccLevelDoor): AccLevelDoorInterface {
        return {
            id: accLevelDoor.id,
            name: accLevelDoor.accLevel.name,
            dev_alias: accLevelDoor.accDoor.device.dev_alias,
            dev_id: accLevelDoor.accDoor.dev_id
        }
    }
}