import { AccDoor } from "../entities/acc_door.entity.js";
import { AccDoorInterface } from "../interfaces/index.js";

export class AccDoorResource {
    static collection(accDoors: AccDoor[]): AccDoorInterface[] {
        return accDoors.map(accdoor => this.accDoor(accdoor));
    }

    static accDoor(accDoor: AccDoor): AccDoorInterface {
        return {
            id: accDoor.id,
            dev_alias: accDoor.device.dev_alias,
            dev_id: accDoor.dev_id
        }
    }
}