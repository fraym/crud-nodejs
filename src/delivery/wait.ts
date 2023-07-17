import { EntryWait } from "@fraym/crud-proto";
import { Filter, getProtobufEntryFilter } from "./filter";

export interface Wait {
    timeout?: number;
    conditionFilter: Filter;
}

export const getProtobufEntryWait = (wait?: Wait): EntryWait | undefined => {
    if (!wait) {
        return undefined;
    }

    return {
        conditionFilter: getProtobufEntryFilter(wait.conditionFilter),
        timeout: wait.timeout ?? 0,
    };
};
