import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { Filter, getProtobufDataFilter } from "./filter";
import { Wait, getProtobufDataWait } from "./wait";

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
                filter: getProtobufDataFilter(filter),
                id,
                returnEmptyDataIfNotFound,
                wait: getProtobufDataWait(wait),
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
