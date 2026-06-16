# Database Design Document

## Migration Strategy

### Versioning Convention
- Format: `YYYYMMDD_HHMMSS_description.sql`
- Each migration is immutable once applied
- A `migrations` tracking table records all applied migrations
- Rollbacks use a corresponding `_down.sql` file

### Migration Workflow
```
development:
  npm run db:migrate     → Apply pending migrations
  npm run db:rollback    → Rollback last migration
  npm run db:seed        → Insert seed data

production:
  npm run db:migrate:prod → Apply with safety checks
```

### Naming Convention
```
20240610_000001_create_users_table.sql
20240610_000002_create_patients_table.sql
20240610_000003_create_doctors_table.sql
...
```

### Naming Rules
- **Tables**: snake_case, plural (e.g., `appointments`)
- **Columns**: snake_case (e.g., `serial_number`)
- **Primary Keys**: `id` (UUID v4)
- **Foreign Keys**: `{referenced_table}_id` (e.g., `doctor_id`)
- **Indexes**: `idx_{table}_{column(s)}`
- **Enums**: UPPER_SNAKE_CASE (e.g., `appointment_status`)

### Type Conventions
- **IDs**: `UUID` (not serial) for distributed systems
- **Timestamps**: `TIMESTAMPTZ` (with timezone)
- **Money**: `DECIMAL(10,2)` (never float)
- **JSON**: `JSONB` (queryable, indexable)
- **Phone**: `VARCHAR(20)` (with country code)
- **Gender**: `VARCHAR(10)` (flexible for Bangladesh context)
- **Blood Group**: `VARCHAR(5)` (e.g., A+, O-)

### Constraint Strategy
- **NOT NULL**: Applied at DB level for all required fields
- **CHECK**: Enum values, positive numbers, valid ranges
- **UNIQUE**: Business-unique fields (phone, email, BMDC reg no)
- **FOREIGN KEY**: Referential integrity, ON DELETE RESTRICT (no cascade deletes on medical data)
- **DEFERRABLE**: FK constraints where circular dependency exists

### Index Strategy
- **B-tree**: Primary indexes, range queries, ORDER BY
- **Hash**: Equality lookups on UUIDs (optional, PG may use b-tree)
- **GIN**: JSONB fields, full-text search
- **Composite**: Cover query patterns (e.g., doctor_id + date)
- **Partial**: Filtered indexes (e.g., WHERE status != 'cancelled')
- **EXCLUDE**: Prevent overlapping schedules

### Auditing
- All tables have `created_at` and `updated_at`
- `updated_at` auto-updated via trigger function
- Soft deletes preferred (where applicable) with `deleted_at`
- Critical changes logged in `audit_logs` table
