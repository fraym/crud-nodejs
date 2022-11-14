import { ManagementServiceClient } from "@fraym/crud-proto";

export const getAllCrudTypes = async (
    serviceClient: ManagementServiceClient
): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        serviceClient.getTypes({}, (error, response) => {
            if (error) {
                reject(error.message);
                return;
            }

            resolve(response.typeNames);
        });
    });
};
