"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Award, School, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <School className="h-8 w-8 text-green-700" />
            <div>
              <h1 className="text-xl font-bold text-green-700">Ghana Excellence School</h1>
              <p className="text-xs text-muted-foreground">Empowering Future Leaders</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-5xl font-bold text-gray-900">
            Welcome to Ghana Excellence School
          </h2>
          <p className="text-xl text-gray-600">
            A comprehensive school management system designed for Ghanaian schools. 
            Managing students, teachers, grades, and attendance with excellence.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Our Features</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Comprehensive student enrollment, profile management, and academic tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Teacher Portal</CardTitle>
              <CardDescription>
                Easy grade entry, attendance marking, and assignment posting for teachers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Class Management</CardTitle>
              <CardDescription>
                Organize classes, assign teachers, and manage course schedules efficiently
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-12 w-12 text-yellow-600 mb-2" />
              <CardTitle>Grades & Reports</CardTitle>
              <CardDescription>
                Track academic performance with detailed grade reports and analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-red-600 mb-2" />
              <CardTitle>Attendance Tracking</CardTitle>
              <CardDescription>
                Monitor student attendance with real-time updates and reports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <School className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Parent Access</CardTitle>
              <CardDescription>
                Keep parents informed with access to their children's academic progress
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">School Announcements</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Term 1 Exams</CardTitle>
              <CardDescription>January 15, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                First term examinations will commence on January 15th. All students should prepare adequately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent-Teacher Meeting</CardTitle>
              <CardDescription>January 20, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Annual parent-teacher conference scheduled. Parents are encouraged to attend and discuss their children's progress.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Computer Lab</CardTitle>
              <CardDescription>Facility Update</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our new state-of-the-art computer lab is now open for all students. ICT classes begin next week.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h3 className="text-3xl font-bold">About Ghana Excellence School</h3>
            <p className="text-lg text-muted-foreground">
              Established in 2005, Ghana Excellence School has been at the forefront of quality education 
              in Ghana. We combine traditional values with modern technology to provide the best learning 
              environment for our students.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <p className="text-4xl font-bold text-green-600">500+</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-600">50+</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-600">20+</p>
                <p className="text-sm text-muted-foreground">Years</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-green-700" />
              <div>
                <p className="font-semibold text-green-700">Ghana Excellence School</p>
                <p className="text-xs text-muted-foreground">Quality Education for All</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>© 2025 Ghana Excellence School. All rights reserved.</p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="/about" className="hover:text-green-700">About</Link>
              <Link href="/contact" className="hover:text-green-700">Contact</Link>
              <Link href="/privacy" className="hover:text-green-700">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}