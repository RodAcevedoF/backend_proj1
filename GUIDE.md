📘 GUIDE.md
Backend Architecture Guide

A minimal reference for contributing, extending features, and keeping consistency.

🧱 1. Architecture Overview

This project follows a modular hexagonal architecture with vertical slices per feature.

Each feature is self-contained and has:

Domain

Application (use cases + service interface)

Infrastructure (drivens + drivers)

Dependencies builder

The server only registers routers built inside features, and no feature imports another feature directly.

📂 2. Folder Structure
src/
core/
infrastructure/
drivers/
http/
server/
server.ts
bootstrap.ts
routes.ts <-- registers all feature routers
lib/
middlewares.ts
rateLimit.ts
checkers.ts

features/
<feature-name>/
domain/
entities/
ports/
drivens/ <-- Outbound ports (DB, external API)
drivers/ <-- Inbound ports (service interface)
app/
usecases/ <-- Business logic
I<Feature>Service.ts
infrastructure/
drivens/ <-- Implementations of outbound ports
drivers/
<Feature>ServiceAdapter.ts
http/
controllers/
<Feature>Controller.ts
routes.ts
dependencies.ts <-- Builds repo → usecases → service → controller

index.ts <-- Entrypoint, calls bootstrap()

🎯 3. Lifecycle of a Request

HTTP Router
→ /core/.../routes.ts attaches routers from each feature
→ Feature router forwards request to Controller

Controller (driver inbound)
→ Calls a method on the Service

Service Adapter
→ Wraps and orchestrates UseCases
→ Provides a stable API for controllers

Use Cases (application logic)
→ Operate only on domain models
→ Use driven ports (repositories, hashers, UUID, etc.)

Driven Adapters
→ Implement ports (DB, Cloudinary, external APIs)

This ensures flow: HTTP → Service → UseCase → Repository.

🧩 4. Anatomy of a Feature

Each feature must contain these parts:

✔ Domain (entities + ports)

Entities hold and validate state.

Driven ports define outbound interfaces (e.g. IUserRepository).

Driver ports define inbound interfaces (e.g. IUserService).

✔ Application (use cases)

Use cases contain all business logic.
They receive ports via constructor injection.

Example:

class CreateThingUseCase {
constructor(private repo: IThingRepository) {}
execute(input) { ... }
}

✔ Infrastructure

Driven adapters implement domain outbound ports

Drivers adapt use cases to the outside world:

Services (connect multiple use cases)

HTTP Controllers (Express)

Routes

✔ Dependencies

Each feature exports a makeFeatureDependencies() function:

const repo = new Repo();
const useCase = new CreateUseCase(repo);
const service = new ServiceAdapter(useCase);
const controller = new Controller(service);

return { repo, useCase, service, controller }

The server will load this dependency container.

🚀 5. How to Create a New Feature

Use this checklist:

1. Create folders
   features/<name>/
   domain/{entities, ports/drivens, ports/drivers}
   app/usecases
   infrastructure/{drivens, drivers/http/controllers}
   dependencies.ts

2. Define Domain

Create entity

Create outbound ports (usually repositories)

Create inbound port = service interface

3. Create Use Cases

Each use case receives ports in its constructor.

Use pure logic, no Express or HTTP types.

4. Create Infrastructure adapters
   Driven

Implement repositories

Implement hashers, generators, AI clients, etc.

Drivers

Create <Feature>ServiceAdapter that wraps use cases

Create <Feature>Controller

Create routes.ts that maps controller functions to HTTP endpoints

5. Build Dependencies

In <feature>/dependencies.ts:

drivens → usecases → service → controller

Expose:

return {
repo,
useCaseA,
useCaseB,
service,
controller
};

6. Register Routes

In /core/infrastructure/drivers/http/routes.ts:

import { makeFeatureDependencies } from '@/features/<name>/dependencies';
import { createFeatureRouter } from '@/features/<name>/infrastructure/drivers/http/routes';

export function registerRoutes(app: Express) {
const deps = makeFeatureDependencies();
app.use('/<name>', createFeatureRouter(deps.controller));
}

🔧 6. How to Add a Use Case to an Existing Feature

Create file in app/usecases/

Inject required driven ports

Add method to I<Feature>Service.ts

Implement it in <Feature>ServiceAdapter.ts

Update controller to call service

Add route in routes.ts

Update dependencies to construct the new use case and inject it

🧪 7. Testing Strategy
Unit tests (per feature):

Test each use case independently with mocked driven ports

Test repository adapters with fake DB

Integration tests:

Import server factory: createServer()

Use supertest to hit HTTP routes without running listen()

📌 8. Principles to Follow

No feature imports another feature directly
→ they communicate through service interfaces only

Controllers never import use cases
→ they import services

Services never import infrastructure
→ only use cases

Use cases never import Express or HTTP types

Repositories never return primitives
→ they return domain entities

Everything is dependency-injected

🎉 9. TL;DR — How a Feature Works
HTTP request →
Controller →
Service →
Use Case →
Driven Port →
Adapter →
DB / External API
