# FinTrack - Personal Finance Management Application

FinTrack is a comprehensive personal finance management application built with React, TypeScript, and Express. It helps users track their income, expenses, budgets, and financial goals with an intuitive interface and powerful analytics.

## Features

### 🏠 Dashboard

The dashboard provides a comprehensive overview of your financial health:

- **Key Metrics**: Total balance, monthly income, monthly expenses, and net income
- **Analytics Charts**:
  - Monthly income and expense trends (line chart)
  - Expense categories breakdown (pie chart)
  - Income vs expenses comparison (bar chart)
- **Recent Transactions**: Quick view of your latest 5 transactions
- **Real-time Updates**: All metrics update automatically as you add transactions

### 💰 Transactions Management

Complete CRUD operations for managing your financial transactions:

- **Add/Edit/Delete Transactions**: Full transaction lifecycle management
- **Advanced Filtering**:
  - Search by description
  - Filter by type (income/expense)
  - Filter by category
  - Date range filtering
- **Responsive Design**: Desktop table view and mobile card view
- **Transaction Details**: Support for notes and detailed descriptions
- **Bulk Operations**: Efficient handling of multiple transactions

### 🎯 Budget Tracking

Set and monitor spending limits across different categories:

- **Category-based Budgets**: Set monthly budgets for expense categories
- **Progress Tracking**: Visual progress bars showing spending vs budget
- **Over-budget Alerts**: Clear warnings when exceeding budget limits
- **Budget Analytics**: Overall budget overview with remaining amounts
- **Real-time Updates**: Automatic calculation of spent amounts

### 🏷️ Category Management

Organize your transactions with customizable categories:

- **Income & Expense Categories**: Separate organization for different transaction types
- **Custom Categories**: Create, edit, and delete categories with custom colors
- **Category Analytics**: View transaction counts and total amounts per category
- **Data Integrity**: Prevent deletion of categories with existing transactions
- **Visual Organization**: Color-coded categories for easy identification

### 🔄 Recurring Transactions

Automate regular income and expenses:

- **Template Creation**: Set up recurring transaction templates
- **Frequency Options**: Daily, weekly, monthly, and yearly recurring patterns
- **Automatic Generation**: Generate transactions automatically based on templates
- **Active/Inactive Management**: Enable or disable recurring templates
- **Next Occurrence Tracking**: See when the next transaction will be generated
- **Template Management**: Full CRUD operations for recurring templates

### 📊 Reports & Analytics

Generate detailed financial reports and export data:

- **Report Types**:
  - Summary Report: Total income, expenses, net income, and transaction count
  - Category Report: Breakdown by categories with income/expense/net analysis
  - Monthly Report: Time-based analysis of financial trends
  - Budget Report: Budget vs actual spending comparison
- **Flexible Filtering**: Date range and category-based report filtering
- **CSV Export**: Export all reports to CSV format for external analysis
- **Visual Analytics**: Charts and graphs for better data understanding

### ⚙️ Settings & Data Management

Comprehensive data management and import/export capabilities:

- **CSV Import**: Import transactions from CSV files with automatic category creation
- **Data Export**: Export transactions and categories to CSV with date filtering
- **Data Reset**: Reset all data and restore default categories (danger zone)
- **Import Mapping**: Flexible column mapping for CSV imports
- **Data Validation**: Robust error handling and validation during imports

### 🔐 Authentication & Security

Secure user authentication system:

- **Email/Password Authentication**: Traditional login with email and password
- **Google OAuth Integration**: Sign in with Google account
- **Password Recovery**: Forgot password functionality with email reset
- **Email Verification**: Account verification for new registrations
- **Remember Me**: Persistent login sessions
- **Secure Sessions**: Protected routes and session management

### 🎨 User Interface & Experience

Modern, responsive design with excellent user experience:

- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean SPA routing with React Router 6
- **Loading States**: Smooth loading animations and feedback
- **Toast Notifications**: Real-time feedback for user actions
- **Form Validation**: Client-side validation with helpful error messages
- **Accessibility**: Screen reader support and keyboard navigation

### 📱 Mobile-First Design

Fully responsive application that works seamlessly on all devices:

- **Adaptive Layouts**: Different views for desktop and mobile
- **Touch-Friendly**: Optimized touch targets and gestures
- **Mobile Navigation**: Collapsible menus and mobile-optimized components
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Basic functionality works without internet connection

## Technology Stack

### Frontend

- **React 18** with TypeScript
- **React Router 6** for SPA routing
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **Recharts** for data visualization
- **Lucide React** for icons
- **Sonner** for toast notifications

### Backend

- **Express.js** server
- **Vite** for development and build
- **TypeScript** throughout the stack

### Data Storage

- **Local Storage** for client-side data persistence
- **IndexedDB** for larger data sets
- **CSV** for data import/export

### Development Tools

- **Vitest** for testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd fin-track
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

### Mobile App Deployment

FinTrack includes Capacitor configuration for mobile app deployment on Android and iOS.

#### Android App

1. Build the web app:

```bash
pnpm mobile:build
```

2. Sync with Capacitor:

```bash
pnpm mobile:sync
```

3. Open Android Studio and build:

```bash
pnpm mobile:android
```

4. Or build APK directly:

```bash
cd android && ./gradlew assembleDebug
```

#### iOS App (macOS only)

1. Build the web app:

```bash
pnpm mobile:build
```

2. Sync with Capacitor:

```bash
pnpm mobile:sync
```

3. Open Xcode:

```bash
pnpm mobile:ios
```

## Project Structure

```
fin-track/
├── client/                 # React frontend
│   ├── pages/             # Route components
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and hooks
│   └── global.css        # Global styles
├── server/               # Express backend
│   ├── index.ts         # Server setup
│   └── routes/          # API routes
├── shared/              # Shared types and interfaces
└── android/             # Capacitor mobile app
```

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo data endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

**FinTrack** - Take control of your finances with powerful analytics and intuitive design.
