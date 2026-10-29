import { Position } from "../entities/position.entity.js";
import { PositionResourceInterface } from "../interfaces/index.js";

export class PositionResource {
    static collection(positions: Position[]) {
        return positions.map(position => this.positionResource(position));
    }

    static positionResource(position: Position): PositionResourceInterface {
        return {
            id: position.id,
            code: position.code,
            name: position.name,
            employee: position.employee ? position.employee.name : 'Sin empleado asociado',
            createdBy: position.creater_name,
            updatedBy: position.updater_name
        }
    }
}