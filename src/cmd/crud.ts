#! /usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { newManagementClient } from "../management/client";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import {} from "@graphql-tools/schema";
import {
    ConstDirectiveNode,
    ConstValueNode,
    FieldDefinitionNode,
    GraphQLEnumType,
    GraphQLObjectType,
    GraphQLSchema,
    Kind,
    TypeNode,
} from "graphql";
import { config } from "dotenv";

interface TypeDefinition {
    isCrudType: boolean;
    schema: string;
    nestedTypes: string[];
}

const run = async () => {
    config();

    const argv = await yargs(hideBin(process.argv))
        .config({
            schemaGlob: "./src/**/*.graphql",
            serverAddress: "127.0.0.1:9000",
            namespace: "",
        })
        .pkgConf("crud").argv;

    let schemaGlob: string = argv.schemaGlob as string;
    let serverAddress: string = argv.serverAddress as string;
    let namespace: string = argv.namespace as string;

    if (process.env.CRUD_SCHEMA_GLOB) {
        schemaGlob = process.env.CRUD_SCHEMA_GLOB;
    }

    if (process.env.CRUD_SERVER_ADDRESS) {
        serverAddress = process.env.CRUD_SERVER_ADDRESS;
    }

    if (process.env.CRUD_NAMESPACE) {
        namespace = process.env.CRUD_NAMESPACE;
    }

    if (namespace === "Fraym") {
        throw new Error("Cannot use Fraym as namespace as it is reserved for fraym apps");
    }

    const schema = await loadSchema(`${schemaGlob}`, {
        loaders: [new GraphQLFileLoader()],
    });

    const definitions = getTypeDefinition(schema, namespace);

    await migrateSchemas(definitions, serverAddress, namespace);
};

run();

const getTypeDefinition = (
    schema: GraphQLSchema,
    namespace: string
): Record<string, TypeDefinition> => {
    const definitions: Record<string, TypeDefinition> = {};

    schema.toConfig().types.forEach(t => {
        if (!(t instanceof GraphQLObjectType) && !(t instanceof GraphQLEnumType)) {
            return;
        }

        const name = `${namespace}${t.toString()}`;
        ensureValidName(name);

        if (definitions[name]) {
            throw new Error(
                `duplicate definition for type "${name}" detected, try renaming one of them as they have to be uniquely named`
            );
        }

        if (t instanceof GraphQLObjectType) {
            definitions[name] = getTypeDefinitionFromGraphQLObjectType(t, namespace);
            return;
        }

        if (t instanceof GraphQLEnumType) {
            definitions[name] = getTypeDefinitionFromGraphQLEnumType(t, namespace);
            return;
        }
    });

    return definitions;
};

const getTypeDefinitionFromGraphQLEnumType = (
    t: GraphQLEnumType,
    namespace: string
): TypeDefinition => {
    const name = `${namespace}${t.toString()}`;
    ensureValidName(name);

    let enumValuesString = "";

    t.astNode?.values?.forEach(value => {
        enumValuesString += `\n\t${value.name.value}`;
    });

    const schema = `enum ${name} {${enumValuesString}\n}`;

    return {
        isCrudType: false,
        nestedTypes: [],
        schema,
    };
};

const getTypeDefinitionFromGraphQLObjectType = (
    t: GraphQLObjectType,
    namespace: string
): TypeDefinition => {
    const isCrudType =
        (t.astNode?.directives &&
            t.astNode?.directives.length > 0 &&
            t.astNode.directives[0].name.value === "crudType") ??
        false;

    const name = `${namespace}${t.toString()}`;
    let objectDirectivesString = "";
    let objectFieldsString = "";
    let nestedTypes: string[] = [];

    t.astNode?.directives?.forEach(d => {
        objectDirectivesString += getDirectiveString(d);
    });

    t.astNode?.fields?.forEach(f => {
        const { str, nestedTypes: newNestedTypes } = getFieldStringAndNestedTypes(f, namespace);
        objectFieldsString += str;

        newNestedTypes.forEach(nested => {
            if (nestedTypes.indexOf(nested) === -1) {
                nestedTypes.push(nested);
            }
        });
    });

    const schema = `type ${name}${objectDirectivesString} {${objectFieldsString}\n}`;

    return {
        isCrudType,
        nestedTypes,
        schema,
    };
};

interface FieldData {
    str: string;
    nestedTypes: string[];
}

const getFieldStringAndNestedTypes = (f: FieldDefinitionNode, namespace: string): FieldData => {
    let directivesString = "";

    f.directives?.forEach(d => {
        directivesString += getDirectiveString(d);
    });

    const { nestedType, str: typeString } = getTypeData(f.type, namespace);

    const nestedTypes: string[] = [];

    if (nestedType) {
        nestedTypes.push(nestedType);
    }

    return {
        str: `\n\t${f.name.value}: ${typeString}${directivesString}`,
        nestedTypes,
    };
};

interface TypeData {
    str: string;
    nestedType?: string;
}

