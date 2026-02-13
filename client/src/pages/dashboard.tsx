import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Trophy } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();

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
                            <div className="text-3xl font-bold text-white">3</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500 font-medium">+1</span> from last week
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Calories Burned
                            </CardTitle>
                            <Flame className="h-5 w-5 text-orange-500 drop-shadow-neon" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">1,250</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500 font-medium">+15%</span> from last week
                            </p>
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
                            <div className="text-3xl font-bold text-white">5 Days</div>
                            <p className="text-xs text-muted-foreground mt-1 text-primary">
                                Keep it up!
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                <p className="text-sm text-muted-foreground">
                                    No recent workouts recorded.
                                    <br />
                                    <span className="text-primary font-medium cursor-pointer hover:underline">Start tracking now!</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl">Nutrition Quick View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                                    <span className="text-lg">🍎</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    You haven't logged any meals today.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
