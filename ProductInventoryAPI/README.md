# ProductInventoryAPI

Standalone Lab Task 04. Place this folder beside CourseManagementAPI and UniversitySystemAPI. Uses the faculty's Module → Controller → Service → Entity pattern, constructor injection, TypeORM repositories, and ESM .js imports. Required names and routes are preserved.

## PostgreSQL setup (Windows / VS Code)

1. Install PostgreSQL with pgAdmin if not already installed. Remember the password you set for the `postgres` user. Start the PostgreSQL service.
2. Open pgAdmin, connect to your local server, right-click Databases, choose Create → Database, enter `product_inventory_db`, and save. Alternatively run `CREATE DATABASE product_inventory_db;` in a database administration query tool. This is setup only; application database operations all use repositories.
3. Open ProductInventoryAPI in VS Code. Copy `.env.example` to `.env` and replace `your_password` with your PostgreSQL password. Adjust host/port/username if needed. `.env` is ignored by Git.
4. Stop the Task 2/3 API with Ctrl+C so port 3000 is available.
5. Run:

```bash
npm ci
npm run start:dev
```

Node.js 24 was used for testing. TypeORM creates the products table automatically in development. Database records persist across restarts. Never use synchronize in production; it is disabled when NODE_ENV=production.

## Tests

```bash
npm test
npm run lint
```

`npm test` builds the actual TypeScript application and executes HTTP tests using the real TypeORM repository against **pg-mem**, a PostgreSQL emulator. It covers all nine routes, sorting, ILike search, category filtering, PUT resets, PATCH preservation, toggles, deletes, 404s, defaults, and validation. This does not substitute for a real PostgreSQL integration test.

For a real PostgreSQL run, create a separate empty database named `product_inventory_test`, then add this line to `.env`:

```text
TEST_DB_DATABASE=product_inventory_test
```

Run:

```bash
npm run test:postgres
```

This command requires a database distinct from DB_DATABASE, refuses existing product records, and cleans up only records it creates. It creates the test schema through TypeORM. Real PostgreSQL could not be run in the preparation environment; this test and manual Postman verification remain local steps.

## Postman

Import `test/ProductInventoryAPI.postman_collection.json` and run requests in their listed order while the API runs. Start with an empty product_inventory_db for the PDF's expected counts of four and then three. The four Create requests automatically save returned IDs in collection variables, so no assumption is made that IDs start at 1. Re-running creates additional records.

The collection covers the four products, all reads, both searches, PATCH/PUT validation, two toggles, delete twice, and invalid create requests. Status assertions are included; inspect returned data and counts as specified in the lab. GET/PATCH/PUT/DELETE return 200 on success; POST returns 201; invalid data returns 400; missing records return 404.

## Implementation details

- Products entity has all nine required fields, decimal(10,2) price, stock/isActive defaults, and automatic timestamps. A transformer returns PostgreSQL decimal values as JSON numbers.
- CreateProductDto validates body fields. Required text is trimmed; prices must fit decimal(10,2); stock must fit a nonnegative PostgreSQL integer.
- UpdateProductDto extends CreateProductDto directly. PartialUpdateProductDto uses PartialType. The PDF calls PUT a full replacement while keeping description, stock, and isActive optional in CreateProductDto. Accordingly, PUT requires name/price/category and resets omitted optional fields to null/0/true. PATCH preserves omitted fields. Optional null stock/isActive inputs use defaults on create/PUT and leave existing values on PATCH; null description clears it.
- SearchProductDto and CategoryProductDto validate search/category inputs, in addition to required body DTOs. Missing or blank search keyword returns 400.
- Every numeric ID route uses ParseIntPipe. Search and category routes precede the generic ID route.
- ProductsService injects Repository<Products> with InjectRepository; all application database calls use that repository. No relationships, raw SQL, or manual timestamps are used.
- Search uses the PDF's ILike wildcard pattern; category matching is exact. Results are newest first (findAll also uses ID to break timestamp ties).

## GitHub

From the AdWebTech-Mid-Lab repository root:

```bash
git status
git add ProductInventoryAPI
git commit -m "Complete Lab Task 04 product inventory CRUD"
git push origin main
```

Verify .env, node_modules, and dist are not staged. No commit or push was performed here.
