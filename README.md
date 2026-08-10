# Meeting Room Display Board

Real-time meeting room availability board.

## Getting Started

### Prerequisites

- Node.js `^18.18.0` or `>= 20.0.0` (Node 24 recommended)
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
