# CRUD schema

You create projection schemas by using the graphql schema language.

## Type Name

The name of the CRUD type is the name of your type. In the following example the type will be called `User`:

```graphql
type User @crudType {
	...
}
```

The `@crudType` directive is used to tell your CRUD managed types apart from nested types.

## Fields

-   You can use the following types for field values: `String`, `ID`, `Int`, `Float`, `Bool`, `DateTime`, `File`
-   You can use enums
-   You can use other objects as type of a field, too
    -   circular references or self references are allowed
-   You can use arrays of all those types

Example:

```graphql
type User @crudType {
    name: String
    age: Int
    friends: [User]!
    pet: Pet
}

type Pet {
    name: String!
}
```

In this example `User` is a CRUD managed type and `Pet` is a nested type.

Crud will automatically provide the following fields in addition to your defined fields: `createdAt`, `changedAt` and the `id` of your data.

## Directives

### Mark a field to validate against a validation rule

Use the `@validate` directive on a field to add validation against a rule tag from the [go-playground/validator](https://github.com/go-playground/validator#baked-in-validations) package.

```graphql
type User @crudType {
    email: String! @validate(tags: ["email"])
}
```

### Mark a field to have a defined default value

Use the `@default` directive on a field to define its default value if the projection entry is empty on that field.

The type can be either a non-null type or a nullable type. On a non-null type the respective zero type is replaced by the default value, whilst on the nullable type the null value is replaced by the default.

```graphql
type User @crudType {
    name: String! @default(value: "John Appleseed")
    age: Int! @default(value: 0)
    active: Boolean! @default(value: true)
    status: Status! @default(value: "ACTIVE")
}

enum Status {
    ACTIVE
    INACTIVE
}
```

### Mark a field as filterable

Use the `@index` directive on a field enable filtering on it in all list queries and graphql subscriptions.

```graphql
type User @crudType {
    email: String! @index
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
