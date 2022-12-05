import { DeliveryServiceClient } from "@fraym/crud-proto";

export interface GetCrudDataList {
    limit: number;
    page: number;
    data: Record<string, any>[];
}

export const getCrudDataList = async (
    tenantId: string,
    type: string,
    limit: number,
    page: number,
    serviceClient: DeliveryServiceClient
): Promise<GetCrudDataList | null> => {
    return new Promise<GetCrudDataList | null>((resolve, reject) => {
        serviceClient.getEntries(
            {
                tenantId,
                type,
                id: "",
                limit,
                page,
                returnEmptyDataIfNotFound: false,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                const data: Record<string, any>[] = [];

                for (const result of response.result) {
                    const dataRecord: Record<string, any> = {};
                    const resultData = result.data;

                    for (const key in resultData) {
                        dataRecord[key] = JSON.parse(resultData[key]);
                    }

                    data.push(dataRecord);
                }

                resolve({
                    limit: response.limit,
                    page: response.page,
                    data,
                });
            }
        );
    });
};
