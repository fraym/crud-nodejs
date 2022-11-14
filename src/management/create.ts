import { ManagementServiceClient } from "@fraym/crud-proto";

export const createCrudTypes = async (
    schema: string,
    serviceClient: ManagementServiceClient
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        serviceClient.createTypes(
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
