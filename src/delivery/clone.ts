import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";

export const cloneCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    id: string,
    newId: string,
    eventMetadata: EventMetadata,
    serviceClient: ServiceClient
): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        serviceClient.cloneEntry(
            {
                type,
                auth: getProtobufAuthData(authData),
                id,
                newId,
                eventMetadata,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                const data: any = {};

                for (const key in response.newData) {
                    data[key] = JSON.parse(response.newData[key]);
                }

                resolve(data);
            }
        );
    });
};
