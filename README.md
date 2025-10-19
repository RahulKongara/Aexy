# 🎯 Aexy - AI Conversation Practice Platform

An intelligent platform for practicing real-world conversations with AI across multiple scenarios.

## ✨ Features

- **Multiple Conversation Scenarios**

  - Job Interview Practice
  - Coffee Shop Conversations
  - Travel Planning
  - Small Talk & Casual Conversations

- **Real-time AI Responses** powered by Google Gemini
- **WebSocket Communication** for instant messaging
- **User Authentication** with JWT
- **Conversation History** with summaries and feedback
- **Tiered Subscription System** (Free, Standard, Premium)
- **Daily Usage Limits** based on subscription tier
- **Beautiful UI** with Tailwind CSS v4

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Axios
- WebSocket Client

### Backend

- Node.js 22
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- WebSocket (ws)
- JWT Authentication
- Google Generative AI (Gemini)

### DevOps

- Docker & Docker Compose
- Railway / Render deployment ready

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL (or Docker)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Local Development (Without Docker)

1. **Clone the repository**

   ```bash
   git clone https://github.com/RahulKongara/Aexy.git
   cd Aexy
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and add your DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

   # Run Prisma migrations
   npx prisma migrate dev
   npx prisma generate

   # Seed the database (optional - adds test users)
   npx prisma db seed

   # Start backend
   npm run dev
   ```

3. **Frontend Setup** (in a new terminal)

   ```bash
   cd frontend
   npm install

   # Start frontend
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Backend Health: http://localhost:5000/health

### Local Development (With Docker)

1. **Clone and navigate**

   ```bash
   git clone https://github.com/RahulKongara/Aexy.git
   cd Aexy
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - PostgreSQL: localhost:5433

## 📦 Project Structure

```
aexy/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Database seeding
│   │   └── migrations/         # Migration history
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, logging, rate limiting
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic (AI, WebSocket, etc.)
│   │   ├── utils/              # Utility functions
│   │   └── server.ts           # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service
│   │   ├── styles/             # Global styles
│   │   └── types/              # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yaml         # Development compose
├── docker-compose.prod.yaml    # Production compose
├── DEPLOYMENT.md               # Deployment guide
└── README.md
```

## 🎮 Usage

### Test Accounts

If you seeded the database, you can use these test accounts:

- **Free Tier**: `free@test.com` / `password123`
- **Standard Tier**: `standard@test.com` / `password123`
- **Premium Tier**: `premium@test.com` / `password123`

### Conversation Scenarios

1. **Job Interview** - Practice professional interviews
2. **Coffee Shop** - Casual ordering and small talk
3. **Travel Planning** - Plan trips with a travel advisor
4. **Small Talk** - General conversation practice

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available environment variables.

**Critical variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `GEMINI_API_KEY` - Google Gemini API key
- `USE_REAL_AI` - Enable real AI (true/false)

### Subscription Tiers

| Tier     | Daily Conversations | Messages per Conversation |
| -------- | ------------------- | ------------------------- |
| Free     | 5                   | 20                        |
| Standard | 15                  | 50                        |
| Premium  | 50                  | 100                       |

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:

- Railway (Recommended)
- Render
- Vercel + Railway
- DigitalOcean
- Custom VPS with Docker

## 📝 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Conversations

- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get specific conversation with messages

### Subscriptions

- `GET /api/subscriptions/me` - Get current user's subscription
- `POST /api/subscriptions/upgrade` - Upgrade subscription tier

### WebSocket

- `ws://localhost:5000/ws?token=<jwt_token>`
- Message types: `start`, `message`, `end`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Database Management

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## 🛠️ Development Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:seed       # Seed database
npm run cleanup:conversations  # Close stale conversations
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the ISC License.

## 👤 Author

**Rahul Kongara**

- GitHub: [@RahulKongara](https://github.com/RahulKongara)

## 🙏 Acknowledgments

- Google Generative AI for Gemini
- Prisma for excellent ORM
- Tailwind CSS for beautiful styling
- Railway for easy deployment

## 📧 Support

For support, email your-email@example.com or open an issue on GitHub.

---

Made with ❤️ by Rahul Kongara
