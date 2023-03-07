import { DeliveryServiceClient } from "@fraym/crud-proto";

export const updateCrudData = async (
    tenantId: string,
    type: string,
    id: string,
    data: Record<string, any>,
    serviceClient: DeliveryServiceClient
): Promise<void> => {
    const requestData: Record<string, string> = {};

    for (const key in data) {
        requestData[key] = JSON.stringify(data[key]);
    }

    return new Promise<void>((resolve, reject) => {
        serviceClient.updateEntry(
            {
                tenantId,
                type,
                id,
                data: requestData,
            },
            error => {
                if (error) {
                    reject(error.message);
                    return;
                }

                resolve();
            }
        );
    });
};
