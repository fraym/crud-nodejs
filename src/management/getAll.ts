import { ManagementServiceClient } from "@fraym/crud-proto";

export const getAllCrudTypes = async (
    serviceClient: ManagementServiceClient
): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        console.log(serviceClient.getTypes);

        serviceClient.getTypes({}, (error, response) => {
            console.log("asf", error, response);
            if (error) {
                reject(error.message);
                return;
            }

            resolve(response.typeNames);
        });
    });
};
