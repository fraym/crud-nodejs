import { DeliveryServiceClient } from "@fraym/crud-proto";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";

export type UpdateResponse<T extends {}> = UpdateSuccessResponse<T> | UpdateValidationResponse;

export interface UpdateSuccessResponse<T extends {}> {
    data: T;
}

export interface UpdateValidationResponse {
    validationErrors: string[];
    fieldValidationErrors: Record<string, string>;
}

export const isUpdateSuccessResponse = <T extends {}>(
    response: UpdateResponse<T>
): response is UpdateSuccessResponse<T> => {
    return response.hasOwnProperty("data");
};

export const isUpdateValidationResponse = <T extends {}>(
    response: UpdateResponse<T>
): response is UpdateValidationResponse => {
    return !response.hasOwnProperty("data");
};

export const updateCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    id: string,
    data: Record<string, any>,
    eventMetadata: EventMetadata,
    serviceClient: DeliveryServiceClient
): Promise<UpdateResponse<T>> => {
    const requestData: Record<string, string> = {};

    for (const key in data) {
        requestData[key] = JSON.stringify(data[key]);
    }

    return new Promise<UpdateResponse<T>>((resolve, reject) => {
        serviceClient.updateEntry(
            {
                type,
                auth: getProtobufAuthData(authData),
                data: requestData,
                id,
                eventMetadata,
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                if (
                    response.validationErrors.length > 0 ||
                    Object.keys(response.fieldValidationErrors).length > 0
                ) {
                    resolve({
                        validationErrors: response.validationErrors,
                        fieldValidationErrors: response.fieldValidationErrors,
                    });
                    return;
                }

                const data: any = {};

                for (const key in response.newData) {
                    data[key] = JSON.parse(response.newData[key]);
                }

                resolve({
                    data,
                });
            }
        );
    });
};
