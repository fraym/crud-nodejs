#! /usr/bin/env node
import fs from "fs";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { buildSchema, buildASTSchema, printSchema } from "graphql/utilities";
import { Kind } from "graphql/language/kinds";
import { newManagementClient } from "../management/client";

const run = async () => {
    const argv = await yargs(hideBin(process.argv))
        .config({ schemaPath: "./src", serverAddress: "127.0.0.1:9000" })
        .pkgConf("crud")
        .config(
            "config",
            "Path of your `crud.config.ts`, default: `./crud.config.ts`",
            configPath => JSON.parse(fs.readFileSync(configPath, "utf-8"))
        ).argv;

    const schemaPath: string = argv.schemaPath as string;
    const serverAddress: string = argv.serverAddress as string;
    const schemas = getSchemas(schemaPath);
    await migrateSchemas(schemas, serverAddress);
};

run();

const getSchemas = (schemaPath: string): Record<string, string> => {
    const schemaFiles = fs.readdirSync(schemaPath);
    const schemas: Record<string, string> = {};

    schemaFiles.forEach(fileName => {
        const astSchema = buildSchema(fs.readFileSync(schemaPath + "/" + fileName, "utf-8"));

        astSchema.toConfig().types.forEach(t => {
            if (!t.astNode?.kind) {
                return;
            }

            const name = t.toString();

            const typeSchema = buildASTSchema({
                definitions: [t.astNode],
                kind: Kind.DOCUMENT,
            });

            if (schemas[name]) {
                throw new Error(
                    `duplicate schema for CRUD type "${name}" detected, try renaming one of them as they have to be unique`
                );
            }

            schemas[name] = printSchema(typeSchema);
        });
    });

    return schemas;
};

const migrateSchemas = async (schemas: Record<string, string>, serverAddress: string) => {
    const managementClient = await newManagementClient({ serverAddress });
    const existingTypeNames = await managementClient.getAllTypes();

    let createSchema = "";
    let updateSchema = "";
    const typesToCreate: string[] = [];
    const typesToUpdate: string[] = [];
    const typesToRemove: string[] = [];

    existingTypeNames.forEach(existingName => {
        if (!schemas[existingName]) {
            typesToRemove.push(existingName);
        } else {
            typesToUpdate.push(existingName);
            updateSchema += `\n${schemas[existingName]}`;
            delete schemas[existingName];
        }
    });

    Object.keys(schemas).forEach(newName => {
        typesToCreate.push(newName);
        createSchema += `\n${schemas[newName]}`;
    });

    if (typesToRemove.length > 0) {
        console.log(`Removing ${typesToRemove.length} types: ${typesToRemove}...`);
        await managementClient.removeTypes(typesToRemove);
        console.log(`Removed ${typesToRemove.length} types`);
    }

    if (typesToUpdate.length > 0) {
        console.log(`Updating ${typesToUpdate.length} types: ${typesToUpdate}...`);
        await managementClient.updateTypes(updateSchema);
        console.log(`Updated ${typesToUpdate.length} types`);
    }

    if (typesToCreate.length > 0) {
        console.log(`Creating ${typesToCreate.length} types: ${typesToCreate}...`);
        await managementClient.createTypes(createSchema);
        console.log(`Created ${typesToCreate.length} types`);
    }
};
