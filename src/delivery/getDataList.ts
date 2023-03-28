import { DeliveryServiceClient } from "@fraym/crud-proto";
import { AuthData, getProtobufAuthData } from "./auth";
import { Filter, getProtobufEntryFilter } from "./filter";
import { getProtobufEntryOrder, Order } from "./order";

export interface GetCrudDataList<T extends {}> {
    limit: number;
    page: number;
    total: number;
    data: T[];
}

export const getCrudDataList = async <T extends {}>(
    type: string,
    authData: AuthData,
    limit: number,
    page: number,
    filter: Filter,
    order: Order[],
    serviceClient: DeliveryServiceClient
): Promise<GetCrudDataList<T>> => {
    return new Promise<GetCrudDataList<T>>((resolve, reject) => {
        serviceClient.getEntryList(
            {
                type,
                auth: getProtobufAuthData(authData),
                limit,
                page,
                filter: getProtobufEntryFilter(filter),
                order: getProtobufEntryOrder(order),
            },
            (error, response) => {
                if (error) {
                    reject(error.message);
                    return;
                }

                const data: any[] = [];

                for (const result of response.result) {
                    const dataRecord: Record<string, any> = {};
                    const resultData = result.data;

                    for (const key in resultData) {
                        dataRecord[key] = JSON.parse(resultData[key]);
                    }

                    data.push(dataRecord);
                }

                resolve({
                    limit: response.limit,
                    page: response.page,
                    total: response.total,
                    data,
                });
            }
        );
    });
};
