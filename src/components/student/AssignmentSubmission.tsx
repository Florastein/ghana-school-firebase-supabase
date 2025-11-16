"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { Upload, File, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  maxScore: number;
  teacherName: string;
  status?: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  fileUrl?: string;
}

export default function AssignmentSubmission() {
  const { user, userProfile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, 'assignments'));
      const querySnapshot = await getDocs(q);
      const assignmentData: Assignment[] = [];
      querySnapshot.forEach((doc) => {
        assignmentData.push({ id: doc.id, ...doc.data() } as Assignment);
      });
      setAssignments(assignmentData);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let fileUrl = '';

      // Upload file to Supabase if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.uid}-${selectedAssignment.id}-${Date.now()}.${fileExt}`;
        const filePath = `assignments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('school-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('school-files')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      // Save submission to Firestore
      await addDoc(collection(db, 'submissions'), {
        assignmentId: selectedAssignment.id,
        studentId: user.uid,
        studentName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        submissionText,
        fileUrl,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      });

      setSuccess('Assignment submitted successfully!');
      setSubmissionText('');
      setFile(null);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Submitted
          </Badge>
        );
      case 'graded':
        return (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Graded
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {selectedAssignment ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit Assignment</CardTitle>
            <CardDescription>{selectedAssignment.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Assignment Details</Label>
                <p className="text-sm text-muted-foreground">{selectedAssignment.description}</p>
                <p className="text-sm">
                  <strong>Subject:</strong> {selectedAssignment.subject}
                </p>
                <p className="text-sm">
                  <strong>Due Date:</strong> {selectedAssignment.dueDate}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionText">Your Answer</Label>
                <Textarea
                  id="submissionText"
                  rows={6}
                  placeholder="Write your submission here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attach File (Optional)</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAssignment(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>View and submit your assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>
                            {assignment.subject} • Due: {assignment.dueDate}
                          </CardDescription>
                        </div>
                        {getStatusBadge(assignment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{assignment.description}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                          disabled={assignment.status === 'submitted' || assignment.status === 'graded'}
                        >
                          {assignment.status === 'submitted' || assignment.status === 'graded' 
                            ? 'Already Submitted' 
                            : 'Submit Assignment'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
