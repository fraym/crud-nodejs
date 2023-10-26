import { CrudAuthData } from "@fraym/proto/freym/crud/delivery";

export interface AuthData {
    tenantId: string;
    scopes: string[];
    data: Record<string, any>;
}

export const getProtobufAuthData = (auth: AuthData): CrudAuthData => {
    const data: Record<string, string> = {};

    for (let key in auth.data) {
        data[key] = JSON.stringify(auth.data[key]);
    }

    return {
        tenantId: auth.tenantId,
        scopes: auth.scopes,
        data,
    };
};
