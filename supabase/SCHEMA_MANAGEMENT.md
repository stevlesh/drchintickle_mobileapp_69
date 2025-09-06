# Database Schema Management

## Directory Structure

```
supabase/
├── migrations/           # Incremental changes (version controlled)
│   ├── 20250904_security_fixes.sql
│   └── 20250911_drop_legacy_rpcs.sql
├── schema_snapshots/    # Full schema snapshots at points in time
│   └── 20250903_initial.sql
└── SCHEMA_MANAGEMENT.md # This file
```

## Best Practices

### 1. Migrations (Incremental Changes)
- **When**: For each database change
- **Format**: `YYYYMMDD_description.sql`
- **Content**: Only the changes (ALTER, CREATE, DROP)
- **Purpose**: Apply changes to existing databases

### 2. Schema Snapshots (Full Schema)
- **When**: Major releases or milestones
- **Format**: `schema_snapshots/YYYYMMDD_description.sql`
- **Content**: Complete schema dump
- **Purpose**: Set up new environments, documentation

### 3. Schema Change Workflow

#### For Development:
1. Make changes via Supabase Dashboard or MCP
2. Generate migration: `supabase db diff -f new_feature`
3. Review and commit migration file
4. Team members run: `supabase migration up`

#### For Production:
1. Test migration in staging
2. Apply via Supabase Dashboard or CLI
3. Commit migration file to track history

### 4. Snapshot Generation

Generate a new snapshot periodically:
```bash
# Via Supabase CLI (if configured)
supabase db dump --data-only=false > supabase/schema_snapshots/$(date +%Y%m%d)_snapshot.sql

# Or via pg_dump directly
pg_dump DATABASE_URL --schema-only > supabase/schema_snapshots/$(date +%Y%m%d)_snapshot.sql
```

### 5. Schema Documentation

Keep snapshots for:
- Initial launch version
- Major feature additions
- Before breaking changes
- Production deployments

## Current Schema Version

**Latest Snapshot**: `20250903_initial.sql`
**Latest Migration**: `20250904_security_fixes.sql`

## Schema Change Log

### 2025-09-03: Initial Schema
- Core tables: profiles, workouts, workout_sessions
- RPC functions for onboarding and workout completion
- Feature flags system

### 2025-09-04: Security Improvements  
- Enabled RLS on workouts table
- Parameter-less RPCs using auth.uid()
- Legacy shim functions for compatibility