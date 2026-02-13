import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Dumbbell, Utensils } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border/40 pb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent inline-block">
                            Profile
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Manage your account and view your stats.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                            <Separator className="bg-border/60" />
                            <div className="grid gap-4">
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="font-medium text-muted-foreground">User ID</span>
                                    <span className="font-mono bg-secondary px-2 py-1 rounded text-sm">{user.id}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="font-medium text-muted-foreground">Username</span>
                                    <span className="font-semibold">{user.username}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="font-medium text-muted-foreground">Membership Status</span>
                                    <span className="text-green-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                <span className="text-3xl font-extrabold text-foreground z-10">--</span>
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
                                <span className="text-3xl font-extrabold text-foreground z-10">--</span>
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
