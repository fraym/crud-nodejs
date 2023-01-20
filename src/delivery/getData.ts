import { DeliveryServiceClient } from "@fraym/crud-proto";

export const getCrudData = async <T extends {}>(
    tenantId: string,
    type: string,
    id: string,
    returnEmptyDataIfNotFound: boolean,
    serviceClient: DeliveryServiceClient
): Promise<T | null> => {
    return new Promise<T | null>((resolve, reject) => {
        serviceClient.getEntries(
            {
                tenantId,
                type,
                id,
                limit: 0,
                page: 0,
                returnEmptyDataIfNotFound,
                filter: { fields: {}, and: [], or: [] },
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                if (response.result.length !== 1) {
                    resolve(null);
                    return;
                }

                const data: any = {};
                const resultData = response.result[0].data;

                for (const key in resultData) {
                    data[key] = JSON.parse(resultData[key]);
                }

                resolve(data);
            }
        );
    });
};
