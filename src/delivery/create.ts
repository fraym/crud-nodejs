import { DeliveryServiceClient } from "@fraym/crud-proto";

export interface CreatedCrudData {
    id: string;
}

export const createCrudData = async (
    tenantId: string,
    type: string,
    data: Record<string, any>,
    id: string,
    serviceClient: DeliveryServiceClient
): Promise<CreatedCrudData> => {
    const requestData: Record<string, string> = {};

    for (const key in data) {
        requestData[key] = JSON.stringify(data[key]);
    }

    return new Promise<CreatedCrudData>((resolve, reject) => {
        serviceClient.createEntry(
            {
                tenantId,
                type,
                data: requestData,
                id,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                resolve({
                    id: response.id,
                });
            }
        );
    });
};
