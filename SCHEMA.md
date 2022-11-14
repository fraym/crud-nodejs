# CRUD schema

You create projection schemas by using the graphql schema language.

## Type Name

The name of the CRUD type is the name of your type. In the following example the type will be called `User`:

```graphql
type User {
	...
}
```

## Fields

You can use the following types for field values: `String`, `ID`, `Int`, `Float`, `Bool`

Example:

```graphql
type User {
    name: String
    age: Int
}
```

Crud will automatically provide the following fields in addition to your defined fields: `createdAt`, `changedAt` and the `id` of your data.
