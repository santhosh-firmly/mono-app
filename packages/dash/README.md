# Dash

Dashboard application for the Firmly ecosystem. Built with SvelteKit 2 and Svelte 5, deployed to Cloudflare Workers.

## Local Development

Running the dash application locally requires **two services** to be running simultaneously:

### 1. Start the Durable Objects Worker (dash-do)

```bash
# From the monorepo root
npm run dev --workspace @firmly/dash-do

# Or from packages/dash-do
cd packages/dash-do && npm run dev
```

This starts the `dash-do` worker which hosts the Durable Objects (DashUserDO, MerchantDO) used by the dashboard for user and merchant state management.

### 2. Start the Dashboard Application

```bash
# From the monorepo root
npm run dev --workspace dash

# Or from packages/dash
cd packages/dash && npm run dev
```

The application will be available at `http://localhost:5173`.

### Quick Start (Both Services)

You can run both services in separate terminal windows:

```bash
# Terminal 1 - Durable Objects Worker
npm run dev --workspace @firmly/dash-do

# Terminal 2 - Dashboard
npm run dev --workspace dash
```

## Project Structure

```
packages/dash/
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable UI components
│   │   ├── server/           # Server-side utilities (JWT, email, etc.)
│   │   ├── mocks/            # Mock data for development/testing
│   │   └── stores/           # Svelte stores (theme, etc.)
│   └── routes/
│       ├── (firmly-user-only)/  # Routes for Firmly admin users
│       ├── (logged-in)/         # Routes for authenticated users
│       ├── (logged-out)/        # Public routes (login, signup)
│       ├── api/                 # API endpoints
│       └── invite/              # Invite flow routes
├── migrations/               # D1 database migrations
├── docs/                     # Documentation
└── static/                   # Static assets
```

## Cloudflare Bindings

The application uses several Cloudflare services:

| Binding | Type | Description |
|---------|------|-------------|
| `firmlyConfigs` | D1 Database | Merchant configurations |
| `reporting` | D1 Database | Reporting data |
| `dashUsers` | D1 Database | User data |
| `OTP_STORE` | KV Namespace | OTP token storage |
| `AVATARS` | R2 Bucket | User avatar storage |
| `DASH_DO` | Service Binding | Durable Objects worker |

## Storybook

Component development and documentation is powered by Storybook:

```bash
# Start Storybook dev server
npm run storybook --workspace dash

# Build static Storybook
npm run build-storybook --workspace dash

# Run Storybook tests
npm run test:storybook --workspace dash
```

Storybook runs on `http://localhost:6006`.

## Testing

```bash
# Run all tests (builds Storybook and runs test-runner)
npm test --workspace dash

# Run Storybook tests against running server
npm run test:storybook --workspace dash

# Run tests in CI mode
npm run test:storybook:ci --workspace dash
```

## Deployment

Deploy to specific environments using the deploy scripts:

```bash
npm run deploy-dev --workspace dash   # dash.firmly.dev
npm run deploy-ci --workspace dash    # dash.firmlyci.com
npm run deploy-qa --workspace dash    # dash.amarood.art
npm run deploy-uat --workspace dash   # dash.firmlyuat.com
npm run deploy-prod --workspace dash  # dash.firmly.live
```

**Note:** Remember to also deploy the `dash-do` worker when deploying to a new environment:

```bash
npm run deploy-dev --workspace @firmly/dash-do
```

## Tech Stack

- **Framework:** SvelteKit 2 with Svelte 5 (runes)
- **Styling:** Tailwind CSS 3
- **UI Components:** bits-ui, svelte-radix
- **Charts:** Chart.js
- **Auth:** Azure AD, JWT, Magic Links, OTP
- **Deployment:** Cloudflare Workers
- **Testing:** Storybook + test-runner
