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

-   You can use the following types for field values: `String`, `ID`, `Int`, `Float`, `Bool`
-   You can use other objects as type of a field, too.
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
