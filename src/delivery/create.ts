import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";

export type CreateResponse<T extends {}> = CreateSuccessResponse<T> | CreateValidationResponse;

export interface CreateSuccessResponse<T extends {}> {
    data: T;
}

export interface CreateValidationResponse {
    validationErrors: string[];
    fieldValidationErrors: Record<string, string>;
}

export const isCreateSuccessResponse = <T extends {}>(
    response: CreateResponse<T>
): response is CreateSuccessResponse<T> => {
    return response.hasOwnProperty("data");
};

export const isCreateValidationResponse = <T extends {}>(
    response: CreateResponse<T>
): response is CreateValidationResponse => {
    return !response.hasOwnProperty("data");
};

export const createCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    data: Record<string, any>,
    id: string,
    eventMetadata: EventMetadata,
    serviceClient: ServiceClient
): Promise<CreateResponse<T>> => {
    const requestData: Record<string, string> = {};

    for (const key in data) {
        requestData[key] = JSON.stringify(data[key]);
    }

    return new Promise<CreateResponse<T>>((resolve, reject) => {
        serviceClient.createEntry(
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
