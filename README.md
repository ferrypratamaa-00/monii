# KANTONG - Smart Personal Finance Manager

A modern, secure, and intelligent personal finance management application built with Next.js 15, TypeScript, and cutting-edge web technologies. Track expenses, manage budgets, analyze spending patterns with AI insights, and automate transaction entry with OCR receipt scanning.

## ✨ Features

### Core Financial Management
- **Transaction Tracking**: Record income and expenses with automatic account balance updates
- **Multi-Account Support**: Manage multiple bank accounts, wallets, and cash accounts
- **Category Management**: Organize transactions with customizable income/expense categories
- **Budget Planning**: Set monthly budgets with visual progress tracking and alerts
- **Debt Management**: Track loans, receivables, and payment schedules

### Advanced Analytics & Insights
- **AI-Powered Insights**: Get personalized financial advice based on your spending patterns
- **Trend Analysis**: Visualize income/expense trends over 12 months
- **Spending Analytics**: Pie charts and detailed breakdowns by category
- **Export Capabilities**: Download transaction data as CSV or full backup as JSON

### Smart Automation
- **OCR Receipt Scanning**: Automatically extract transaction details from receipt photos
- **Camera Integration**: Native camera access for mobile receipt capture
- **Smart Categorization**: AI-assisted transaction categorization

### Security & Privacy
- **Secure Authentication**: Password-based login with reset functionality
- **Data Encryption**: Secure data storage with proper isolation
- **Backup & Restore**: Complete data export for backup purposes
- **Error Boundaries**: Graceful error handling throughout the application

### Progressive Web App (PWA)
- **Offline Support**: Core functionality works offline
- **Mobile-First Design**: Responsive design optimized for all devices
- **Installable**: Can be installed as a native app on mobile devices
- **Push Notifications**: Future-ready for budget alerts and reminders

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL (recommended) or SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kantong.git
   cd kantong
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install

   # Or using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/kantong
   DB_DIALECT=postgresql

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # AI Features (optional)
   GEMINI_API_KEY=your_gemini_api_key

   # Email (optional, for password reset)
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. **Database Setup**
   ```bash
   # Generate database schema
   bun run db:gen

   # Push schema to database
   bun run db:push
   ```

5. **Development Server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### First Time Setup
1. **Register**: Create your account with email and password
2. **Add Accounts**: Set up your bank accounts, wallets, or cash accounts
3. **Create Categories**: Organize your transactions with income/expense categories
4. **Start Tracking**: Begin recording your financial transactions

### Key Workflows

#### Recording Transactions
- **Manual Entry**: Use the "Add Transaction" button for manual input
- **Receipt Scanning**: Use the camera to scan receipts for automatic data extraction
- **Quick Actions**: Access frequently used categories and accounts

#### Budget Management
- Set monthly budgets for different expense categories
- Monitor progress with visual indicators
- Receive alerts when approaching budget limits

#### Financial Insights
- View spending trends and patterns
- Get AI-powered recommendations for better financial habits
- Export data for external analysis

## 🛠️ Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
bun run check        # Check and fix code issues
bun run typecheck    # TypeScript type checking

# Database
bun run db:gen       # Generate database migrations
bun run db:push      # Push schema changes to database
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (login, signup)
│   ├── (protected)/       # Protected routes (dashboard, etc.)
│   ├── actions/           # Server Actions
│   └── api/               # API routes
├── components/            # React components
│   ├── app/              # Feature-specific components
│   └── ui/               # Reusable UI components
├── db/                   # Database configuration and schemas
├── lib/                  # Utilities and configurations
├── services/             # Business logic services
└── hooks/               # Custom React hooks
```

### Architecture Principles

- **Separation of Concerns**: Actions (thin), Services (business logic), Components (UI)
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Atomic Operations**: Database transactions for data consistency
- **Security First**: Input validation, authentication, and authorization
- **Performance**: Optimized queries and caching strategies

## 🔒 Security

KANTONG implements multiple layers of security:

- **Authentication**: Secure password hashing with bcrypt
- **Authorization**: User-scoped data access with proper boundaries
- **Input Validation**: Zod schemas at all entry points
- **HTTPS Only**: Secure transport layer encryption
- **Error Handling**: No sensitive information leakage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and standards
- Testing requirements
- Pull request process

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with proper tests
4. Run the full test suite: `bun run check && bun run typecheck`
5. Commit with conventional format: `git commit -m "feat: add new feature"`
6. Push and create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React Framework
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM with [Drizzle](https://drizzle.team/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts with [Recharts](https://recharts.org/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/kantong/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/kantong/discussions)
- **Documentation**: [Project Wiki](https://github.com/yourusername/kantong/wiki)

---

**Made with ❤️ for better personal finance management**
