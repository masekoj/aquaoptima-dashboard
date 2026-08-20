# AquaOptima Dashboard

Act as an expert Full-Stack Software Architect and React Developer. I am building a web application based on the following technical blueprint. Please review this architecture before generating any code or UI components.

## 🚀 Project Overview

- App Name: AquaOptima

- Purpose: A web-based platform designed to optimize fish harvest cycles using biological growth models to reduce feed waste.

## 🏗 System Architecture & Tech Stack

- Frontend: React + TypeScript + Tailwind CSS (Vite build)

- State Management: Zustand (For handling harvest cycle calculations globally)

- Backend/Database: Supabase PostgreSQL integration

- UI/UX Design System: Clean, high-performance, mobile-responsive dashboard using Tailwind CSS and Lucide React icons.

## 🧪 Key Logic & Mathematical Engine

- The core calculation engine must live in a dedicated utility file (e.g., `src/utils/growth-models.ts`).

- It must implement the Von Bertalanffy Growth Function (VBGF) to predict fish length and weight over time:

  L(t) = L_inf * (1 - exp(-K * (t - t_0)))

- All calculations should be processed client-side with instant UI feedback before syncing updates to Supabase.

## 🎯 Immediate Objective

Please scaffold the initial project layout with:

1. A modular folder structure (`components/`, `utils/`, `types/`, `store/`).

2. A responsive layout shell featuring a sidebar/navbar and a main dashboard view.

3. A primary dashboard card/widget that takes inputs for growth coefficients and renders a preliminary growth curve calculation.

Acknowledge this architecture, confirm you understand the stack and math constraints, and let's begin building step-by-step.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66ffdb58-1325-46bb-8978-4b496bf5cc96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
