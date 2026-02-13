import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();

    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

            <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10 animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center space-y-2 pb-6 border-b border-border/40">
                    <div className="mx-auto w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mb-2 shadow-neon">
                        <span className="text-2xl">💪</span>
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tighter">
                        GYM <span className="text-primary italic">RATZ</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                        Your personal AI-powered fitness companion
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="login" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-background/50 border border-border/50">
                            <TabsTrigger
                                value="login"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                            >
                                Register
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your username" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 shadow-neon font-bold mt-2"
                                        disabled={loginMutation.isPending}
                                    >
                                        {loginMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Login to Dashboard
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Choose a username" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Choose a strong password" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 shadow-neon font-bold mt-2"
                                        disabled={registerMutation.isPending}
                                    >
                                        {registerMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Create Account
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
