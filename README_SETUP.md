# Ghana School Management System - Setup Guide

A comprehensive school management system built with Next.js, Firebase, and Supabase, tailored for Ghanaian schools.

## Features

### For Administrators
- **Student Enrollment Management**: Add, edit, and manage student records
- **Teacher Management**: Manage teaching staff information and assignments
- **Class Management**: Create and organize classes with teacher assignments
- **Dashboard Analytics**: Overview of school statistics

### For Teachers
- **Class Roster**: View and manage assigned students
- **Attendance Marking**: Record daily attendance for classes
- **Grade Entry**: Enter and manage student grades
- **Assignment Posting**: Create and post assignments for students

### For Students
- **Profile Management**: View and update personal information with photo upload
- **Grades Viewer**: Track academic performance
- **Attendance Tracker**: Monitor attendance records
- **Assignment Submission**: Submit assignments with file attachments

### For Parents
- **Children Overview**: Monitor multiple children's progress
- **Performance Tracking**: View grades and attendance
- **Real-time Updates**: Stay informed about academic status

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** with Email/Password provider
4. Enable **Firestore Database**
5. Get your configuration from Project Settings:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 2. Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Create a storage bucket named `school-files` with public access
4. Create folders in the bucket:
   - `profile-photos`
   - `assignments`
5. Get your credentials from Project Settings > API:
   - Project URL
   - Anon/Public Key

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Firestore Database Structure

The system uses the following Firestore collections:

- **users**: User profiles with role information
- **students**: Student records with enrollment details
- **teachers**: Teacher information and qualifications
- **classes**: Class information with teacher assignments
- **grades**: Student grades and academic records
- **attendance**: Daily attendance records
- **assignments**: Posted assignments
- **submissions**: Student assignment submissions

### 5. Supabase Storage Structure

Storage bucket `school-files` contains:
- `profile-photos/`: Student profile pictures
- `assignments/`: Assignment submission files

### 6. Running the Application

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## User Roles

### Creating Admin Account
1. Sign up with role "Administrator"
2. Use the admin dashboard at `/admin/dashboard`

### Creating Teacher Account
1. Admin creates teacher record in Teacher Management
2. Teacher signs up with matching email
3. Access teacher portal at `/teacher/dashboard`

### Creating Student Account
1. Admin enrolls student in Student Management
2. Student signs up with matching email
3. Access student portal at `/student/dashboard`

### Creating Parent Account
1. Sign up with role "Parent"
2. View children's progress at `/parent/dashboard`

## Ghanaian Education Context

The system is designed for Ghanaian schools with:
- **JHS Levels**: Junior High School (JHS 1-3)
- **SHS Levels**: Senior High School (SHS 1-3)
- **Term System**: 3 terms per academic year
- **Grading Scale**: A+ to F with percentage-based calculation
- **Ghana-specific formatting**: Phone numbers, addresses, etc.

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Shadcn/UI, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (recommended)

## Support

For issues or questions, please refer to the documentation:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## License

Copyright © 2025 Ghana Excellence School. All rights reserved.
