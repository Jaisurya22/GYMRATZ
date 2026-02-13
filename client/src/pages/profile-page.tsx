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
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your account and view your stats.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Info</CardTitle>
                            <CardDescription>Your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-medium">{user.username}</h3>
                                    <p className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="font-sm font-medium">User ID</span>
                                    <span className="text-muted-foreground">{user.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-sm font-medium">Username</span>
                                    <span className="text-muted-foreground">{user.username}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>Your app usage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Dumbbell className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Workouts Logged</p>
                                        <p className="text-sm text-muted-foreground">Total sessions</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold">--</span>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-green-500/10 rounded-full">
                                        <Utensils className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Meals Tracked</p>
                                        <p className="text-sm text-muted-foreground">Total entries</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold">--</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
