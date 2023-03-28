import { DeliveryServiceClient } from "@fraym/crud-proto";
import { AuthData, getProtobufAuthData } from "./auth";
import { Filter, getProtobufEntryFilter } from "./filter";

export const getCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    id: string,
    filter: Filter,
    returnEmptyDataIfNotFound: boolean,
    serviceClient: DeliveryServiceClient
): Promise<T | null> => {
    return new Promise<T | null>((resolve, reject) => {
        serviceClient.getEntry(
            {
                type,
                auth: getProtobufAuthData(authData),
                filter: getProtobufEntryFilter(filter),
                id,
                returnEmptyDataIfNotFound,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                const result = response.result;

                if (!result) {
                    resolve(null);
                    return;
                }

                const data: any = {};

                for (const key in result.data) {
                    data[key] = JSON.parse(result.data[key]);
                }

                resolve(data);
            }
        );
    });
};
