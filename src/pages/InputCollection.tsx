import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimetableStore, Teacher, Subject, Classroom } from '@/store/timetableStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Clock, Users, BookOpen, Building2, Plus, Trash2, ArrowRight, 
  GraduationCap, Calendar, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const InputCollection = () => {
  const navigate = useNavigate();
  const {
    teachers,
    subjects,
    classrooms,
    collegeTiming,
    workingDays,
    addTeacher,
    removeTeacher,
    addSubject,
    removeSubject,
    addClassroom,
    removeClassroom,
    setCollegeTiming,
    setWorkingDays,
  } = useTimetableStore();

  // Teacher form
  const [teacherName, setTeacherName] = useState('');
  const [teacherDept, setTeacherDept] = useState('');

  // Subject form
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacherId, setSubjectTeacherId] = useState('');
  const [subjectPeriods, setSubjectPeriods] = useState(3);
  const [isLab, setIsLab] = useState(false);

  // Classroom form
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(40);
  const [isLabRoom, setIsLabRoom] = useState(false);

  const handleAddTeacher = () => {
    if (!teacherName.trim()) {
      toast.error('Please enter teacher name');
      return;
    }
    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name: teacherName.trim(),
      department: teacherDept.trim(),
      subjects: [],
    };
    addTeacher(newTeacher);
    setTeacherName('');
    setTeacherDept('');
    toast.success('Teacher added successfully');
  };

  const handleAddSubject = () => {
    if (!subjectName.trim()) {
      toast.error('Please enter subject name');
      return;
    }
    if (!subjectTeacherId) {
      toast.error('Please select a teacher');
      return;
    }
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectName.trim(),
      teacherId: subjectTeacherId,
      periodsPerWeek: isLab ? 2 : subjectPeriods,
      isLab,
    };
    addSubject(newSubject);
    setSubjectName('');
    setSubjectTeacherId('');
    setSubjectPeriods(3);
    setIsLab(false);
    toast.success('Subject added successfully');
  };

  const handleAddClassroom = () => {
    if (!roomName.trim()) {
      toast.error('Please enter room name');
      return;
    }
    const newClassroom: Classroom = {
      id: crypto.randomUUID(),
      name: roomName.trim(),
      capacity: roomCapacity,
      isLab: isLabRoom,
    };
    addClassroom(newClassroom);
    setRoomName('');
    setRoomCapacity(40);
    setIsLabRoom(false);
    toast.success('Classroom added successfully');
  };

  const handleProceed = () => {
    if (teachers.length === 0) {
      toast.error('Please add at least one teacher');
      return;
    }
    if (subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }
    if (classrooms.length === 0) {
      toast.error('Please add at least one classroom');
      return;
    }
    navigate('/rules');
  };

  const getTeacherName = (id: string) => {
    return teachers.find(t => t.id === id)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground">Input Collection</h1>
                <p className="text-sm text-muted-foreground">Step 1 of 3</p>
              </div>
            </div>
            <Button onClick={handleProceed}>
              Proceed to Rules
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* College Timing */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle className="font-display">College Timing</CardTitle>
              </div>
              <CardDescription>Set your institution's operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={collegeTiming.startTime}
                    onChange={(e) => setCollegeTiming({ ...collegeTiming, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={collegeTiming.endTime}
                    onChange={(e) => setCollegeTiming({ ...collegeTiming, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Short Break (min)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Break between periods</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    min={5}
                    max={30}
                    value={collegeTiming.shortBreakDuration}
                    onChange={(e) => setCollegeTiming({ ...collegeTiming, shortBreakDuration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Long Break (min)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Lunch/recess break</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    min={15}
                    max={90}
                    value={collegeTiming.longBreakDuration}
                    onChange={(e) => setCollegeTiming({ ...collegeTiming, longBreakDuration: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periods Before Long Break</Label>
                  <Input
                    type="number"
                    min={2}
                    max={6}
                    value={collegeTiming.periodsBeforeLongBreak}
                    onChange={(e) => setCollegeTiming({ ...collegeTiming, periodsBeforeLongBreak: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <Select value={workingDays.toString()} onValueChange={(v) => setWorkingDays(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Days (Mon-Fri)</SelectItem>
                      <SelectItem value="6">6 Days (Mon-Sat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="font-display">Teachers</CardTitle>
              </div>
              <CardDescription>Add faculty members ({teachers.length} added)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teacher Name</Label>
                  <Input
                    placeholder="Dr. John Smith"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    placeholder="Computer Science"
                    value={teacherDept}
                    onChange={(e) => setTeacherDept(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddTeacher} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
              
              {teachers.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.department}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeTeacher(teacher.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle className="font-display">Subjects</CardTitle>
              </div>
              <CardDescription>Add subjects with teacher assignments ({subjects.length} added)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="Data Structures"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Teacher</Label>
                  <Select value={subjectTeacherId} onValueChange={setSubjectTeacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periods per Week</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={subjectPeriods}
                    onChange={(e) => setSubjectPeriods(parseInt(e.target.value))}
                    disabled={isLab}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch id="is-lab" checked={isLab} onCheckedChange={setIsLab} />
                  <Label htmlFor="is-lab">Lab Subject (2 consecutive periods)</Label>
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
              
              {subjects.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {subject.name} {subject.isLab && <span className="text-accent">(Lab)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTeacherName(subject.teacherId)} • {subject.periodsPerWeek} periods/week
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classrooms */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle className="font-display">Classrooms & Labs</CardTitle>
              </div>
              <CardDescription>Add available rooms ({classrooms.length} added)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Name</Label>
                  <Input
                    placeholder="Room 101"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min={10}
                    max={200}
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is-lab-room" checked={isLabRoom} onCheckedChange={setIsLabRoom} />
                <Label htmlFor="is-lab-room">This is a Laboratory</Label>
              </div>
              <Button onClick={handleAddClassroom} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
              
              {classrooms.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {classrooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {room.name} {room.isLab && <span className="text-accent">(Lab)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">Capacity: {room.capacity}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeClassroom(room.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary & Proceed */}
        <div className="mt-8">
          <Card className="shadow-card bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{teachers.length}</p>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{subjects.length}</p>
                    <p className="text-sm text-muted-foreground">Subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{classrooms.length}</p>
                    <p className="text-sm text-muted-foreground">Rooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{workingDays}</p>
                    <p className="text-sm text-muted-foreground">Days/Week</p>
                  </div>
                </div>
                <Button size="lg" onClick={handleProceed} className="shadow-glow">
                  <Calendar className="w-4 h-4 mr-2" />
                  Configure Rules
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InputCollection;
