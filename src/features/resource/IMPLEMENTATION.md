# Resource Feature Implementation

## Overview

The Resource feature replaces the single `Article` entity with a unified `Resource` entity that supports multiple types: article, video, book, course, paper, and exercise.

**Design Pattern:** Discriminated Union (Option B) - single collection with `type` field discriminator.

---

## Progress Summary

### COMPLETED

| Item | Description | Date |
|------|-------------|------|
| Domain Layer | Resource entity, factory, ports | Done |
| Application Layer | DTOs, use cases, mappers | Done |
| Infrastructure - Persistence | Schema, mapper, repository | Done |
| Service Adapter | ResourceServiceAdapter | Done |
| HTTP Controller | ResourceController with all CRUD operations | 2024-12-13 |
| HTTP Routes | All routes wired with auth middleware | 2024-12-13 |
| DI Wiring | dependencies.ts, bootstrap.ts, routes.ts | 2024-12-13 |
| TypeScript Fixes | All compilation errors resolved | 2024-12-13 |
| Validators | Zod schemas for create/update/query/bulk with discriminated union | 2024-12-15 |
| Update Roadmap | Added resourceId to LearningResource value object, schema, mapper, DTOs | 2024-12-15 |

### PENDING

| Item | Priority | Description |
|------|----------|-------------|
| External Providers | Medium | Adapt SemanticScholar, add YouTube/OpenLibrary (waiting for API keys) |
| Enrichment Service | Medium | LLM enrichment for selective resource types (needs planning) |
| Deprecate Article | Low | Final goal after full migration |

---

## Current Structure

```
src/features/resource/
├── domain/
│   ├── Resource.ts              # Entity with discriminated union
│   ├── ResourceFactory.ts       # Factory pattern for creating typed resources
│   └── ports/
│       ├── inbound/
│       │   └── iresource.service.ts
│       └── outbound/
│           └── iresource.repository.ts
├── app/
│   ├── dtos/
│   │   └── resource.dto.ts      # All DTOs (Create, Update, Query, Response)
│   └── usecases/
│       ├── mappers.ts
│       ├── create-resource.usecase.ts
│       ├── get-resource.usecase.ts
│       ├── find-by-workspace.usecase.ts
│       ├── find-resources.usecase.ts
│       ├── update-resource.usecase.ts
│       ├── delete-resource.usecase.ts
│       └── bulk-insert-resources.usecase.ts
├── infrastructure/
│   └── adapters/
│       ├── driven/
│       │   └── persistence/
│       │       ├── resource.schema.ts
│       │       ├── resource.mapper.ts
│       │       └── mongo-resource.repository.ts
│       └── driver/
│           ├── resource-adapter.service.ts
│           └── http/
│               ├── resource.controller.ts
│               ├── resource.routes.ts
│               └── validators/
│                   └── resource.validators.ts  # Zod schemas
└── dependencies.ts              # DI container (includes controller)

# Core (shared)
src/core/infrastructure/drivers/http/
└── validate.middleware.ts       # Reusable Zod validation middleware
```

## API Routes (LIVE)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/resources` | Required | Query with filters |
| GET | `/resources/:resourceId` | Required | Get by ID |
| PUT | `/resources/:resourceId` | Required | Update |
| DELETE | `/resources/:resourceId` | Required | Delete |
| POST | `/workspaces/:workspaceId/resources` | Editor | Create |
| GET | `/workspaces/:workspaceId/resources` | Member | List by workspace |
| POST | `/workspaces/:workspaceId/resources/bulk` | Editor | Bulk insert |

Base path: `${API_BASE}` (default: `/sagepoint/api/v1`)

---

## Resource Types & Metadata

| Type     | Metadata Fields                                              |
|----------|--------------------------------------------------------------|
| article  | content, authors, publishedAt, summary, aiCategories         |
| video    | duration, platform, channelName, thumbnailUrl                |
| book     | authors, isbn, publisher, publishedYear, pages, chapters     |
| course   | platform, instructor, duration, modules, certificate         |
| paper    | authors, abstract, publishedAt, journal, doi, citations      |
| exercise | estimatedTime, solution, hints                               |

---

## Next Steps (Priority Order)

### 1. External Providers (Medium Priority - waiting for API keys)

Adapt existing providers to return Resources:

- `SemanticScholarProvider` → returns `Resource` with `type: 'paper'`
- Create new providers:
  - `YouTubeProvider` → returns `Resource` with `type: 'video'`
  - `OpenLibraryProvider` → returns `Resource` with `type: 'book'`

### 2. Enrichment Service (Medium Priority - needs planning)

Update LLM enrichment to work with selective resource types:

```typescript
interface IResourceEnrichmentLLM {
  enrichArticle(resource: Resource): Promise<ArticleMetadata>;
  enrichPaper(resource: Resource): Promise<PaperMetadata>;
  generateSummary(resource: Resource): Promise<string>;
  suggestCategories(resource: Resource): Promise<string[]>;
}
```

**Planning needed:**
- Which resource types benefit from enrichment?
- What enrichment operations per type?
- Trigger: manual vs automatic on create?

### 3. Deprecate Article Feature (Low Priority - final goal)

After migration and validation:

1. Update imports throughout codebase to use Resource
2. Mark Article feature as deprecated
3. Eventually remove `src/features/article/` directory

---

## API Examples

### Create Article Resource

```json
POST /workspaces/:workspaceId/resources
{
  "type": "article",
  "title": "Introduction to Machine Learning",
  "url": "https://example.com/ml-intro",
  "tags": ["ml", "ai"],
  "categoryIds": ["cat-1"],
  "difficulty": "beginner",
  "metadata": {
    "content": "Article content here...",
    "authors": ["John Doe"],
    "publishedAt": "2024-01-15T00:00:00Z"
  }
}
```

### Create Video Resource

```json
POST /workspaces/:workspaceId/resources
{
  "type": "video",
  "title": "Neural Networks Explained",
  "url": "https://youtube.com/watch?v=abc123",
  "tags": ["ml", "neural-networks"],
  "difficulty": "intermediate",
  "metadata": {
    "duration": 45,
    "platform": "youtube",
    "channelName": "3Blue1Brown"
  }
}
```

### Query Resources by Type

```
GET /resources?workspaceId=ws-123&types=article,paper&status=published&page=1&limit=20
```

---

## Database Indexes

Defined in `resource.schema.ts`:

```javascript
ResourceSchema.index({ workspaceId: 1, type: 1 });
ResourceSchema.index({ workspaceId: 1, status: 1 });
ResourceSchema.index({ workspaceId: 1, createdAt: -1 });
ResourceSchema.index({ source: 1, externalId: 1 }, { sparse: true });
ResourceSchema.index({ title: 'text', description: 'text' });
```

---

## Notes

- The `metadata` field uses `Schema.Types.Mixed` for flexibility
- Type guards in Resource entity (`isArticle()`, `isVideo()`, etc.) enable type-safe access to metadata
- Factory pattern ensures proper metadata structure per type
- Single collection approach simplifies queries like "get all resources for workspace"
- TypeScript compiles cleanly as of 2024-12-15
- Migration script not needed (dev/qa can rebuild from scratch)
- Roadmap LearningResource now supports `resourceId` linking to Resource entities
