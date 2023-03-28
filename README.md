# crud-nodejs

Client implementation in javascript for the [CRUD service](https://github.com/fraym/crud).

## Installation

```shell
npm i @fraym/crud
```

## GraphQL

You can access the graphQL api at `http://crud:3000/delivery/graphql`.
There is a sandbox available at `http://crud:3000/delivery/graphql/sandbox`.

You need to add the `Tenant-Id` header in order to use the graphQL Endpoint and the sandbox.

## CLI command

Use the `crud` cli command to automatically apply your crud schemas to the crud service.

Your type schemas have to match the glob you specify in the `CRUD_SCHEMA_GLOB` env variable (default: `./src/**/*.graphql`).

Delivery API: You can specify the address (and port) of the crud service instance you use in the `CRUD_SERVER_ADDRESS` env variable (default: `127.0.0.1:9000`).

Management API: You can specify the address (and port) of the crud service instance you use in the `CRUD_MANAGEMENT_SERVER_ADDRESS` env variable (default: `http://127.0.0.1`). You will also need to set the `CRUD_MANAGEMENT_API_TOKEN` variable. The value of that token has to match the token configured in the crud service.

You might have a seperate permissions directory or file. As soon as your permissions schema enum is not part of the projections glob you can specify a `PERMISSIONS_SCHEMA_GLOB` env variable. It is empty by default but as soon as you provide it it will add the files in that glob to your projections schema, too.

Use the `CRUD_NAMESPACE` env variable to restrict all migrations to your namespace. This is useful if multiple apps share the crud service. Note: You cannot name your crud type or namespace by a `Fraym` prefix. This is a reserved prefix for fraym apps.

You need to add a file that contains all built-in directives to your type schemas. The latest version of this file can be found [here](default.graphql).

### Config

Use a `.env` file or env variables to configure cte clients and the command:

```env
CRUD_SERVER_ADDRESS=127.0.0.1:9000
CRUD_MANAGEMENT_SERVER_ADDRESS=http://127.0.0.1
CRUD_MANAGEMENT_API_TOKEN=
CRUD_SCHEMA_GLOB=./src/crud/*.graphql
PERMISSIONS_SCHEMA_GLOB=
CRUD_NAMESPACE=
```

## Usage

### Create the clients

delivery client:

```typescript
const deliveryClient = await newDeliveryClient();
```

management client:

```typescript
const managementClient = await newManagementClient();
```

### Create one or multipe CRUD types

Crud types are defined by schemas. A schema can contain more than one type definition. See [SCHEMA.md](SCHEMA.md) for a reference.

```typescript
await managementClient.createTypes("your schema here");
```

### Update one or multipe CRUD types

Crud types are defined by schemas. A schema can contain more than one type definition. See [SCHEMA.md](SCHEMA.md) for a reference.

```typescript
await managementClient.updateTypes("your schema here");
```

### Remove one or multipe CRUD types

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

```typescript
await managementClient.removeTypes(["YourCrudType"]);
```

### Get list of existing CRUD types

```typescript
const list = await managementClient.getAllTypes();
```

### Authorization

All delivery client functions make use of the `AuthData` object.
This data is used to check access for the desired action.

You can add the `FRAYM_AUTH_OWNER` scope in case you are performing an action that is no subject to restrictions.

Fields:

-   `tenantId`: Id of the tenant to use
-   `scopes`: Slice of scopes to use for the action
-   `data`: Data that is used in directives like `@filterFromJwtData`

### Event Metadata

You can specify the correlation and causation IDs for the upsert and delete functions. The `eventMetadata` parameter is optional for all these functions and has the following structure:

```typescript
const eventMetadata = {
    correlationId: "some-correlation-id",
    causationId: "some-causation-id",
};
```

### Create data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

```typescript
const response = await client.create<any>("YourCrudType", authData, {
    // values here
});
```

The response contains the following fields:

In case of no validation errors:

-   `data`: The new data after your create action

In case of validation errors:

-   `validationErrors`: List of global validation errors that are not related to a single field
-   `fieldValidationErrors`: Validation errors mapped by the name of the field that they relate to

### Update data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

```typescript
const response = await client.update<any>("YourCrudType", authData, {
    // values here
});
```

The response contains the following fields:

In case of no validation errors:

-   `data`: The new data after your create action

In case of validation errors:

-   `validationErrors`: List of global validation errors that are not related to a single field
-   `fieldValidationErrors`: Validation errors mapped by the name of the field that they relate to

### Delete data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

Delete data matching a specific ID:

```typescript
const numberOfDeletedEntries = await client.deleteDataById("YourCrudType", authData, "id");
```

Delete data matching a filter (see filter parameter for `getDataList` for details):

```typescript
const numberOfDeletedEntries = await client.deleteDataByFilter("YourCrudType", authData, {
    fields: {
        fieldName: {
            operation: "equals",
            type: "Int",
            value: 123,
        },
    },
});
```

### Get a single data element

A filter could look like this:

```go
const filter := {
	fields: {
        fieldName: {
            operation: "equals",
            type: "Int",
            value: 123,
        },
    },
}
```

The name of `YourCrudType` has to equal your type name in your schema (also in casing).
The `id` has to match the id of the data that you want to get.

```typescript
const data = await client.getData(
    "YourCrudType",
    authData,
    "id",
    filter,
    returnEmptyDataIfNotFound
);
```

### Get (paginated / filtered / ordered) data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

No pagination:

```typescript
const dataList = await client.getDataList("YourCrudType", authData);
```

The dataList response contains the following fields:

-   `limit`: The pagination limit
-   `page`: The pagination page
-   `total`: The total amount of elements matching the given filter
-   `data`: The selected data

With pagination:

```typescript
const limit = 50; // elements to query per page
const page = 1; // number of the page you want to select, first page starts at: 1
const dataList = await client.getDataList("YourCrudType", authData, limit, page);
```

With filter:

```typescript
const dataList = await client.getDataList("YourCrudType", authData, undefined, undefined, {
    fields: {
        fieldName: {
            operation: "equals",
            type: "Int",
            value: 123,
        },
    },
});
```

All `Filter`s are evaluated by:

-   checking that all field filters match
-   checking that all `and` filters match
-   checking that one of the `or` filters match

Avaliable types:

-   `String`
-   `ID`
-   `DateTime`
-   `Int`
-   `Float`
-   `Boolean`

Avaliable operators for all types:

-   `equals`
-   `notEquals`

Avaliable options for the filter type `DateTime`:

-   `inArray`
-   `notInArray`
-   `after`
-   `before`

Avaliable options for the filter type `String` and `ID`:

-   `inArray`
-   `notInArray`

Avaliable options for the filter type `Int` and `Float`:

-   `lessThan`
-   `greaterThan`
-   `lessThanOrEqual`
-   `greaterThanOrEqual`

With order:

All order definitions are prioritized in the order that they are defined (the first definition is prioritized over the second).

```typescript
const dataList = await client.getDataList(
    "YourCrudType",
    authData,
    undefined,
    undefined,
    undefined,
    [
        {
            field: "fieldName",
            descending: true, // omit this value for asc order
        },
    ]
);
```

### Gracefully close the client

You won't lose any data if you don't. Use it for your peace of mind.

```typescript
client.close();
```
