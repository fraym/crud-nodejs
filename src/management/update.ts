import { ManagementServiceClient } from "@fraym/crud-proto";

export const updateCrudTypes = async (
    schema: string,
    serviceClient: ManagementServiceClient
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        serviceClient.updateTypes(
            {
                schema,
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
