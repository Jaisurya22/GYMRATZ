import { useState, useRef } from "react";
import Layout from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workout, Exercise, WorkoutExercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Plus, Calendar, Dumbbell, Trash2, X, Loader2,
  Sparkles, Clock, Target, RefreshCw, Zap, BarChart3, Timer,
  ChevronRight, GripVertical, Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QUICK_TIMES = [
  { min: 15, icon: Zap, label: "15 min" },
  { min: 30, icon: Clock, label: "30 min" },
  { min: 45, icon: Timer, label: "45 min" },
  { min: 60, icon: BarChart3, label: "60 min" },
];

const ALL_SPLITS = ["Push", "Pull", "Upper", "Lower", "Full Body"];
const ALL_MUSCLES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function TrackerPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showGen, setShowGen] = useState(false);
  const [genTarget, setGenTarget] = useState("Push");
  const [genTime, setGenTime] = useState([30]);
  const [addingEx, setAddingEx] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const genRef = useRef<HTMLDivElement>(null);

  const [exForm, setExForm] = useState({
    exerciseId: "", sets: "", reps: "", weight: "", rpe: "",
  });

  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: exList, refetch: refetchEx } = useQuery<WorkoutExercise[]>({
    queryKey: ["/api/workouts", expandedId, "exercises"],
    enabled: expandedId !== null,
    queryFn: async () => {
      const r = await apiRequest("GET", `/api/workouts/${expandedId}/exercises`);
      return r.json();
    },
  });

  // ── Create blank workout ──
  const createMut = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/workouts", {
        date: new Date().toISOString(),
        name: `Workout ${new Date().toLocaleDateString()}`,
      });
      return r.json() as Promise<Workout>;
    },
    onSuccess: (w) => {
      qc.setQueryData<Workout[]>(["/api/workouts"], (old) =>
        old ? [w, ...old] : [w]
      );
      setExpandedId(w.id);
      toast({ title: "Workout created" });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // ── Generate workout ──
  const genMut = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/workouts/generate", {
        muscleGroup: genTarget,
        timeMinutes: genTime[0],
      });
      return r.json() as Promise<{
        workoutId: number; name: string; date: string; exercises: any[];
        estimatedMinutes: number; totalVolume: number;
      }>;
    },
    onSuccess: (data) => {
      const newW: Workout = {
        id: data.workoutId, userId: 0, date: data.date, name: data.name,
      };
      qc.setQueryData<Workout[]>(["/api/workouts"], (old) =>
        old ? [newW, ...old] : [newW]
      );
      setExpandedId(data.workoutId);
      setShowGen(false);
      toast({
        title: `${data.estimatedMinutes} min workout ready`,
        description: `${data.exercises.length} exercises · ${data.totalVolume} total reps`,
      });
    },
    onError: (e: Error) => toast({ title: "Generation failed", description: e.message, variant: "destructive" }),
  });

  // ── Delete workout ──
  const delMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workouts/${id}`);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Workout[]>(["/api/workouts"], (old) =>
        old ? old.filter((w) => w.id !== id) : []
      );
      if (expandedId === id) { setExpandedId(null); setAddingEx(false); }
      setDelId(null);
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Deleted" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  // ── Regenerate (delete + create new) ──
  const reGenMut = useMutation({
    mutationFn: async ({ oldId, target, time }: { oldId: number; target: string; time: number }) => {
      await apiRequest("DELETE", `/api/workouts/${oldId}`);
      const r = await apiRequest("POST", "/api/workouts/generate", {
        muscleGroup: target, timeMinutes: time,
      });
      return r.json() as Promise<{
        workoutId: number; name: string; date: string; exercises: any[];
      }>;
    },
    onSuccess: (data) => {
      const newW: Workout = {
        id: data.workoutId, userId: 0, date: data.date, name: data.name,
      };
      qc.setQueryData<Workout[]>(["/api/workouts"], (old) => {
        if (!old) return [newW];
        const idx = old.findIndex((w) => w.id === data.workoutId);
        if (idx >= 0) { const c = [...old]; c[idx] = newW; return c; }
        return [newW, ...old.filter((w) => w.id !== data.workoutId)];
      });
      setExpandedId(data.workoutId);
      toast({ title: "Regenerated!", description: `${data.exercises.length} exercises` });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // ── Add exercise ──
  const addExMut = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", `/api/workouts/${expandedId}/exercises`, {
        exerciseId: Number(exForm.exerciseId),
        sets: Number(exForm.sets),
        reps: Number(exForm.reps),
        weight: exForm.weight ? Number(exForm.weight) : undefined,
        rpe: exForm.rpe ? Number(exForm.rpe) : undefined,
      });
      return r.json();
    },
    onSuccess: () => {
      refetchEx();
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setExForm({ exerciseId: "", sets: "", reps: "", weight: "", rpe: "" });
      setAddingEx(false);
      toast({ title: "Exercise added" });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // ── Delete exercise ──
  const delExMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workouts/exercises/${id}`);
    },
    onSuccess: () => {
      refetchEx();
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const volume = exList?.reduce((s, e) => s + e.sets * e.reps * Number(e.weight ?? 0), 0) ?? 0;
  const exName = (id: number) => exercises?.find((e) => e.id === id)?.name ?? `#${id}`;
  const exGroup = (id: number) => exercises?.find((e) => e.id === id)?.muscleGroup ?? "";

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent inline-block">
              Workout Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Science-based training · Log sets, reps & volume</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setShowGen(!showGen); setTimeout(() => genRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }}
              className={`${showGen ? "bg-purple-500/10 border-purple-500" : ""}`}>
              <Sparkles className={`h-4 w-4 mr-1.5 ${showGen ? "text-purple-400" : ""}`} />
              Generate
            </Button>
            <Button size="sm" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
              New
            </Button>
          </div>
        </div>

        {/* Generator Panel */}
        {showGen && (
          <div ref={genRef}>
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-600/15 via-purple-500/5 to-background shadow-lg shadow-purple-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    AI Science-Based Generator
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowGen(false)}><X className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">Hypertrophy-optimized · compound-first · RPE-guided · Indian-adjusted</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1.5"><Target className="h-3 w-3 text-purple-400" /> Target Split/Muscle</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SPLITS.map((s) => (
                        <button key={s} onClick={() => setGenTarget(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${genTarget === s ? "bg-purple-500/20 border-purple-400/50 text-purple-300" : "bg-background/50 border-border/40 text-muted-foreground hover:border-purple-500/30"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_MUSCLES.map((m) => (
                        <button key={m} onClick={() => setGenTarget(m)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${genTarget === m ? "bg-purple-500/15 border-purple-400/40 text-purple-300" : "bg-background/30 border-border/30 text-muted-foreground hover:border-purple-500/20"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1.5"><Clock className="h-3 w-3 text-purple-400" /> Duration: <span className="text-purple-300 font-bold">{genTime[0]} min</span></Label>
                    <div className="flex gap-1.5">
                      {QUICK_TIMES.map((q) => (
                        <button key={q.min} onClick={() => setGenTime([q.min])}
                          className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[11px] font-medium transition-all border ${genTime[0] === q.min ? "bg-purple-500/20 border-purple-400/50 text-purple-300" : "bg-background/50 border-border/30 text-muted-foreground hover:border-purple-500/30"}`}>
                          <q.icon className="h-3.5 w-3.5" />{q.label}
                        </button>
                      ))}
                    </div>
                    <Slider value={genTime} onValueChange={setGenTime} min={10} max={90} step={5} />
                  </div>
                </div>
                <Button onClick={() => genMut.mutate()} disabled={genMut.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 text-white shadow-lg shadow-purple-500/20 h-10">
                  {genMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {genMut.isPending ? "Generating..." : "Generate Optimal Workout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workout list */}
        {!workouts || workouts.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-card/30">
            <CardContent className="flex flex-col items-center py-20">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/15 to-purple-500/15 flex items-center justify-center mb-5">
                <Dumbbell className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-1">No workouts yet</h2>
              <p className="text-muted-foreground text-sm mb-7 text-center max-w-sm">
                Generate a science-optimized workout or create a blank one to start tracking.
              </p>
              <div className="flex gap-3">
                <Button className="bg-gradient-to-r from-purple-600 to-primary text-white shadow-lg" onClick={() => setShowGen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Workout
                </Button>
                <Button variant="outline" onClick={() => createMut.mutate()}>
                  <Plus className="h-4 w-4 mr-2" /> Start Empty
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => {
              const isExpanded = expandedId === w.id;
              const isGenerated = w.name?.includes("min");
              return (
                <div key={w.id}>
                  {/* Workout Card */}
                  <div
                    onClick={() => { setExpandedId(isExpanded ? null : w.id); setAddingEx(false); }}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200
                      ${isExpanded
                        ? "bg-card border-primary/40 shadow-md shadow-primary/5"
                        : "bg-card/60 border-border/40 hover:border-primary/30 hover:bg-card/80 hover:shadow-sm"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isExpanded ? "bg-primary/20" : "bg-secondary"}`}>
                        <Dumbbell className={`h-5 w-5 ${isExpanded ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{w.name || "Untitled"}</span>
                          {isGenerated && (
                            <span className="text-[10px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">AI</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          {isGenerated && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="text-purple-400/60">{w.name?.split(" - ")[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDelId(w.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {delId === w.id && (
                    <div className="flex items-center justify-between px-4 py-2.5 mt-1 rounded-lg bg-destructive/5 border border-destructive/30 text-sm">
                      <span className="text-destructive text-xs">Delete this workout?</span>
                      <div className="flex gap-2">
                        <button className="text-xs text-muted-foreground hover:text-foreground px-2" onClick={() => setDelId(null)}>Cancel</button>
                        <button className="text-xs text-destructive font-medium px-2 py-0.5 rounded hover:bg-destructive/10"
                          onClick={() => delMut.mutate(w.id)}>
                          {delMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded exercises */}
                  {isExpanded && (
                    <div className="mt-1 p-4 rounded-xl bg-card/30 border border-primary/10">
                      {!exList ? (
                        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                      ) : exList.length === 0 ? (
                        <div className="text-center py-8">
                          <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No exercises yet</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">Add exercises to start tracking</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 pb-1.5 border-b border-border/20">
                            <span className="flex-1">Exercise</span>
                            <span className="w-9 text-center">Sets</span>
                            <span className="w-9 text-center">Reps</span>
                            <span className="w-14 text-center">Weight</span>
                            <span className="w-9 text-center">RPE</span>
                            <span className="w-6" />
                          </div>
                          {exList.map((e, i) => (
                            <div key={e.id}
                              className="flex items-center gap-1.5 p-2 rounded-lg bg-background/40 border border-border/20 hover:border-primary/30 transition-all group">
                              <div className="flex-1 flex items-center gap-2 min-w-0">
                                <span className="text-[10px] text-muted-foreground font-mono w-3.5 shrink-0">{i + 1}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{exName(e.exerciseId)}</p>
                                  <p className="text-[10px] text-muted-foreground/60">{exGroup(e.exerciseId)}</p>
                                </div>
                              </div>
                              <span className="w-9 text-center text-sm font-bold bg-primary/5 rounded py-0.5">{e.sets}</span>
                              <span className="w-9 text-center text-sm font-bold bg-primary/5 rounded py-0.5">{e.reps}</span>
                              <span className="w-14 text-center text-xs font-mono">{e.weight ? `${e.weight}kg` : "BW"}</span>
                              <span className="w-9 text-center text-[10px] text-muted-foreground bg-muted/20 rounded py-0.5">{e.rpe ?? "--"}</span>
                              <button className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => delExMut.mutate(e.id)}>
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2.5 border-t border-border/20 mt-2">
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5 text-primary" /> Volume: <strong className="text-primary">{volume.toLocaleString()} kg</strong></span>
                              <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5 text-green-500" /> {exList.length} exercises</span>
                            </div>
                            {isGenerated && (
                              <button onClick={() => {
                                const target = w.name?.split(" - ")[0] || "Full Body";
                                const time = parseInt(w.name?.match(/(\d+)min/)?.[1] || "30");
                                reGenMut.mutate({ oldId: w.id, target, time });
                              }} disabled={reGenMut.isPending}
                                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium px-2 py-1 rounded hover:bg-purple-500/10 transition-all">
                                {reGenMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                Regenerate
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Add exercise form */}
                      {addingEx ? (
                        <div className="mt-3 p-3 rounded-xl bg-background/60 border border-primary/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold flex items-center gap-1.5"><Plus className="h-4 w-4 text-primary" />Add Exercise</span>
                            <button className="text-muted-foreground hover:text-foreground" onClick={() => setAddingEx(false)}><X className="h-4 w-4" /></button>
                          </div>
                          <div>
                            <Label className="text-xs">Exercise</Label>
                            <Select value={exForm.exerciseId} onValueChange={(v) => setExForm({ ...exForm, exerciseId: v })}>
                              <SelectTrigger className="bg-background/50 h-9 text-sm mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                              <SelectContent>
                                {exercises?.map((ex) => (
                                  <SelectItem key={ex.id} value={String(ex.id)}>
                                    {ex.name} <span className="text-muted-foreground">({ex.muscleGroup})</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div><Label className="text-[10px]">Sets</Label><Input type="number" placeholder="3" value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: e.target.value })} className="bg-background/50 h-8 text-sm mt-0.5" /></div>
                            <div><Label className="text-[10px]">Reps</Label><Input type="number" placeholder="10" value={exForm.reps} onChange={(e) => setExForm({ ...exForm, reps: e.target.value })} className="bg-background/50 h-8 text-sm mt-0.5" /></div>
                            <div><Label className="text-[10px]">Weight</Label><Input type="number" step="0.5" placeholder="60" value={exForm.weight} onChange={(e) => setExForm({ ...exForm, weight: e.target.value })} className="bg-background/50 h-8 text-sm mt-0.5" /></div>
                            <div><Label className="text-[10px]">RPE</Label><Input type="number" step="0.5" min="1" max="10" placeholder="7" value={exForm.rpe} onChange={(e) => setExForm({ ...exForm, rpe: e.target.value })} className="bg-background/50 h-8 text-sm mt-0.5" /></div>
                          </div>
                          <Button size="sm" className="w-full h-9" onClick={() => addExMut.mutate()}
                            disabled={addExMut.isPending || !exForm.exerciseId || !exForm.sets || !exForm.reps}>
                            {addExMut.isPending ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Plus className="h-3 w-3 mr-2" />}
                            Add
                          </Button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingEx(true)}
                          className="mt-3 w-full py-2 rounded-lg border border-dashed border-border/40 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Add Exercise
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
