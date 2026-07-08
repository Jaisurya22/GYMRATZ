import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Dumbbell, Utensils, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
    id: number;
    username: string;
    weight: string | null;
    height: string | null;
    age: number | null;
    gender: string | null;
    activityLevel: string | null;
    calorieTarget: number | null;
    proteinTarget: number | null;
    carbsTarget: number | null;
    fatTarget: number | null;
};

type DashboardStats = {
    workoutsThisWeek: number;
    caloriesToday: number;
    streak: number;
    totalWorkouts: number;
    totalMeals: number;
    exerciseLogCount: number;
};

const ACTIVITY_LEVELS = [
    { value: "sedentary", label: "Sedentary (little/no exercise)" },
    { value: "light", label: "Light (1-3 days/week)" },
    { value: "moderate", label: "Moderate (3-5 days/week)" },
    { value: "active", label: "Active (6-7 days/week)" },
    { value: "very_active", label: "Very Active (twice/day)" },
] as const;

const profileSchema = z.object({
    weight: z.coerce.number().min(20, "Min 20 kg").max(300, "Max 300 kg").optional().or(z.literal("")),
    height: z.coerce.number().min(100, "Min 100 cm").max(250, "Max 250 cm").optional().or(z.literal("")),
    age: z.coerce.number().min(10, "Min 10 years").max(120, "Max 120 years").optional().or(z.literal("")),
    gender: z.enum(["male", "female"]).optional(),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
});

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
        queryKey: ["/api/user/profile"],
    });

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ["/api/dashboard/stats"],
    });

    const defaultValues: z.infer<typeof profileSchema> = {
        weight: profile?.weight ? Number(profile.weight) : "",
        height: profile?.height ? Number(profile.height) : "",
        age: profile?.age ?? "",
        gender: (profile?.gender as "male" | "female") ?? undefined,
        activityLevel: (profile?.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active") ?? undefined,
    };

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        values: defaultValues,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (values: z.infer<typeof profileSchema>) => {
            const payload: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(values)) {
                if (val !== undefined && val !== "") {
                    payload[key] = val;
                }
            }
            const res = await apiRequest("PATCH", "/api/user/profile", payload);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
            toast({ title: "Profile updated", description: "Your body stats have been saved." });
        },
        onError: (error) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        },
    });

    if (!user) return null;

    const bmr = profile?.weight && profile?.height && profile?.age && profile?.gender
        ? Math.round(
            10 * Number(profile.weight) + 6.25 * Number(profile.height) - 5 * Number(profile.age) + (profile.gender === "male" ? 5 : -161)
          ) * 0.95
        : null;

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border/40 pb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent inline-block">
                            Profile
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Manage your body stats and view your progress.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                            <CardHeader>
                                <CardTitle>Account Info</CardTitle>
                                <CardDescription>Your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-6 p-4 bg-background/50 rounded-xl border border-border/50">
                                    <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-2xl font-bold tracking-tight">{user.username}</h3>
                                        <p className="text-sm text-primary font-medium">Gym Rat Member</p>
                                        <p className="text-xs text-muted-foreground mt-1">Joined {new Date().getFullYear()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                            <CardHeader>
                                <CardTitle>Body Stats</CardTitle>
                                <CardDescription>Set your metrics for accurate calorie calculations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {profileLoading ? (
                                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                ) : (
                                    <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input id="weight" type="number" step="0.1" placeholder="e.g. 72" {...form.register("weight")} className="bg-background/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="height">Height (cm)</Label>
                                                <Input id="height" type="number" step="0.1" placeholder="e.g. 175" {...form.register("height")} className="bg-background/50" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="age">Age</Label>
                                                <Input id="age" type="number" placeholder="e.g. 25" {...form.register("age")} className="bg-background/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <Select onValueChange={(val) => form.setValue("gender", val as "male" | "female")} value={form.watch("gender")}>
                                                    <SelectTrigger className="bg-background/50">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Activity Level</Label>
                                            <Select onValueChange={(val) => form.setValue("activityLevel", val as typeof ACTIVITY_LEVELS[number]["value"])} value={form.watch("activityLevel")}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Select activity level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ACTIVITY_LEVELS.map((level) => (
                                                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
                                            {updateProfileMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-4 w-4" />
                                            )}
                                            Save Body Stats
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {profile?.calorieTarget && (
                            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                                <CardHeader>
                                    <CardTitle>Daily Targets</CardTitle>
                                    <CardDescription>Auto-calculated from your body stats</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 text-center">
                                            <p className="text-xs text-muted-foreground">Calories</p>
                                            <p className="text-2xl font-bold text-primary">{profile.calorieTarget}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                                            <p className="text-xs text-muted-foreground">Protein</p>
                                            <p className="text-2xl font-bold text-blue-500">{profile.proteinTarget}g</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-500/10 text-center">
                                            <p className="text-xs text-muted-foreground">Carbs</p>
                                            <p className="text-2xl font-bold text-green-500">{profile.carbsTarget}g</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                                            <p className="text-xs text-muted-foreground">Fat</p>
                                            <p className="text-2xl font-bold text-yellow-500">{profile.fatTarget}g</p>
                                        </div>
                                    </div>
                                    {bmr && (
                                        <p className="text-xs text-muted-foreground mt-3 text-center">
                                            BMR: {Math.round(bmr)} kcal/day (Indian-adjusted) | TDEE: {profile.calorieTarget} kcal/day
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card className="bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>Your fitness journey at a glance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-6 border border-border/50 rounded-xl bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center space-x-4 z-10">
                                    <div className="p-3 bg-primary/20 rounded-full text-primary">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Workouts Logged</p>
                                        <p className="text-xs text-muted-foreground">Total sessions completed</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-extrabold text-foreground z-10">
                                    {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalWorkouts ?? "--"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-6 border border-border/50 rounded-xl bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center space-x-4 z-10">
                                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                                        <Utensils className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Meals Tracked</p>
                                        <p className="text-xs text-muted-foreground">Total nutritional entries</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-extrabold text-foreground z-10">
                                    {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalMeals ?? "--"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-6 border border-border/50 rounded-xl bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center space-x-4 z-10">
                                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-500">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Exercises Logged</p>
                                        <p className="text-xs text-muted-foreground">Total sets recorded</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-extrabold text-foreground z-10">
                                    {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.exerciseLogCount ?? "--"}
                                </span>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                                <p className="text-sm text-primary font-semibold">Keep pushing! You're doing great. 💪</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}