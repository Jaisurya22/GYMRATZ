import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Trophy, Loader2 } from "lucide-react";
import { Link } from "wouter";

type DashboardStats = {
    workoutsThisWeek: number;
    caloriesToday: number;
    streak: number;
    totalWorkouts: number;
    totalMeals: number;
    exerciseLogCount: number;
};

export default function Dashboard() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ["/api/dashboard/stats"],
    });

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-extrabold tracking-tight text-white">
                        Welcome back, <span className="text-primary italic">{user?.username}</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Here's your fitness overview for today.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Workouts This Week
                            </CardTitle>
                            <Activity className="h-5 w-5 text-primary drop-shadow-neon" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-white">{stats?.workoutsThisWeek ?? 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <span className="text-green-500 font-medium">{stats?.totalWorkouts ?? 0}</span> total workouts
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Calories Today
                            </CardTitle>
                            <Flame className="h-5 w-5 text-orange-500 drop-shadow-neon" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-white">{stats?.caloriesToday?.toLocaleString() ?? 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <span className="text-primary font-medium">{stats?.totalMeals ?? 0}</span> meals logged total
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Current Streak
                            </CardTitle>
                            <Trophy className="h-5 w-5 text-yellow-500 drop-shadow-neon" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-white">{stats?.streak ?? 0} Days</div>
                                    <p className="text-xs text-muted-foreground mt-1 text-primary">
                                        {(stats?.streak ?? 0) > 0 ? "Keep it up!" : "Start logging to build a streak"}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(stats?.totalWorkouts ?? 0) > 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                    <Activity className="h-10 w-10 text-primary opacity-40" />
                                    <p className="text-sm text-muted-foreground">
                                        <span className="text-primary font-bold">{stats?.exerciseLogCount ?? 0}</span> exercises logged across <span className="text-primary font-bold">{stats?.totalWorkouts ?? 0}</span> workouts
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                    <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                    <p className="text-sm text-muted-foreground">
                                        No workouts recorded yet.
                                        <br />
                                        <Link href="/tracker" className="text-primary font-medium cursor-pointer hover:underline">Start tracking now!</Link>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl">Nutrition Quick View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(stats?.caloriesToday ?? 0) > 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg">🍎</div>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="text-primary font-bold">{stats?.caloriesToday ?? 0}</span> calories logged today
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                    <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                                        <span className="text-lg">🍎</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        No meals logged today.
                                        <br />
                                        <Link href="/nutrition" className="text-primary font-medium cursor-pointer hover:underline">Log your meals</Link>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