const getTypeData = (t: TypeNode, namespace: string): TypeData => {
    switch (t.kind) {
        case Kind.NAMED_TYPE:
            const name = t.name.value;
            ensureValidName(`${namespace}${name}`);

            return name === "String" ||
                name === "Float" ||
                name === "ID" ||
                name === "Boolean" ||
                name === "Int" ||
                name === "DateTime"
                ? {
                      str: name,
                  }
                : {
                      str: `${namespace}${name}`,
                      nestedType: `${namespace}${name}`,
                  };
        case Kind.LIST_TYPE:
            const { nestedType: listNestedType, str: listStr } = getTypeData(t.type, namespace);

            return {
                str: `[${listStr}]`,
                nestedType: listNestedType,
            };
        case Kind.NON_NULL_TYPE:
            const { nestedType: nonNullNestedType, str: nonNullStr } = getTypeData(
                t.type,
                namespace
            );

            return {
                str: `${nonNullStr}!`,
                nestedType: nonNullNestedType,
            };
    }
};

const getDirectiveString = (d: ConstDirectiveNode): string => {
    if (!d.arguments || d.arguments.length == 0) {
        return ` @${d.name.value}`;
    }

    let argsString = "";

    d.arguments.forEach(a => {
        if (argsString !== "") {
            argsString += ", ";
        }

        argsString += `${a.name.value}: ${getValueString(a.value)}`;
    });

    return ` @${d.name.value}(${argsString})`;
};

const getValueString = (v: ConstValueNode): string => {
    switch (v.kind) {
        case Kind.LIST:
            let valuesString = "";

            v.values.forEach(el => {
                if (valuesString !== "") {
                    valuesString += ", ";
                }

                valuesString += getValueString(el);
            });

            return `[${valuesString}]`;
        case Kind.STRING:
            return `"${v.value}"`;
        case Kind.FLOAT:
        case Kind.INT:
        case Kind.BOOLEAN:
            return `${v.value}`;
        case Kind.NULL:
            return `null`;
        case Kind.OBJECT:
            let objectString = "";

            v.fields.forEach(f => {
                if (objectString !== "") {
                    objectString += ", ";
                }

                objectString += `${f.name.value}: ${getValueString(f.value)}`;
            });

            return `{${objectString}}`;
        default:
            throw new Error(`values of kind ${v.kind} are currently not supported`);
    }
};

const migrateSchemas = async (
    definitions: Record<string, TypeDefinition>,
    serverAddress: string,
    namespace: string
) => {
    const managementClient = await newManagementClient({ serverAddress });
    const existingTypeNames = (await managementClient.getAllTypes()).filter(name =>
        name.startsWith(namespace)
    );

    let createSchema = "";
    let updateSchema = "";
    const typesToCreate: string[] = [];
    const nestedTypesToCreate: string[] = [];
    const typesToUpdate: string[] = [];
    const nestedTypesToUpdate: string[] = [];
    const typesToRemove: string[] = [];

    existingTypeNames.forEach(existingName => {
        if (!definitions[existingName] || !definitions[existingName].isCrudType) {
            typesToRemove.push(existingName);
        } else {
            typesToUpdate.push(existingName);
            updateSchema += `\n${definitions[existingName].schema}`;

            definitions[existingName].nestedTypes.forEach(nestedTypeName => {
                if (
                    nestedTypesToUpdate.indexOf(nestedTypeName) !== -1 ||
                    (definitions[nestedTypeName] && definitions[nestedTypeName].isCrudType)
                ) {
                    return;
                }

                updateSchema += `\n${definitions[nestedTypeName].schema}`;

                nestedTypesToUpdate.push(nestedTypeName);
            });
        }
    });

    Object.keys(definitions).forEach(newName => {
        if (!definitions[newName].isCrudType || existingTypeNames.includes(newName)) {
            return;
        }

        typesToCreate.push(newName);
        createSchema += `\n${definitions[newName].schema}`;

        definitions[newName].nestedTypes.forEach(nestedTypeName => {
            if (
                nestedTypesToCreate.indexOf(nestedTypeName) !== -1 ||
                (definitions[nestedTypeName] && definitions[nestedTypeName].isCrudType)
            ) {
                return;
            }

            createSchema += `\n${definitions[nestedTypeName].schema}`;

            nestedTypesToCreate.push(nestedTypeName);
        });
    });

    if (typesToCreate.length > 0) {
        console.log(`Creating ${typesToCreate.length} types: ${typesToCreate}...`);
        await managementClient.createTypes(createSchema).catch(console.log);
        console.log(`Created ${typesToCreate.length} types`);
    }

    if (typesToUpdate.length > 0) {
        console.log(`Updating ${typesToUpdate.length} types: ${typesToUpdate}...`);
        await managementClient.updateTypes(updateSchema).catch(console.log);
        console.log(`Updated ${typesToUpdate.length} types`);
    }

    if (typesToRemove.length > 0) {
        console.log(`Removing ${typesToRemove.length} types: ${typesToRemove}...`);
        await managementClient.removeTypes(typesToRemove).catch(console.log);
        console.log(`Removed ${typesToRemove.length} types`);
    }
};

const ensureValidName = (name: string): void | never => {
    if (name.startsWith("Fraym")) {
        throw new Error("Cannot use Fraym as type name prefix as it is reserved for fraym apps");
    }
};
