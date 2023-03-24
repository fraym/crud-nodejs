# vNext

# v0.16.1

-   (bug) Fix config

# v0.16.0

-   (bc) Use http migration api

# v0.15.1

-   (bug) Fix migration logic

# v0.15.0

-   (feature) Add `PERMISSIONS_SCHEMA_GLOB` env variable

# v0.14.3

-   (bug) Stringify all payload fields

# v0.14.2

-   (bug) Fix filter handling

# v0.14.1

-   (improvement) Improve error handling in migrations
-   (bug) Allow nested types in nested types

# v0.14.0

-   (feature) Add `@permission` directive
-   (feature) Add `@expires` directive
-   (feature) Add `@filterFromJwtData` directive
-   (feature) Add `@fromJwtData` directive

# v0.13.1

-   (bug) Also export `Filter`, `FieldFilter` and `Order`

# v0.13.0

-   (feature) Allow order for list query
-   (feature) Delete by filter

# v0.12.0

-   (feature) Allow providing the id when creating a new entry

# v0.11.0

-   (feature) Add support for `File`s

# v0.10.1

-   (bug) Remove null from return type of `getData` and `getDataList`

# v0.10.0

-   (bc) Make filter `getData` and `getDataList` generic

# v0.9.2

-   (bug) Make filter `and` and `or` optional

# v0.9.1

-   (bug) Use working version of @grpc/grpc-js

# v0.9.0

-   (feature) Add logging to crud command

# v0.8.1

-   (bug) Fix namespace error message

# v0.8.0

-   (feature) Add `CRUD_NAMESPACE` env variable
-   (improvement) Do not allow type names that start with `Fraym`

# v0.7.1

-   (bug) Fix protobuf declarations

# v0.7.0

-   (feature) Add `@index`
-   (feature) Add filter for `getDataList` of delivery client

# v0.6.0

-   (feature) Add `DateTime` support
-   (internal) Improve documentation

# v0.5.0

-   (feature) Add enum support

# v0.4.0

-   (bc) Switch to support for config in .env files

# v0.3.1

-   (bug) Fix order of migration steps

# v0.3.0

-   (feature) Add array fields and object / reference support

# v0.2.0

-   (feature) Add `crud` cli command

# v0.1.0

-   (feature) Management API
-   (feature) Delivery API
