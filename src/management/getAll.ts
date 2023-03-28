import { ManagementClientConfig } from "config/config";

export const getAllCrudTypes = async (config: ManagementClientConfig): Promise<string[]> => {
    const response = await fetch(`${config.serverAddress}/management/types`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const data = await response.json();

    return data.typeNames;
};
