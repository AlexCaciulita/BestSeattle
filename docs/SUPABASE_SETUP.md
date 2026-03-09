# BestInSeattle — Supabase Setup

1. Create a new Supabase project.
2. In SQL Editor, run: `bestinseattle/docs/supabase-schema.sql`
3. In `bestinseattle/site/.env.local`, set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

4. Start site:

```bash
cd bestinseattle/site
npm run dev
```

5. Seed DB once:

```bash
curl -X POST http://localhost:3000/api/curation/seed
```

6. Open curation dashboard:
- `http://localhost:3000/admin/queue`

## API endpoints
- `GET /api/curation` list items
- `POST /api/curation` create item
- `PATCH /api/curation/:id/status` update status
- `POST /api/curation/seed` seed from local JSON when table is empty
