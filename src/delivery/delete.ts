import { DeliveryServiceClient } from "@fraym/crud-proto";
import { Filter, getProtobufEntryFilter } from "./filter";

export const deleteCrudData = async (
    tenantId: string,
    type: string,
    id: string,
    filter: Filter,
    serviceClient: DeliveryServiceClient
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        serviceClient.deleteEntries(
            {
                tenantId,
                type,
                id,
                filter: getProtobufEntryFilter(filter),
            },
            error => {
                if (error) {
                    reject(error.message);
                    return;
                }

                resolve();
            }
        );
    });
};
