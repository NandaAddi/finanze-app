# AI Context: Personal Finance Manager

This document provides context for AI assistants working on this codebase.

## 🎯 Project Vision
A minimalist, high-performance Personal Finance Manager designed for individual use. The focus is on clarity, speed, and premium aesthetics.

## 🏗 Architecture
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (Supabase)
- **Database Access**: Supabase SDK (Direct SQL/SDK) - No ORM
- **Auth**: Clerk (Multi-tenant SaaS ready)
- **Storage**: GitHub-backed asset storage (Avatars, Banners)
- **UI**: Tailwind CSS + Shadcn UI + Lora/Geist Fonts

## 📊 Data Models
- **Profile**: User account details (Clerk sync), avatar, banner.
- **Wallet**: Financial accounts (Bank, Cash, Crypto, etc.) with balances.
- **Category**: Transaction categories (Food, Rent, Salary, etc.).
- **Transaction**: Ledger entries (Income/Expense) linked to Wallets and Categories.

## 🎨 Design System
- **Colors**: Emerald (Income), Rose/Rose-600 (Expense), Charcoal/Black (Background).
- **Typography**: 
  - Serif (Lora): Numbers, headings, currency displays.
  - Sans (Geist): Body text, labels, UI elements.
- **Aesthetic**: Claude.ai-inspired (minimal borders, subtle shadows, generous whitespace).

## 📂 Directory Structure
- `/app`: Main application routes (Dashboard, Wallets, Transactions, Analytics, Settings).
- `/components`: Reusable UI components.
- `/utils/supabase`: Supabase clients (Client, Server, Admin).
- `/public`: Static assets.

## 🛠 Guidelines for AI
- **Strict Finance Focus**: Never suggest or re-implement task management or project features.
- **Clean Code**: Use **Supabase SDK** for all database operations. Avoid Prisma.
- **SaaS First**: Always scope database queries to the authenticated user using Clerk `auth()` and the `userId`.
- **Visual Excellence**: All new UI components must match the premium, minimalist design language.
- **Privacy**: Ensure all queries are strictly scoped to the current user.
