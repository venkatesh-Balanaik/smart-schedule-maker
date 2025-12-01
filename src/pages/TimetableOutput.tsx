import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '@/store/timetableStore';
import { generateTimetable } from '@/algorithm/timetableGenerator';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Download, RefreshCw, ArrowLeft, FileText, FileSpreadsheet, 
  GraduationCap, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const subjectColors: { [key: number]: string } = {
  1: 'bg-subject-1',
  2: 'bg-subject-2',
  3: 'bg-subject-3',
  4: 'bg-subject-4',
  5: 'bg-subject-5',
  6: 'bg-subject-6',
  7: 'bg-subject-7',
  8: 'bg-subject-8',
};

const TimetableOutput = () => {
  const navigate = useNavigate();
  const {
    teachers,
    subjects,
    classrooms,
    collegeTiming,
    workingDays,
    rules,
    generatedTimetable,
    setGeneratedTimetable,
    setIsGenerating,
  } = useTimetableStore();

  const handleRegenerate = () => {
    setIsGenerating(true);
    toast.loading('Regenerating timetable...', { id: 'regenerating' });

    setTimeout(() => {
      try {
        const timetable = generateTimetable(
          teachers,
          subjects,
          classrooms,
          collegeTiming,
          workingDays,
          rules
        );
        setGeneratedTimetable(timetable);
        setIsGenerating(false);
        
        if (timetable.conflicts.length === 0) {
          toast.success('New clash-free timetable generated!', { id: 'regenerating' });
        } else {
          toast.warning(`Timetable generated with ${timetable.conflicts.length} conflicts`, { id: 'regenerating' });
        }
      } catch (error) {
        setIsGenerating(false);
        toast.error('Failed to regenerate timetable', { id: 'regenerating' });
      }
    }, 1000);
  };

  const handleExportPDF = () => {
    if (!generatedTimetable) return;
    exportToPDF(generatedTimetable, 'Academic_Timetable');
    toast.success('PDF exported successfully');
  };

  const handleExportExcel = () => {
    if (!generatedTimetable) return;
    exportToExcel(generatedTimetable, 'Academic_Timetable');
    toast.success('Excel file exported successfully');
  };

  if (!generatedTimetable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">No Timetable Generated</h2>
          <p className="text-muted-foreground mb-4">
            Please complete the input and rules configuration first.
          </p>
          <Button onClick={() => navigate('/input')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go to Input
          </Button>
        </Card>
      </div>
    );
  }

  // Get unique subjects for legend
  const uniqueSubjects = new Map<string, { name: string; color: number }>();
  for (const day of generatedTimetable.days) {
    for (const slot of generatedTimetable.grid[day] || []) {
      if (slot.subjectId && !uniqueSubjects.has(slot.subjectId)) {
        uniqueSubjects.set(slot.subjectId, { name: slot.subject, color: slot.color });
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground">Generated Timetable</h1>
                <p className="text-sm text-muted-foreground">Step 3 of 3</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => navigate('/rules')}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Rules
              </Button>
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="mr-2 w-4 h-4" />
                Regenerate
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 w-4 h-4" />
                Export PDF
              </Button>
              <Button onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 w-4 h-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status */}
        <div className="mb-6">
          {generatedTimetable.conflicts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-foreground">Perfect clash-free timetable generated!</p>
                <p className="text-sm text-muted-foreground">All constraints have been satisfied.</p>
              </div>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg cursor-pointer hover:bg-warning/15 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      Timetable generated with {generatedTimetable.conflicts.length} conflict(s)
                    </p>
                    <p className="text-sm text-muted-foreground">Click to view details</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scheduling Conflicts</DialogTitle>
                  <DialogDescription>
                    The following conflicts were detected:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {generatedTimetable.conflicts.map((conflict, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      {conflict}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Legend */}
        <Card className="mb-6 shadow-card">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4" />
              Subject Legend
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-3">
              {Array.from(uniqueSubjects.values()).map((subject) => (
                <div key={subject.name} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${subjectColors[subject.color]} opacity-80`} />
                  <span className="text-sm">{subject.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 border-b border-border text-left font-semibold text-sm">
                      Period
                    </th>
                    {generatedTimetable.days.map((day) => (
                      <th key={day} className="p-3 border-b border-border text-center font-semibold text-sm">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generatedTimetable.periods.map((period, periodIndex) => {
                    const isLongBreak = generatedTimetable.grid[generatedTimetable.days[0]]?.[periodIndex]?.isLongBreak;
                    
                    return (
                      <>
                        <tr key={period} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 border-b border-border bg-muted/50 font-medium text-sm whitespace-nowrap">
                            {period}
                          </td>
                          {generatedTimetable.days.map((day) => {
                            const slot = generatedTimetable.grid[day]?.[periodIndex];
                            
                            return (
                              <td key={`${day}-${periodIndex}`} className="p-2 border-b border-border">
                                {slot && slot.subject ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div 
                                        className={`p-3 rounded-lg ${subjectColors[slot.color]} text-primary-foreground cursor-pointer transition-transform hover:scale-105`}
                                      >
                                        <p className="font-semibold text-sm truncate">{slot.subject}</p>
                                        <p className="text-xs opacity-90 truncate">{slot.teacher}</p>
                                        <p className="text-xs opacity-75 truncate">{slot.room}</p>
                                        {slot.isLab && (
                                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                                            LAB
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p><strong>Subject:</strong> {slot.subject}</p>
                                      <p><strong>Teacher:</strong> {slot.teacher}</p>
                                      <p><strong>Room:</strong> {slot.room}</p>
                                      {slot.isLab && <p><strong>Type:</strong> Laboratory</p>}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <div className="p-3 text-center text-muted-foreground text-sm">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {isLongBreak && (
                          <tr key={`break-${periodIndex}`}>
                            <td colSpan={generatedTimetable.days.length + 1} className="p-2 bg-muted/50 border-b border-border">
                              <div className="text-center text-sm font-medium text-muted-foreground">
                                🍽️ LUNCH BREAK
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={handleRegenerate}>
            <RefreshCw className="mr-2 w-5 h-5" />
            Generate New Variation
          </Button>
          <Button size="lg" onClick={handleExportPDF}>
            <Download className="mr-2 w-5 h-5" />
            Download Timetable
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TimetableOutput;
