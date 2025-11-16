"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Class {
  id: string;
  name: string;
  level: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  capacity: number;
  enrolled: number;
  schedule: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    teacherId: '',
    subject: '',
    capacity: '',
    schedule: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch classes
      const classSnapshot = await getDocs(collection(db, 'classes'));
      const classData: Class[] = [];
      classSnapshot.forEach((doc) => {
        classData.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(classData);

      // Fetch teachers
      const teacherSnapshot = await getDocs(collection(db, 'teachers'));
      const teacherData: Teacher[] = [];
      teacherSnapshot.forEach((doc) => {
        teacherData.push({ id: doc.id, ...doc.data() } as Teacher);
      });
      setTeachers(teacherData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const teacher = teachers.find(t => t.id === formData.teacherId);
      const classData = {
        ...formData,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : '',
        capacity: parseInt(formData.capacity),
        enrolled: editingClass?.enrolled || 0,
      };

      if (editingClass) {
        await updateDoc(doc(db, 'classes', editingClass.id), classData);
      } else {
        await addDoc(collection(db, 'classes'), classData);
      }
      
      resetForm();
      setOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving class:', err);
      setError('Failed to save class');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      level: classItem.level,
      teacherId: classItem.teacherId,
      subject: classItem.subject,
      capacity: classItem.capacity.toString(),
      schedule: classItem.schedule,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteDoc(doc(db, 'classes', id));
        fetchData();
      } catch (err) {
        console.error('Error deleting class:', err);
        setError('Failed to delete class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: '',
      teacherId: '',
      subject: '',
      capacity: '',
      schedule: '',
    });
    setEditingClass(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading classes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>Manage classes and assignments</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                <DialogDescription>
                  Enter class information below
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Form 1A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jhs1">JHS 1</SelectItem>
                      <SelectItem value="jhs2">JHS 2</SelectItem>
                      <SelectItem value="jhs3">JHS 3</SelectItem>
                      <SelectItem value="shs1">SHS 1</SelectItem>
                      <SelectItem value="shs2">SHS 2</SelectItem>
                      <SelectItem value="shs3">SHS 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherId">Assigned Teacher</Label>
                  <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 40"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g., Mon/Wed/Fri 9:00-10:00"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClass ? 'Update' : 'Add'} Class
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No classes created yet. Click "Add Class" to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">{classItem.name}</TableCell>
                  <TableCell>{classItem.subject}</TableCell>
                  <TableCell>{classItem.teacherName}</TableCell>
                  <TableCell>
                    {classItem.enrolled}/{classItem.capacity}
                  </TableCell>
                  <TableCell>{classItem.schedule}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(classItem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(classItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
