import { EntryOrder } from "@fraym/proto/freym/crud/delivery";

export interface Order {
    field: string;
    descending?: boolean;
}

export const getProtobufEntryOrder = (order: Order[]): EntryOrder[] => {
    return order.map(o => ({
        field: o.field,
        descending: o.descending ?? false,
    }));
};
