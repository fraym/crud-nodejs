import { DeliveryServiceClient } from "@fraym/crud-proto";

export const deleteCrudData = async (
    tenantId: string,
    type: string,
    id: string,
    serviceClient: DeliveryServiceClient
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        serviceClient.deleteEntry(
            {
                tenantId,
                type,
                id,
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
