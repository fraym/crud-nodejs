# CRUD schema

You create CRUD schemas by using the graphql schema language.

## CRUD entity Name

The name of the CRUD entity is the name of your type. In the following example the entity will be called `User`:

```graphql
type User @crudType {
 ...
}
```

## Field Types

Supported Types:

-   String
-   ID
-   Boolean
-   Int
-   Float
-   DateTime (unix timestamp, milliseconds)
-   File
-   Arrays
-   Objects / references to other CRUD entities
-   Enums
-   All types listed above in their required form

### Enums

You can define Enums and use them in your schema:

```graphql
enum YourEnum {
    YOUR_VALUE
    OTHER_VALUE
}
```

### Objects

You can use the name of an other entities as field type in order to save a relation to an other entity.
You can also define a nested type:

```graphql
type User @crudType {
    friends: [User!]! # This is an array references to other users
    nested: Profile! # This is a nested object field this field does not reference to an other type, it directly contains the nested data
}

type Profile {
    email: String
}
```

### Object directives

### Mark an object as expiring

The `@expires` directive allows the specification of a condition on which the entry will expire.

When using the `@expires` directive, the condition environment will only have the `projection` field available for this operation.

```graphql
type Something @crudType @expires(condition: "now > projection.expiresAt") {
 expiresAt: DateTime!
 ...
}
```

The `ExpiresAfter` input type can be used on an object as an alternative to a condition.
This will cause the object to expire after a specified duration has elapsed since the entity was last updated.

```graphql
input ExpiresAfter {
    years: Int
    months: Int
    weeks: Int
    days: Int
    hours: Int
    minutes: Int
    seconds: Int
}
```

The code snippet below defines a new entity type with an expiration of five minutes.

```graphql
type Something @crudType @expires(after: {
  minutes: 5
}) {
 ...
}
```

It is possible to both use the `after` and `condition` inputs.
In this case the condition formed form the after input is ANDed onto the `condition` input:
`condition = conditionInput && afterInput`.

### Add permissions to the crud type

Use the `@permission` directive on an object to apply permissions to it. Only users having that required permissions as a scope in their token will see data of it.

```graphql
type User
  @crudType
  @permission(
    read: [PERMISSION_KEY],
    update: [PERMISSION_KEY2],
    create: [PERMISSION_KEY3],
    delete: [PERMISSION_KEY4],
    all: [PERMISSION_KEY5]
) {
  ...
}
```

## Unique constraints

You can mark field compounds as unique by using the `@unique` directive at type level:

```graphql
type User @crudType @unique(fields: ["name", "tenantId"], name: "name per tenantId unique") {
    name: String!
    tenantId: String!
}
```

## Field directives

### Mark a field to validate against a validation rule

Use the `@validate` directive on a field to add validation against a rule tag from the [go-playground/validator](https://github.com/go-playground/validator#baked-in-validations) package.

```graphql
type User @crudType {
    field: String! @validate(tags: ["email"])
}
```

### Mark a field to have a defined default value

Use the `@default` directive on a field to define its default value if the field is empty.

The type can be either a non-null type or a nullable type. On a non-null type the respective zero type is replaced by the default value, whilst on the nullable type the null value is replaced by the default.

```graphql
type User @crudType {
    field: String! @default(value: "John Appleseed")
}
```

### Mark a field as filterable

Use the `@index` directive on a field to enable filtering on it in all list queries and graphql subscriptions.

```graphql
type User @crudType {
    field: String! @index
}
```

### Mark single fields as unique

Use the `@unique` directive on a field to mark it as unique.

```graphql
type User @crudType {
    email: String! @unique
}
```

### Filter field in graphql queries by jwt data

Use the `@filterFromJwtData` directive on a field to filter it automatically by the given value from the jwt claims in all queries and graphql subscriptions.
The value that is used for the filter will be extracted from the jwt claims data object's field that is identified by the given `key` (in this example this would be `data.yourJwtDataKey`).
Note: If the filter value from the jwt contains array data, the filter will check if that field matches one of the elements of that array.

```graphql
type User @crudType {
    field: String! @filterFromJwtData(key: "yourJwtDataKey")
}
```

### Generate the value of a field by jwt data

Use the `@fromJwtData` directive on a field to generate its value automatically by the given value from the jwt claims.
A user will not be able to change (update / delete) entries that do not match the value provided by the jwt.
The used value will be extracted from the jwt claims data object's field that is identified by the given `key` (in this example this would be `data.yourJwtDataKey`).

This field is only available on `String` and `ID` fields.

Note: If the value from the jwt contains array data, the filter will use the first element. If the jwt does not contain the value there is no update / delete restriction and the field will not be filled.

```graphql
type User @crudType {
    field: String! @filterFromJwtData(key: "yourJwtDataKey")
}
```

### Add permissions to a field

Use the `@permission` directive on a field to apply permissions to it. Only users having that required permissions as a scope in their token will see that field.

```graphql
type User @crudType {
    field: String! @permission(read: [PERMISSION_KEY])
}
```
