import { DeliveryServiceClient } from "@fraym/crud-proto";

export interface CreatedCrudData {
    id: string;
}

export const createCrudData = async (
    tenantId: string,
    type: string,
    data: Record<string, any>,
    serviceClient: DeliveryServiceClient
): Promise<CreatedCrudData> => {
    const requestData: Record<string, string> = {};

    for (const key in data) {
        if (typeof data[key] === "string") {
            requestData[key] = data[key];
        } else {
            requestData[key] = JSON.stringify(data[key]);
        }
    }

    return new Promise<CreatedCrudData>((resolve, reject) => {
        serviceClient.createEntry(
            {
                tenantId,
                type,
                data: requestData,
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
