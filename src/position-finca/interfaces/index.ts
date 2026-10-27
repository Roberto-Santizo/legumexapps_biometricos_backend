export interface FincaPositionInterface {
    id: number;
    position_code: string;
    position_name: string;
    is_default: boolean;
    company_id: number;
    parent_position_id?: number;
}