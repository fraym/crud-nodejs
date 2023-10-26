import { DataOrder } from "@fraym/proto/freym/crud/delivery";

export interface Order {
    field: string;
    descending?: boolean;
}

export const getProtobufDataOrder = (order: Order[]): DataOrder[] => {
    return order.map(o => ({
        field: o.field,
        descending: o.descending ?? false,
    }));
};
