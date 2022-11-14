import { ClientConfig, useConfigDefaults } from "../config/config";
import { DeliveryServiceClient } from "@fraym/crud-proto";
import { credentials } from "@grpc/grpc-js";
import { createCrudData, CreatedCrudData } from "./create";
import { updateCrudData } from "./update";
import { deleteCrudData } from "./delete";
import { GetCrudData, getCrudData } from "./getData";
import { GetCrudDataList, getCrudDataList } from "./getDataList";

export interface DeliveryClient {
    create: (tenantId: string, type: string, data: Record<string, any>) => Promise<CreatedCrudData>;
    update: (
        tenantId: string,
        type: string,
        id: string,
        data: Record<string, any>
    ) => Promise<void>;
    delete: (tenantId: string, type: string, id: string) => Promise<void>;
    getData: (tenantId: string, type: string, id: string) => Promise<GetCrudData | null>;
    getDataList: (
        tenantId: string,
        type: string,
        limit?: number,
        page?: number
    ) => Promise<GetCrudDataList | null>;
    close: () => Promise<void>;
}

export const newDeliveryClient = async (config: ClientConfig): Promise<DeliveryClient> => {
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

    const getData = async (
        tenantId: string,
        type: string,
        id: string
    ): Promise<GetCrudData | null> => {
        return await getCrudData(tenantId, type, id, serviceClient);
    };

    const getDataList = async (
        tenantId: string,
        type: string,
        limit: number = 0,
        page: number = 1
    ): Promise<GetCrudDataList | null> => {
        return await getCrudDataList(tenantId, type, limit, page, serviceClient);
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
