import { DeliveryServiceClient } from "@fraym/crud-proto";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";
import { Filter, getProtobufEntryFilter } from "./filter";

export const deleteCrudData = async (
    type: string,
    authData: AuthData,
    id: string,
    filter: Filter,
    eventMetadata: EventMetadata,
    serviceClient: DeliveryServiceClient
): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        serviceClient.deleteEntries(
            {
                type,
                auth: getProtobufAuthData(authData),
                id,
                filter: getProtobufEntryFilter(filter),
                eventMetadata,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                resolve(response.numberOfDeletedEntries);
            }
        );
    });
};
