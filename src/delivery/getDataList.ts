import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { AuthData, getProtobufAuthData } from "./auth";
import { Filter, getProtobufDataFilter } from "./filter";
import { Order, getProtobufDataOrder } from "./order";

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
    serviceClient: ServiceClient
): Promise<GetCrudDataList<T>> => {
    return new Promise<GetCrudDataList<T>>((resolve, reject) => {
        serviceClient.getEntryList(
            {
                type,
                auth: getProtobufAuthData(authData),
                limit,
                page,
                filter: getProtobufDataFilter(filter),
                order: getProtobufDataOrder(order),
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
