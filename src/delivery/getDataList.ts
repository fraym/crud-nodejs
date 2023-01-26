import { EntryFilter, DeliveryServiceClient } from "@fraym/crud-proto";

export interface GetCrudDataList<T extends {}> {
    limit: number;
    page: number;
    data: T[];
}

export interface Filter {
    fields: Record<string, FieldFilter>;
    and?: Filter[];
    or?: Filter[];
}

export interface FieldFilter {
    type: string;
    operation: string;
    value: any;
}

const getProtobufEntryFilter = (filter: Filter): EntryFilter => {
    const fields: Record<string, FieldFilter> = {};

    for (const fieldName in filter.fields) {
        const field = filter.fields[fieldName];
        let value: string = "";

        if (field.type === "String" && typeof field.value == "string") {
            value = field.value;
        } else {
            value = JSON.stringify(field.value);
        }

        fields[fieldName] = {
            operation: field.operation,
            type: field.type,
            value,
        };
    }

    return {
        fields: fields,
        and: filter.and ? filter.and.map(and => getProtobufEntryFilter(and)) : [],
        or: filter.or ? filter.or.map(or => getProtobufEntryFilter(or)) : [],
    };
};

export const getCrudDataList = async <T extends {}>(
    tenantId: string,
    type: string,
    limit: number,
    page: number,
    filter: Filter,
    serviceClient: DeliveryServiceClient
): Promise<GetCrudDataList<T>> => {
    return new Promise<GetCrudDataList<T>>((resolve, reject) => {
        serviceClient.getEntries(
            {
                tenantId,
                type,
                id: "",
                limit,
                page,
                returnEmptyDataIfNotFound: false,
                filter: getProtobufEntryFilter(filter),
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
                    data,
                });
            }
        );
    });
};
