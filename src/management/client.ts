import { ManagementClientConfig, useManagementConfigDefaults } from "../config/config";
import { getAllCrudTypes } from "./getAll";
import { removeCrudTypes } from "./remove";
import { upsertCrudTypes } from "./upsert";

export interface ManagementClient {
    upsertTypes: (schema: string) => Promise<void>;
    removeTypes: (typeNames: string[]) => Promise<void>;
    getAllTypes: () => Promise<string[]>;
}

export const newManagementClient = async (
    config?: ManagementClientConfig
): Promise<ManagementClient> => {
    const currentConfig = useManagementConfigDefaults(config);

    const upsertTypes = async (schema: string) => {
        await upsertCrudTypes(schema, currentConfig);
    };

    const removeTypes = async (typeNames: string[]) => {
        await removeCrudTypes(typeNames, currentConfig);
    };

    const getAllTypes = async (): Promise<string[]> => {
        return await getAllCrudTypes(currentConfig);
    };

    return {
        upsertTypes,
        removeTypes,
        getAllTypes,
    };
};
