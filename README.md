# 🩸 Blood Donation Management System (BDMS)

## 📌 Project Overview

The *Blood Donation Management System (BDMS)* is a *backend-driven mobile application* designed to manage and streamline blood donation activities. The system provides a centralized platform where *donors*, *recipients* and *administrators* can interact securely through role-based access.

This project is being developed incrementally. The current implementation focuses on the *initial foundational phase*, which includes *user registration*, *authentication*, and *role-based dashboards*.

# 🎯 Objectives (Current Phase)

* Implement secure user registration and login
* Support multiple user roles (Donor, Recipient, Admin)
* Maintain persistent user data using a database
* Provide separate home screens for each role
* Establish a scalable backend–frontend architecture


# 🏗️ System Architecture (Current)

* Frontend: React Native 
* Backend: Node.js with Express
* Database: SQLite (embedded)
* Architecture Style: Client–Server (Centralized)


# ✅ Features Implemented (Initial Progress)

# 🔐 Authentication & Authorization

* User registration with role selection
* Secure login using backend APIs
* Centralized authentication state management
* Role-based access control

# 🗂️ User Roles

* *Donor*
* *Recipient*
* *Admin*

Each role is redirected to a *separate dashboard* after successful authentication.

# 🧑‍💻 Role-Based Dashboards

* Donor Home Screen
* Recipient (User) Home Screen
* Admin Dashboard

# 🗄️ Database Integration

* SQLite database for persistent storage
* Users table with role and account metadata
* Database initialized on backend startup


# 📁 Project Structure (Current Scope)

```text
BDMS/
├── backend/
│   ├── server.js              # Express server with auth APIs & DB setup
│   ├── bdms.db                # SQLite database
│   └── package.json           # Backend dependencies
│
├── src/
│   ├── context/
│   │   └── AuthContext.tsx    # Global authentication state
│   │
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication logic
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── DonorNavigator.tsx
│   │   └── RecipientNavigator.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── donor/
│   │   │   └── DonorHomeScreen.tsx
│   │   ├── user/
│   │   │   └── UserHomeScreen.tsx
│   │   └── admin/
│   │       └── AdminDashboard.tsx
│   │
│   └── services/
│       └── api/
│           └── authApi.ts
│
├── App.tsx                    # Application entry point
└── package.json               # Frontend dependencies
```


# 🚀 How the System Works (Current)

1. User registers through the mobile app and selects a role
2. Registration data is sent to the backend via REST APIs
3. Backend stores user information in SQLite database
4. User logs in using credentials
5. After authentication, the system checks the user role
6. User is redirected to the appropriate dashboard


## 🧪 Project Status

🟢 *Completed (Initial Phase):*

* Backend setup
* Database integration
* Registration & login
* Role-based navigation
* Separate dashboards

🟡 *In Progress / Planned:*

* Blood request management
* Donor–recipient matching
* Notifications
* Location-based services
* Analytics & reporting


## 🔮 Future Enhancements

* Advanced donor–recipient matching algorithm
* Push notifications
* Live location tracking
* Database abstraction layer (DBHelper/Repository)
* Cloud deployment
* Enhanced security and validation


## 🎓 Academic Note

This project is developed as a **Final Year Project (FYP)** and currently represents a **functional prototype**. The focus of the current phase is to establish a strong and scalable foundation before implementing advanced features.

## 👤 Authors

*Student Names:* *Naveed Ul Haq*, *Muhammad Sudais Khan* and *Syed Hasnain Ali Shah*

*Program:* BSSE

*Institution:* *INSTITUTE OF MANAGEMENT SCIENCES*


