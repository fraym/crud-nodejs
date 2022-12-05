import { ManagementServiceClient } from "@fraym/crud-proto";
import { credentials } from "@grpc/grpc-js";
import { ClientConfig, useConfigDefaults } from "../config/config";
import { createCrudTypes } from "./create";
import { getAllCrudTypes } from "./getAll";
import { removeCrudTypes } from "./remove";
import { updateCrudTypes } from "./update";

export interface ManagementClient {
    createTypes: (schema: string) => Promise<void>;
    updateTypes: (schema: string) => Promise<void>;
    removeTypes: (typeNames: string[]) => Promise<void>;
    getAllTypes: () => Promise<string[]>;
    close: () => Promise<void>;
}

export const newManagementClient = async (config?: ClientConfig): Promise<ManagementClient> => {
    config = useConfigDefaults(config);
    const serviceClient = new ManagementServiceClient(
        config.serverAddress,
        credentials.createInsecure(),
        {
            "grpc.keepalive_time_ms": config.keepaliveInterval,
            "grpc.keepalive_timeout_ms": config.keepaliveTimeout,
            "grpc.keepalive_permit_without_calls": 1,
        }
    );

    const createTypes = async (schema: string) => {
        await createCrudTypes(schema, serviceClient);
    };

    const updateTypes = async (schema: string) => {
        await updateCrudTypes(schema, serviceClient);
    };

    const removeTypes = async (typeNames: string[]) => {
        await removeCrudTypes(typeNames, serviceClient);
    };

    const getAllTypes = async (): Promise<string[]> => {
        return await getAllCrudTypes(serviceClient);
    };

    const close = async () => {
        serviceClient.close();
    };

    return {
        createTypes,
        updateTypes,
        removeTypes,
        getAllTypes,
        close,
    };
};
