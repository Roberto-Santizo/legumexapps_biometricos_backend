import { PositionFinca } from "../entities/position-finca.entity.js";
import { FincaPositionInterface } from "../interfaces/index.js";

export class FincaPositionResource {
    static collection(positions: PositionFinca[]): FincaPositionInterface[] {
        return positions.map(position => this.fincaPositionResource(position));
    }

    static fincaPositionResource(fincaPosition: PositionFinca): FincaPositionInterface {
        return {
            id: fincaPosition.id,
            position_code: fincaPosition.position_code,
            position_name: fincaPosition.position_name,
            company_id: fincaPosition.company_id,
            is_default: fincaPosition.is_default ? true : false,
            parent_position_id: fincaPosition.parent_position_id
        }
    }
}