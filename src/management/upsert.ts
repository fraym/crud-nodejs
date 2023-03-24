import { ManagementClientConfig } from "config/config";

export const upsertCrudTypes = async (
    schema: string,
    config: ManagementClientConfig
): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/management/types`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            schema,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};
