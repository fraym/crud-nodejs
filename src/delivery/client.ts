import { DeliveryClientConfig, useDeliveryConfigDefaults } from "../config/config";
import { ServiceClient } from "@fraym/proto/freym/crud/delivery";
import { credentials } from "@grpc/grpc-js";
import { createCrudData, CreateResponse } from "./create";
import { updateCrudData, UpdateResponse } from "./update";
import { deleteCrudData } from "./delete";
import { getCrudData } from "./getData";
import { GetCrudDataList, getCrudDataList } from "./getDataList";
import { Filter } from "./filter";
import { Order } from "./order";
import { AuthData } from "./auth";
import { EventMetadata } from "./eventMetadata";
import { Wait } from "./wait";
import { cloneCrudData } from "delivery/clone";

export interface DeliveryClient {
    getData: <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        filter?: Filter,
        returnEmptyDataIfNotFound?: boolean,
        wait?: Wait
    ) => Promise<T | null>;
    getDataList: <T extends {}>(
        type: string,
        authData: AuthData,
        limit?: number,
        page?: number,
        filter?: Filter,
        order?: Order[]
    ) => Promise<GetCrudDataList<T>>;
    create: <T extends {}>(
        type: string,
        authData: AuthData,
        data: Record<string, any>,
        id?: string,
        eventMetadata?: EventMetadata
    ) => Promise<CreateResponse<T>>;
    update: <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        data: Record<string, any>,
        eventMetadata?: EventMetadata
    ) => Promise<UpdateResponse<T>>;
    clone: <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        newId: string,
        eventMetadata?: EventMetadata
    ) => Promise<UpdateResponse<T>>;
    deleteDataById: (
        type: string,
        authData: AuthData,
        id: string,
        eventMetadata?: EventMetadata
    ) => Promise<number>;
    deleteDataByFilter: (
        type: string,
        authData: AuthData,
        filter?: Filter,
        eventMetadata?: EventMetadata
    ) => Promise<number>;
    close: () => Promise<void>;
}

export const newDeliveryClient = async (config?: DeliveryClientConfig): Promise<DeliveryClient> => {
    config = useDeliveryConfigDefaults(config);
    const serviceClient = new ServiceClient(config.serverAddress, credentials.createInsecure(), {
        "grpc.keepalive_time_ms": config.keepaliveInterval,
        "grpc.keepalive_timeout_ms": config.keepaliveTimeout,
        "grpc.keepalive_permit_without_calls": 1,
    });

    const getData = async <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        filter: Filter = { fields: {}, and: [], or: [] },
        returnEmptyDataIfNotFound: boolean = false,
        wait?: Wait
    ): Promise<T | null> => {
        return await getCrudData<T>(
            type,
            authData,
            id,
            filter,
            returnEmptyDataIfNotFound,
            serviceClient,
            wait
        );
    };

    const getDataList = async <T extends {}>(
        type: string,
        authData: AuthData,
        limit: number = 0,
        page: number = 1,
        filter: Filter = { fields: {}, and: [], or: [] },
        order: Order[] = []
    ): Promise<GetCrudDataList<T>> => {
        return await getCrudDataList<T>(type, authData, limit, page, filter, order, serviceClient);
    };

    const create = async <T extends {}>(
        type: string,
        authData: AuthData,
        data: Record<string, any>,
        id: string = "",
        eventMetadata: EventMetadata = { causationId: "", correlationId: "" }
    ) => {
        return await createCrudData<T>(type, authData, data, id, eventMetadata, serviceClient);
    };

    const update = async <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        data: Record<string, any>,
        eventMetadata: EventMetadata = { causationId: "", correlationId: "" }
    ) => {
        return await updateCrudData<T>(type, authData, id, data, eventMetadata, serviceClient);
    };

    const clone = async <T extends {}>(
        type: string,
        authData: AuthData,
        id: string,
        newId: string,
        eventMetadata: EventMetadata = { causationId: "", correlationId: "" }
    ) => {
        return await cloneCrudData<T>(type, authData, id, newId, eventMetadata, serviceClient);
    };

    const deleteDataById = async (
        type: string,
        authData: AuthData,
        id: string,
        eventMetadata: EventMetadata = { causationId: "", correlationId: "" }
    ) => {
        return await deleteCrudData(
            type,
            authData,
            id,
            { fields: {}, and: [], or: [] },
            eventMetadata,
            serviceClient
        );
    };

    const deleteDataByFilter = async (
        type: string,
        authData: AuthData,
        filter: Filter = { fields: {}, and: [], or: [] },
        eventMetadata: EventMetadata = { causationId: "", correlationId: "" }
    ) => {
        return await deleteCrudData(type, authData, "", filter, eventMetadata, serviceClient);
    };

    const close = async () => {
        serviceClient.close();
    };

    return {
        getData,
        getDataList,
        create,
        update,
        clone,
        deleteDataById,
        deleteDataByFilter,
        close,
    };
};
