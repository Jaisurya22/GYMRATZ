import Layout from "@/components/layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Workout, InsertWorkout } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function TrackerPage() {
    const { toast } = useToast();

    const { data: workouts, isLoading } = useQuery<Workout[]>({
        queryKey: ["/api/workouts"],
    });

    const createWorkoutMutation = useMutation({
        mutationFn: async () => {
            const newWorkout: Omit<InsertWorkout, "userId"> = {
                date: new Date().toISOString(),
                name: `Workout ${new Date().toLocaleDateString()}`,
            };
            const res = await apiRequest("POST", "/api/workouts", newWorkout);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
            toast({
                title: "Workout created",
                description: "Start logging your exercises!",
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to create workout",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center border-b border-border/40 pb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent inline-block">
                            Workout Tracker
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Log your workouts and track your progress.
                        </p>
                    </div>
                    <Button
                        onClick={() => createWorkoutMutation.mutate()}
                        disabled={createWorkoutMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-neon transition-all hover:scale-105"
                    >
                        {createWorkoutMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        New Workout
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : workouts?.length === 0 ? (
                    <Card className="bg-card/40 border-dashed border-2 border-border/60">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Dumbbell className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-sm">
                                Start your journey by creating your first workout log. Track sets, reps, and weights to see your progress.
                            </p>
                            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-white" onClick={() => createWorkoutMutation.mutate()}>
                                Start your first workout
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {workouts?.map((workout) => (
                            <Card key={workout.id} className="group bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover cursor-pointer overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-bold truncate pr-4">
                                        {workout.name || "Untitled Workout"}
                                    </CardTitle>
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground pt-2 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {new Date(workout.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border/40">
                                        <span className="text-xs font-medium text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 block">
                                            View Details &rarr;
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
