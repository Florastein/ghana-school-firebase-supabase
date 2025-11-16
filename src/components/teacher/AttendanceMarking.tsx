"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
}

interface AttendanceRecord {
  [studentId: string]: 'present' | 'absent' | 'late';
}

export default function AttendanceMarking() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'classes'));
      const classData: Class[] = [];
      querySnapshot.forEach((doc) => {
        classData.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(classData);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentData: Student[] = [];
      querySnapshot.forEach((doc) => {
        const student = { id: doc.id, ...doc.data() } as Student;
        if (student.class === selectedClass) {
          studentData.push(student);
        }
      });
      setStudents(studentData);
      
      // Initialize attendance as present for all students
      const initialAttendance: AttendanceRecord = {};
      studentData.forEach(s => {
        initialAttendance[s.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return;

    setSaving(true);
    setSuccess('');

    try {
      const selectedClassData = classes.find(c => c.name === selectedClass);
      
      // Save attendance for each student
      const promises = students.map(student => 
        addDoc(collection(db, 'attendance'), {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          class: selectedClass,
          subject: selectedClassData?.subject || '',
          date: date,
          status: attendance[student.id] || 'present',
          teacher: 'Current Teacher', // This should be from auth context
          createdAt: new Date().toISOString(),
        })
      );

      await Promise.all(promises);
      setSuccess('Attendance recorded successfully!');
      
      // Reset after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Record student attendance for your classes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.name}>
                    {cls.name} - {cls.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {students.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={attendance[student.id] || 'present'}
                        onValueChange={(value: 'present' | 'absent' | 'late') => 
                          handleAttendanceChange(student.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Submit Attendance'}
            </Button>
          </>
        )}

        {selectedClass && students.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No students found in this class.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
