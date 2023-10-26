import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";
import { Filter, getProtobufDataFilter } from "./filter";

export const deleteCrudData = async (
    type: string,
    authData: AuthData,
    id: string,
    filter: Filter,
    eventMetadata: EventMetadata,
    serviceClient: ServiceClient
): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        serviceClient.deleteEntries(
            {
                type,
                auth: getProtobufAuthData(authData),
                id,
                filter: getProtobufDataFilter(filter),
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
