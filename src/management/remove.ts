import { ManagementServiceClient } from "@fraym/crud-proto";

export const removeCrudTypes = async (
    typeNames: string[],
    serviceClient: ManagementServiceClient
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        serviceClient.removeTypes(
            {
                typeNames,
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
