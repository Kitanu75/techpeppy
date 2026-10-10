# Project Information & Agent Context: Techpeppy

## 1. Domain & Deployment Credentials
- **Target Domain**: [Techpeppy.com](https://techpeppy.com)
- **Official Admin Email**: admin@techpeppy.com
- **Current Live Demo / Vercel**: [https://project-bolt-sb1-mz1qoxaa-1.vercel.app](https://project-bolt-sb1-mz1qoxaa-1.vercel.app)
- **Hostinger / WordPress Admin Login**:
  - Username: `sandeepsi3572`
  - Email: `sandeepsi3572@gmail.com`
  - Password: `SupermanNoida@3364`
- **Vercel Login**: Same credentials as Hostinger
- **Repository & Deployment Strategy**:
  - Code will be pushed to the developer's own GitHub account.
  - Production deployment & domain binding (`Techpeppy.com`) will be configured on the client's Vercel account (`sandeepsi3572@gmail.com`).

---

## 2. Project Vision & Goals
- **Objective**: Build a community platform (Reddit-style / Tech Community) for **Techpeppy.com**.
- **Content Format**: **Photos (Images) + Text (Articles, Discussions, Tech Reviews)** ONLY. (No videos).
- **Database**: **MongoDB Atlas** (M0 Free Cluster with Mongoose / Prisma).
- **Core User Flow**:
  - Users can register, log in, and create profiles.
  - Users can create posts:
    - **Image Posts**: Upload/share photos (single or gallery) with captions.
    - **Text / Discussion Posts**: Write articles, questions, blogs, code snippets with markdown/rich formatting.
  - Reddit-style Upvote & Downvote system (+1 / -1) with Karma points.
  - Nested collapsible comment discussions.
  - Sub-communities / Channels (e.g., `t/TechNews`, `t/Gadgets`, `t/AI-Tools`, `t/Discussions`, `t/Setups`).
  - Feed filters: **Hot**, **New**, **Top**, **Trending**.
  - Modern, responsive, dark/light theme UI (Reddit / Dev.to style).
  - Search posts by keyword, tags, or author.

---

## 3. Current State & Action Items
- Workspace: `d:/sandeep sir project`
- Live demo: `https://project-bolt-sb1-mz1qoxaa-1.vercel.app` (Static Bolt UI without backend)
- Finalized Stack:
  - Frontend & Backend: Next.js (App Router) + Tailwind CSS + Lucide Icons
  - Database: MongoDB Atlas (via Mongoose)
  - Auth: NextAuth.js (Email Credentials + Google OAuth)
  - Media: Image uploads / URLs
- Roadmap Status:
  - [x] 1. Scaffold Next.js 16 application with App Router, TypeScript, and Tailwind CSS.
  - [x] 2. Implement MongoDB Atlas connection & Mongoose schemas (`User`, `Community`, `Post`, `Comment`, `Vote`).
  - [x] 3. Build Reddit feed layout (Header, Left Sidebar, Feed cards, Right Sidebar info & leaderboard).
  - [x] 4. Build Post creation modal (Tabs for '📝 Text / Discussion' and '📸 Photos & Images').
  - [x] 5. Implement signature Upvote/Downvote pillar (+1 / -1) and Nested collapsible comments.
  - [x] 6. Tested & verified full interactive loop on `http://localhost:3000` via browser subagent.
  - [ ] 7. Next: Push to developer's GitHub repository and connect to client's Vercel account (`project-bolt-sb1-mz1qoxaa-1`).
