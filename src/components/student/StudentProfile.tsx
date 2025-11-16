"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  profilePhoto?: string;
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStudentData(userData as StudentData);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('school-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-files')
        .getPublicUrl(filePath);

      setStudentData(prev => prev ? { ...prev, profilePhoto: publicUrl } : null);
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!studentData) {
    return <div className="text-center py-8">No profile data found.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>View and manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={studentData.profilePhoto} />
            <AvatarFallback className="text-2xl">
              {studentData.firstName[0]}{studentData.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button variant="outline" disabled={uploading} asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </Button>
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={studentData.firstName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={studentData.lastName} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={studentData.email} disabled />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={studentData.phoneNumber} disabled />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input value={studentData.dateOfBirth} disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Input value={studentData.gender} disabled />
          </div>
          <div className="space-y-2">
            <Label>Class</Label>
            <Input value={studentData.class} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={studentData.address} disabled />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Guardian Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Guardian Name</Label>
              <Input value={studentData.guardianName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Guardian Phone</Label>
              <Input value={studentData.guardianPhone} disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
