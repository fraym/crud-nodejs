# crud-nodejs

Client implementation in javascript for the CRUD service [streams](https://github.com/fraym/crud).

## Installation

```shell
npm i @fraym/crud
```

## Usage

### Create the clients

delivery client:

```typescript
const deliveryClient = await newDeliveryClient({
    serverAddress: "127.0.0.1:9000",
    groupId: "your-services-group-identifier",
});
```

management client:

```typescript
const managementClient = await newManagementClient({
    serverAddress: "127.0.0.1:9000",
    groupId: "your-services-group-identifier",
});
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
The `id` has to match the id of the data that you want to delete.

```typescript
const data = await client.getData("tenantId", "YourCrudType", "id");
```

### Get (paginated) data

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
