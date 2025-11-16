"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
}

interface Grade {
  studentId: string;
  score: string;
  feedback: string;
}

export default function GradeEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    assignment: '',
    subject: '',
    maxScore: '',
    term: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      initializeGrades();
    }
  }, [selectedClass, students]);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(studentData);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const initializeGrades = () => {
    const classStudents = students.filter(s => s.class === selectedClass);
    const initialGrades: Grade[] = classStudents.map(s => ({
      studentId: s.id,
      score: '',
      feedback: '',
    }));
    setGrades(initialGrades);
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'feedback', value: string) => {
    setGrades(prev => prev.map(g => 
      g.studentId === studentId ? { ...g, [field]: value } : g
    ));
  };

  const calculateGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const handleSubmit = async () => {
    if (!selectedClass || grades.length === 0) return;

    setLoading(true);
    setSuccess('');

    try {
      const maxScore = parseInt(formData.maxScore);

      const promises = grades.map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        const score = parseInt(grade.score);
        
        if (!student || !grade.score) return Promise.resolve();

        return addDoc(collection(db, 'grades'), {
          studentId: grade.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          subject: formData.subject,
          assignment: formData.assignment,
          score: score,
          maxScore: maxScore,
          grade: calculateGrade(score, maxScore),
          term: formData.term,
          date: formData.date,
          feedback: grade.feedback,
          createdAt: new Date().toISOString(),
        });
      });

      await Promise.all(promises);
      setSuccess('Grades submitted successfully!');
      setOpen(false);
      
      // Reset form
      setFormData({
        assignment: '',
        subject: '',
        maxScore: '',
        term: '',
        date: new Date().toISOString().split('T')[0],
      });
      setGrades([]);
      setSelectedClass('');
    } catch (err) {
      console.error('Error submitting grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const classStudents = students.filter(s => s.class === selectedClass);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Grade Entry</CardTitle>
            <CardDescription>Enter and manage student grades</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Grades
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enter Grades</DialogTitle>
                <DialogDescription>Enter grades for an assignment</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assignment Name</Label>
                    <Input
                      placeholder="e.g., Midterm Exam"
                      value={formData.assignment}
                      onChange={(e) => setFormData({ ...formData, assignment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="e.g., Mathematics"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Term</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData({ ...formData, term: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="term1">Term 1</SelectItem>
                        <SelectItem value="term2">Term 2</SelectItem>
                        <SelectItem value="term3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form1a">Form 1A</SelectItem>
                      <SelectItem value="form2a">Form 2A</SelectItem>
                      <SelectItem value="form3a">Form 3A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {classStudents.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.firstName} {student.lastName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="w-20"
                              value={grades.find(g => g.studentId === student.id)?.score || ''}
                              onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional feedback"
                              value={grades.find(g => g.studentId === student.id)?.feedback || ''}
                              onChange={(e) => handleGradeChange(student.id, 'feedback', e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !selectedClass}>
                    {loading ? 'Submitting...' : 'Submit Grades'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Click "Add Grades" to enter grades for your students.
        </div>
      </CardContent>
    </Card>
  );
}
