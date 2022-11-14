import { DeliveryServiceClient } from "@fraym/crud-proto";

export type GetCrudData = Record<string, any>;

export const getCrudData = async (
    tenantId: string,
    type: string,
    id: string,
    serviceClient: DeliveryServiceClient
): Promise<GetCrudData | null> => {
    return new Promise<GetCrudData | null>((resolve, reject) => {
        serviceClient.getEntries(
            {
                tenantId,
                type,
                id,
                limit: 0,
                page: 0,
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

                const data: Record<string, any> = {};
                const resultData = response.result[0].data;

                for (const key in resultData) {
                    data[key] = JSON.parse(resultData[key]);
                }

                resolve(data);
            }
        );
    });
};
