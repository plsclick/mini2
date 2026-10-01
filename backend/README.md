# BUILD//PULSE Backend

BUILD//PULSE REST and WebSocket backend with authentication, project management, CPM scheduling, and dynamic delay impact analysis. Recovery optimization and prediction remain out of scope.

## Stack

Node.js, Express 4, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Zod, Socket.IO, dotenv, Helmet, CORS, and Morgan.

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer

Create a database, for example:

```sql
CREATE DATABASE buildpulse;
```

From this directory, copy `.env.example` to `.env` and set a strong random `JWT_SECRET` and the PostgreSQL connection string. `.env` is ignored by Git.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/buildpulse?schema=public"
JWT_SECRET="replace-with-at-least-32-random-characters"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

`CLIENT_URL` accepts a comma-separated list of allowed origins. For Tauri development, add the appropriate local origin used by the installed webview.

## Setup and Commands

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

The standard Prisma seed hook is also configured:

```bash
npx prisma db seed
```

Other commands:

```bash
npm run build
npm start
npm run db:studio
npm run db:migrate:prod
npm test
```

`/health` returns a lightweight server health response. The API starts on port `5000` by default and Socket.IO shares the same HTTP server.

## Demo Accounts

All seeded accounts use `Password123!` in development:

- `client@buildpulse.demo` (`CLIENT`)
- `pm@buildpulse.demo` (`PROJECT_MANAGER`)
- `cm@buildpulse.demo` (`CONSTRUCTION_MANAGER`)

The seed creates the BuildPulse Demo Organization, Skyline Residency, stages, tasks and dependencies, milestones, resources, materials, active delays, a risk, a recovery plan, a requirement, site updates, notifications, and activity records. It refreshes demo account passwords; when Skyline Residency already exists, it preserves existing rows and only adds missing handover, delay, dependency, and milestone-link demo records.

## Authentication and Roles

Send `Authorization: Bearer <JWT>` on protected REST calls. `POST /api/auth/login` returns a token; `GET /api/auth/me` returns the current user. `POST /api/auth/logout` is stateless and tells the client to discard its token.

Public registration creates a new organization and a `CLIENT` account. It does not accept caller-supplied roles or organization IDs. Project Manager and Construction Manager accounts must be created administratively and assigned to a project by a Project Manager. Passwords are bcrypt-hashed.

Every protected project operation checks both organization and direct/project-member access. Clients have read access only. Project Managers manage planning data. Construction Managers can update task progress/status and submit delays, requirements, and site updates. Role checks are enforced on the API, not delegated to the frontend.

## API

