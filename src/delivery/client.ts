import { ClientConfig, useConfigDefaults } from "../config/config";
import { DeliveryServiceClient } from "@fraym/crud-proto";
import { credentials } from "@grpc/grpc-js";
import { createCrudData, CreatedCrudData } from "./create";
import { updateCrudData } from "./update";
import { deleteCrudData } from "./delete";
import { getCrudData } from "./getData";
import { Filter, GetCrudDataList, getCrudDataList } from "./getDataList";

export interface DeliveryClient {
    create: (tenantId: string, type: string, data: Record<string, any>) => Promise<CreatedCrudData>;
    update: (
        tenantId: string,
        type: string,
        id: string,
        data: Record<string, any>
    ) => Promise<void>;
    delete: (tenantId: string, type: string, id: string) => Promise<void>;
    getData: <T extends {}>(
        tenantId: string,
        type: string,
        id: string,
        returnEmptyDataIfNotFound?: boolean
    ) => Promise<T>;
    getDataList: <T extends {}>(
        tenantId: string,
        type: string,
        limit?: number,
        page?: number,
        filter?: Filter
    ) => Promise<GetCrudDataList<T>>;
    close: () => Promise<void>;
}

export const newDeliveryClient = async (config?: ClientConfig): Promise<DeliveryClient> => {
    config = useConfigDefaults(config);
    const serviceClient = new DeliveryServiceClient(
        config.serverAddress,
        credentials.createInsecure(),
        {
            "grpc.keepalive_time_ms": config.keepaliveInterval,
            "grpc.keepalive_timeout_ms": config.keepaliveTimeout,
            "grpc.keepalive_permit_without_calls": 1,
        }
    );

    const create = async (tenantId: string, type: string, data: Record<string, any>) => {
        return await createCrudData(tenantId, type, data, serviceClient);
    };

    const update = async (
        tenantId: string,
        type: string,
        id: string,
        data: Record<string, any>
    ) => {
        return await updateCrudData(tenantId, type, id, data, serviceClient);
    };

    const deleter = async (tenantId: string, type: string, id: string) => {
        return await deleteCrudData(tenantId, type, id, serviceClient);
    };

    const getData = async <T extends {}>(
        tenantId: string,
        type: string,
        id: string,
        returnEmptyDataIfNotFound: boolean = false
    ): Promise<T> => {
        return await getCrudData<T>(tenantId, type, id, returnEmptyDataIfNotFound, serviceClient);
    };

    const getDataList = async <T extends {}>(
        tenantId: string,
        type: string,
        limit: number = 0,
        page: number = 1,
        filter: Filter = { fields: {}, and: [], or: [] }
    ): Promise<GetCrudDataList<T>> => {
        return await getCrudDataList<T>(tenantId, type, limit, page, filter, serviceClient);
    };

    const close = async () => {
        serviceClient.close();
    };

    return {
        create,
        update,
        delete: deleter,
        getData,
        getDataList,
        close,
    };
};
