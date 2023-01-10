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
You can specify the address (and port) of the crud service instance you use in the `CRUD_SERVER_ADDRESS` env variable (default: `127.0.0.1:9000`).

You need to add a file that contains all built-in directives to your type schemas. The latest version of this file can be found [here](default.graphql).

### Config

Use a `.env` file or env variables to configure cte clients and the command:

```env
CRUD_SERVER_ADDRESS=127.0.0.1:9000
CRUD_SCHEMA_GLOB=./src/crud/*.graphql
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

### Create data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

```typescript
const { id } = await client.create("tenantId", "YourCrudType", {
    // values here
});
```

### Update data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).
The `id` has to match the id of the data that you want to update.

```typescript
await client.update("tenantId", "YourCrudType", "id", {
    // values here
});
```

### Delete data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).
The `id` has to match the id of the data that you want to delete.

```typescript
await client.delete("tenantId", "YourCrudType", "id");
```

### Get a single data element

The name of `YourCrudType` has to equal your type name in your schema (also in casing).
The `id` has to match the id of the data that you want to get.

```typescript
const data = await client.getData("tenantId", "YourCrudType", "id");
```

You can specify a fourth parameter if you want to return a empty dataset instead of getting an error when querying a non existing element:

```typescript
const data = await client.getData("tenantId", "YourCrudType", "id", true);
```

### Get (paginated / filtered) data

The name of `YourCrudType` has to equal your type name in your schema (also in casing).

No pagination:

```typescript
const data = await client.getDataList("tenantId", "YourCrudType");
```

With pagination:

```typescript
const limit = 50; // elements to query per page
const page = 1; // number of the page you want to select, first page starts at: 1
const data = await client.getDataList("tenantId", "YourCrudType", limit, page);
```

With filter:

```typescript
const data = await client.getDataList("tenantId", "YourCrudType", undefined, undefined, {
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

### Gracefully close the clients

You won't lose any data if you don't. Use it for your peace of mind.

```typescript
client.close();
```

## Development

You'll need the following apps for a smooth development experience:

-   minikube
-   lens
-   okteto
-   helm

### Running the dev environment

-   Start minikube if not already done:

```shell
minikube start
```

-   add mongodb and minio to your lokal kubernetes
    -   use Makefiles in `./.dev/*`
-   copy `.env.build` to `.env.build.local`
    -   add your personal access token (needs read access for private fraym org repositories)
-   deploy the app to your cluster

```
make init
```

-   start okteto

```
make dev
```

-   connect your IDE to that okteto instance