All API responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message" } }`. Request validation errors return `422` with field details.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `POST/DELETE /api/projects/:id/members` |
| Users | `GET /api/users` (Project Manager only; current organization) |
| Stages | `GET/POST /api/projects/:projectId/stages`, `GET/PUT/DELETE /api/projects/:projectId/stages/:id` |
| Tasks | `GET/POST /api/projects/:projectId/tasks`, `GET/PUT/DELETE /api/tasks/:id` |
| Dependencies | `GET/POST /api/projects/:projectId/dependencies`, `DELETE /api/dependencies/:id` |
| Resources | `GET/POST /api/projects/:projectId/resources`, `GET/PUT/DELETE /api/projects/:projectId/resources/:id` |
| Materials | `GET/POST /api/projects/:projectId/materials`, `GET/PUT/DELETE /api/projects/:projectId/materials/:id` |
| Milestones | `GET/POST /api/projects/:projectId/milestones`, `GET/PUT/DELETE /api/projects/:projectId/milestones/:id` |
| Delays | `GET/POST /api/projects/:projectId/delays`, `GET/PUT/PATCH /api/projects/:projectId/delays/:id`, `GET /api/projects/:projectId/delays/:id/impact` |
| Schedule | `GET /api/projects/:projectId/schedule`, `GET /api/projects/:projectId/critical-path`, `GET /api/projects/:projectId/schedule/validate`, `GET /api/projects/:projectId/schedule/impact` |
| Risks | `GET/POST /api/projects/:projectId/risks`, `GET/PUT/DELETE /api/projects/:projectId/risks/:id` |
| Recovery plans | `GET/POST /api/projects/:projectId/recovery-plans`, `GET/PUT/DELETE /api/projects/:projectId/recovery-plans/:id` |
| Requirements | `GET/POST /api/projects/:projectId/requirements`, `GET/PUT /api/projects/:projectId/requirements/:id` |
| Site updates | `GET/POST /api/projects/:projectId/site-updates`, `GET/PUT/DELETE /api/projects/:projectId/site-updates/:id` |
| Notifications | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PUT /api/notifications/read-all`, `PUT /api/notifications/:id/read` |
| Project notifications | `POST /api/projects/:projectId/notifications` (Project Manager only) |
| Activity | `GET /api/projects/:projectId/activity`, `GET /api/activity` |

## Socket.IO

Connect to the same origin as the REST API. Authenticate the handshake with `{ auth: { token: "<JWT>" } }` or an Authorization Bearer header. Clients can emit `join:project` with a project ID and `leave:project` to manage rooms. Project room joins re-check organization and membership access. User notification rooms are joined automatically.

Available event names include `project:updated`, `task:updated`, `task:completed`, `delay:reported`, `delay:updated`, `delay:resolved`, `schedule:updated`, `risk:updated`, `requirement:created`, `site-update:created`, `notification:new`, and `activity:new`.

Task creation/deletion or planned-date edits, dependency creation/deletion, and project start-date edits emit `schedule:updated` to the project room. Clients can then request the calculated schedule; no background schedule cache is used.

Delay creation and edits that change delay days or active/resolved status also emit `schedule:updated`; delay lifecycle events are sent separately. The socket layer only broadcasts events and never runs scheduling calculations.

## Scheduling (Phase 2)

The schedule API calculates task duration from planned start/end dates as the difference between normalized UTC calendar dates. Since Project does not yet store an IANA timezone, UTC is the canonical calendar convention for this phase; a planned end on the same UTC date has zero elapsed calendar days. Every scheduled task must have both planned dates and a non-negative duration.

The engine applies FS, SS, FF, and SF constraints using lag days, validates task references and cycles, then runs forward/backward passes. Float is in calendar days; values within `1e-7` days of zero are treated as zero. Critical paths are enumerated from binding zero-float dependencies up to 100 paths; `criticalPathsTruncated` indicates when more exist. Project completion is the latest finish among all tasks, ensuring Start-to-Finish predecessors cannot finish after the reported project completion.

- `GET /api/projects/:id/schedule`
- `GET /api/projects/:id/critical-path`
- `GET /api/projects/:id/schedule/validate`

Unit tests run with `npm test`; they cover single/linear/parallel paths, float, multiple predecessors and terminals, cycle/self-link validation, invalid dates, all four dependency types, and lag.

## Delay Impact (Phase 3)

The delay impact engine loads the project, tasks, dependencies, milestones, and delays, calculates the baseline with the Phase 2 engine, sums active `OPEN`/`INVESTIGATING` delay days per task in memory, then calls that same engine again with duration offsets. It never writes simulated dates or scheduling values to PostgreSQL. Multiple delays on one task are aggregated; delays on different branches are evaluated together by CPM rather than added to the project completion delta. `RESOLVED` delays remain stored for history but are excluded from current impact.

Milestones can optionally link to one task through `Milestone.taskId`. Only unachieved, task-linked milestones whose task finish changes are returned as affected. Existing unlinked milestones remain valid but cannot be accurately projected until linked.

**Permissions:** Clients can read delay lists and both impact endpoints. Construction Managers can report delays and patch reason, description, severity, or delay days, but cannot change status. Project Managers can create, patch, resolve, and use `PUT` for delay updates. All routes also enforce organization and project membership access.

### Report a delay

```http
POST /api/projects/{projectId}/delays
Authorization: Bearer {JWT}
Content-Type: application/json
```

```json
{
	"taskId": "00000000-0000-4000-8000-000000000001",
	"delayDays": 5,
	"reason": "Material shortage",
	"description": "Required reinforcement steel has not arrived.",
	"severity": "HIGH"
}
```

The server assigns `reportedBy`, sets status to `OPEN`, logs activity, notifies project users, and broadcasts `delay:reported` and `schedule:updated`.

### List and update delays

```http
GET /api/projects/{projectId}/delays?status=OPEN&severity=HIGH&taskId={taskId}&fromDate=2026-10-01T00:00:00.000Z&toDate=2026-10-31T23:59:59.000Z
PATCH /api/projects/{projectId}/delays/{delayId}
Authorization: Bearer {JWT}
Content-Type: application/json
```

Patch bodies accept `reason`, `description`, `severity`, and positive integer `delayDays`. Project Managers may also supply `status: "INVESTIGATING"` or `status: "RESOLVED"`; the server sets `resolvedAt` on resolution and clears it if reopened. `PUT` remains available to Project Managers for compatibility.

### Read impact

```http
GET /api/projects/{projectId}/schedule/impact
GET /api/projects/{projectId}/delays/{delayId}/impact
Authorization: Bearer {JWT}
```

Both return `{ "success": true, "data": ... }` with baseline/impacted completion and duration, project delay days, active delay summary, affected task date/float changes and classifications, and changed linked milestones. The individual endpoint applies only the selected delay; if that record is resolved, it reports `isActive: false` and no current schedule effect. An invalid/cyclic schedule returns a structured `422` error from the shared scheduler; inaccessible projects return `403`, missing records `404`, and invalid request data `422`.

Example project impact (the exact dates depend on current task and delay data):

```json
{
	"success": true,
	"data": {
		"baseline": { "completionDate": "2026-09-29", "durationDays": 68 },
		"impacted": { "completionDate": "2026-10-04", "durationDays": 73, "projectDelayDays": 5 },
		"delaySummary": { "activeDelayCount": 2, "totalReportedDelayDays": 9 },
		"affectedTasks": [
			{
				"taskId": "<task-uuid>",
				"taskName": "Procure passenger lift package",
				"baselineStart": "2026-08-29",
				"baselineEnd": "2026-09-24",
				"projectedStart": "2026-08-29",
				"projectedEnd": "2026-09-29",
				"baselineFloat": 0,
				"projectedFloat": 0,
				"floatConsumed": 0,
				"impactDays": 5,
				"directDelayDays": 5,
				"classifications": ["DIRECTLY_DELAYED", "CRITICAL", "PROJECT_COMPLETION_IMPACTED"]
			}
		],
		"affectedMilestones": [
			{
				"milestoneId": "<milestone-uuid>",
				"name": "Practical completion",
				"baselineDate": "2027-06-18",
				"projectedDate": "2027-06-23",
				"delayDays": 5
			}
		]
	}
}
```

## Frontend Integration

Keep the existing frontend unchanged and configure its API origin through Vite:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend should send the bearer token on authenticated API requests. For REST calls, use `${import.meta.env.VITE_API_URL}/projects`; for Socket.IO, connect to the server origin (`http://localhost:5000`) and pass the same JWT in the handshake. Project-room listeners can react to `schedule:updated` and request `/schedule` or `/schedule/impact` again.

## Notes

- Prisma schema is in `prisma/schema.prisma`; migrations are committed under `prisma/migrations` after running `npm run db:migrate -- --name init`.
- Site updates are ready for future photo attachments, but file storage is not included.
- Automated risk prediction, AI recommendations, and recovery optimization are not implemented in this phase.
- `npm install` currently reports transitive dependency audit advisories; review with `npm audit` before production deployment.
