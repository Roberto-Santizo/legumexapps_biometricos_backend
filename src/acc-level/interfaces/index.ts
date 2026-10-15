export interface AccDoorInterface {
    id: string;
    dev_id: string;
    dev_alias: string;
}

export interface AccLevelDoorInterface extends AccDoorInterface {
    name: string;
}

export interface AccLevelInterface {
    id: string;
    name: string;
    creater_name: string;
    updater_name: string;
    create_time: Date;
    update_time: Date;
    doors: AccDoorInterface[]
}