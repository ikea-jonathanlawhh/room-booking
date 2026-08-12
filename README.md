# Meeting Room Display Board

Real-time meeting room availability board.

## Getting Started

### Prerequisites

- Node.js `>= 24.0.0`
- npm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd meeting-room-display

# Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `MEETING_ROOM_API_URL` | Schedule API endpoint URL | `/api/rooms` |
| `HEADER_TITLE` | Application header title | `Meeting Room Display` |

### AI Setup
`npx skills add nuxt/ui`

`npx skills add https://github.com/onmax/nuxt-skills --skill nuxt`

### Development Server

Start dev server on `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

Build application for production:

```bash
npm run build
```

Application accessible at `http://localhost:8080`.