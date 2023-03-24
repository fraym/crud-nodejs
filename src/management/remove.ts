import { ManagementClientConfig } from "config/config";

export const removeCrudTypes = async (
    typeNames: string[],
    config: ManagementClientConfig
): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/management/types`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            typeNames,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};
