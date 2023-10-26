import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { Filter, getProtobufEntryFilter } from "./filter";
import { Wait, getProtobufEntryWait } from "./wait";

export const getCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    id: string,
    filter: Filter,
    returnEmptyDataIfNotFound: boolean,
    serviceClient: ServiceClient,
    wait?: Wait
): Promise<T | null> => {
    return new Promise<T | null>((resolve, reject) => {
        serviceClient.getEntry(
            {
                type,
                auth: getProtobufAuthData(authData),
                filter: getProtobufEntryFilter(filter),
                id,
                returnEmptyDataIfNotFound,
                wait: getProtobufEntryWait(wait),
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
