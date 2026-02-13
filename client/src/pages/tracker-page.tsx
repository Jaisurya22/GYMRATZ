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
            const newWorkout: InsertWorkout = {
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
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Workout Tracker</h2>
                        <p className="text-muted-foreground">
                            Log your workouts and track your progress.
                        </p>
                    </div>
                    <Button onClick={() => createWorkoutMutation.mutate()} disabled={createWorkoutMutation.isPending}>
                        {createWorkoutMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        New Workout
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : workouts?.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <Dumbbell className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No workouts logged yet.</p>
                            <Button variant="outline" onClick={() => createWorkoutMutation.mutate()}>Start your first workout</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {workouts?.map((workout) => (
                            <Card key={workout.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {workout.name || "Untitled Workout"}
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground pt-2">
                                        {new Date(workout.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    {/* TODO: Add exercise summary here */}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
