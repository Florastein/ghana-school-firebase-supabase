"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Grade {
  id: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  grade: string;
  term: string;
  date: string;
  feedback: string;
}

export default function GradesViewer() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'grades'),
        where('studentId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const gradeData: Grade[] = [];
      querySnapshot.forEach((doc) => {
        gradeData.push({ id: doc.id, ...doc.data() } as Grade);
      });
      setGrades(gradeData);
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'default';
    if (grade === 'B' || grade === 'B+') return 'secondary';
    if (grade === 'C' || grade === 'C+') return 'outline';
    return 'destructive';
  };

  if (loading) {
    return <div className="text-center py-8">Loading grades...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Grades</CardTitle>
        <CardDescription>View your academic performance</CardDescription>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No grades available yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.subject}</TableCell>
                  <TableCell>{grade.assignment}</TableCell>
                  <TableCell>
                    {grade.score}/{grade.maxScore}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getGradeBadgeVariant(grade.grade)}>
                      {grade.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{grade.term}</TableCell>
                  <TableCell>{grade.date}</TableCell>
                  <TableCell>{grade.feedback}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
