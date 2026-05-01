# IPMRI Inventory Management System - Setup Guide

This application is built with a modern Full-Stack Architecture (React + Express + Firebase) to provide real-time updates and professional-grade security.

## 🚀 Getting Started

### 1. Requirements
- The application is already configured to run in this environment.
- **Firebase** is initialized and security rules are deployed.

### 2. Authentication
- The system uses **Google Authentication**.
- On first login, you will be assigned the **Staff** role by default.
- To promote a user to **Admin** or **Manager**, go to the **Settings** page (restricted to existing Admins).
- *Initial Admin Setup:* The first user can be manually promoted in the Firestore Console at:
  `https://console.firebase.google.com/project/gen-lang-client-0966513899/firestore/databases/ai-studio-1e8ba660-a9e1-40e2-8fac-558683d3949d/data`

### 3. Usage Instructions
- **Dashboard:** Monitor stock levels and recent activities at a glance.
- **Inventory:** Add your items and raw materials. Set "Low Stock Thresholds" to trigger alerts.
- **Stock Movement:** Use this for manual adjustments (Purchases, Returns, Sales).
- **Production:** Log manufacturing runs. Select raw materials consumed and finished goods produced. The system automatically adjusts inventory levels atomically.
- **Reports:** View summaries of stock status and transaction history. Click "Print Report" for a professional PDF/Paper copy.

## 🏗️ Technical Stack
- **Frontend:** React 19, Tailwind CSS, Motion (Animations).
- **Backend:** Node.js Express (Serving SPA + API).
- **Database:** Google Cloud Firestore (NoSQL, Real-time).
- **Auth:** Firebase Authentication (OAuth).
- **Charts:** Recharts (Data Visualization).

## 🔒 Security
- **Hardened Rules:** Firestore security rules enforce strict data types, prevent unauthorized role escalation, and ensure atomic transactions.
- **Role-Based Access:** 
  - **Admin:** Full system control.
  - **Manager:** Inventory management, production logging, and reports.
  - **Staff:** Stock movements and production logs.
