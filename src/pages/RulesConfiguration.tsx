import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '@/store/timetableStore';
import { generateTimetable } from '@/algorithm/timetableGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Settings, ArrowRight, ArrowLeft, Zap, ShieldCheck, 
  Users, BookOpen, GraduationCap, AlertTriangle
} from 'lucide-react';

const RulesConfiguration = () => {
  const navigate = useNavigate();
  const {
    teachers,
    subjects,
    classrooms,
    collegeTiming,
    workingDays,
    rules,
    setRules,
    setGeneratedTimetable,
    setIsGenerating,
  } = useTimetableStore();

  const handleGenerate = async () => {
    if (teachers.length === 0 || subjects.length === 0 || classrooms.length === 0) {
      toast.error('Please add all required data first');
      navigate('/input');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating optimal timetable...', { id: 'generating' });

    // Simulate async operation
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
          toast.success('Perfect clash-free timetable generated!', { id: 'generating' });
        } else {
          toast.warning(`Timetable generated with ${timetable.conflicts.length} conflicts`, { id: 'generating' });
        }
        
        navigate('/output');
      } catch (error) {
        setIsGenerating(false);
        toast.error('Failed to generate timetable', { id: 'generating' });
      }
    }, 1500);
  };

  const ruleCards = [
    {
      icon: Users,
      title: 'Teacher Constraints',
      description: 'Control teacher workload and schedule',
      rules: [
        {
          key: 'noTeacherContinuousPeriods',
          label: 'Avoid continuous periods for teachers',
          description: 'Prevent teachers from having more than 2 back-to-back classes',
          type: 'switch',
        },
        {
          key: 'maxClassesPerTeacherPerDay',
          label: 'Max classes per teacher/day',
          description: 'Maximum number of periods a teacher can take in a day',
          type: 'number',
          min: 1,
          max: 10,
        },
      ],
    },
    {
      icon: BookOpen,
      title: 'Subject Distribution',
      description: 'Optimize how subjects are distributed',
      rules: [
        {
          key: 'labsOncePerWeek',
          label: 'Labs only once per week',
          description: 'Ensure lab sessions are scheduled only once weekly',
          type: 'switch',
        },
        {
          key: 'avoidHeavySubjectsAdjacent',
          label: 'Avoid heavy subjects adjacently',
          description: 'Prevent scheduling difficult subjects back-to-back',
          type: 'switch',
        },
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Workload Balance',
      description: 'Ensure fair distribution of work',
      rules: [
        {
          key: 'balancedWorkload',
          label: 'Balanced workload distribution',
          description: 'Distribute teacher workload evenly across the week',
          type: 'switch',
        },
        {
          key: 'dailyMaxPeriodsPerClass',
          label: 'Max periods per day',
          description: 'Maximum number of periods per day for a class',
          type: 'number',
          min: 4,
          max: 10,
        },
      ],
    },
  ];

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
                <h1 className="font-display font-bold text-foreground">Rules Configuration</h1>
                <p className="text-sm text-muted-foreground">Step 2 of 3</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/input')}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Input
              </Button>
              <Button onClick={handleGenerate} className="shadow-glow">
                <Zap className="mr-2 w-4 h-4" />
                Generate Timetable
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hard Constraints Notice */}
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Hard Constraints (Always Enforced)</p>
                <p className="text-sm text-muted-foreground">
                  • No teacher can be in two places at once &nbsp;
                  • No room can be double-booked &nbsp;
                  • Teacher must be assigned to their subjects only
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ruleCards.map((card) => (
            <Card key={card.title} className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <card.icon className="w-5 h-5 text-primary" />
                  <CardTitle className="font-display text-lg">{card.title}</CardTitle>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {card.rules.map((rule) => (
                  <div key={rule.key} className="space-y-2">
                    {rule.type === 'switch' ? (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">{rule.label}</Label>
                          <p className="text-xs text-muted-foreground">{rule.description}</p>
                        </div>
                        <Switch
                          checked={rules[rule.key as keyof typeof rules] as boolean}
                          onCheckedChange={(checked) =>
                            setRules({ ...rules, [rule.key]: checked })
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="font-medium">{rule.label}</Label>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                        <Input
                          type="number"
                          min={rule.min}
                          max={rule.max}
                          value={rules[rule.key as keyof typeof rules] as number}
                          onChange={(e) =>
                            setRules({ ...rules, [rule.key]: parseInt(e.target.value) })
                          }
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle className="font-display">Configuration Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{teachers.length}</p>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{subjects.length}</p>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{classrooms.length}</p>
                  <p className="text-sm text-muted-foreground">Rooms</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{workingDays}</p>
                  <p className="text-sm text-muted-foreground">Days/Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="mt-8 text-center">
          <Button size="lg" onClick={handleGenerate} className="px-12 shadow-glow">
            <Zap className="mr-2 w-5 h-5" />
            Generate Optimal Timetable
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Our AI algorithm will create a conflict-free schedule optimized for your constraints
          </p>
        </div>
      </main>
    </div>
  );
};

export default RulesConfiguration;
