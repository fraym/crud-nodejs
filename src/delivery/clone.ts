import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";

export type CloneResponse<T extends {}> = CloneSuccessResponse<T> | CloneValidationResponse;

export interface CloneSuccessResponse<T extends {}> {
    data: T;
}

export interface CloneValidationResponse {
    validationErrors: string[];
    fieldValidationErrors: Record<string, string>;
}

export const isCloneSuccessResponse = <T extends {}>(
    response: CloneResponse<T>
): response is CloneSuccessResponse<T> => {
    return response.hasOwnProperty("data");
};

export const isCloneValidationResponse = <T extends {}>(
    response: CloneResponse<T>
): response is CloneValidationResponse => {
    return !response.hasOwnProperty("data");
};

export const cloneCrudData = async <T extends {}>(
    type: string,
    authData: AuthData,
    id: string,
    newId: string,
    eventMetadata: EventMetadata,
    serviceClient: ServiceClient
): Promise<CloneResponse<T>> => {
    return new Promise<CloneResponse<T>>((resolve, reject) => {
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

                resolve({ data });
            }
        );
    });
};
