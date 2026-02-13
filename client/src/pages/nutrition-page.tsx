import Layout from "@/components/layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FoodLog, InsertFoodLog } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Schema for the form, excluding userId and id which are handled by backend/auto-gen
const formSchema = z.object({
    foodName: z.string().min(1, "Food name is required"),
    calories: z.coerce.number().min(0, "Calories must be positive"),
    protein: z.coerce.number().min(0, "Protein must be positive"),
    carbs: z.coerce.number().min(0, "Carbs must be positive"),
    fat: z.coerce.number().min(0, "Fat must be positive"),
    mealType: z.string().default("Snack"),
});

export default function NutritionPage() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            foodName: "",
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            mealType: "Snack"
        },
    });

    const { data: foodLogs, isLoading } = useQuery<FoodLog[]>({
        queryKey: ["/api/nutrition"],
    });

    const analyzeMutation = useMutation({
        mutationFn: async (text: string) => {
            const res = await apiRequest("POST", "/api/nutrition/analyze", { text });
            return await res.json();
        },
        onSuccess: (data) => {
            form.setValue("foodName", data.foodName || form.getValues("foodName"));
            form.setValue("calories", data.calories || 0);
            form.setValue("protein", data.protein || 0);
            form.setValue("carbs", data.carbs || 0);
            form.setValue("fat", data.fat || 0);
            toast({
                title: "Analysis Complete",
                description: "Nutrition data has been filled.",
            });
        },
        onError: (error) => {
            toast({
                title: "Analysis Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const createLogMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const newLog = {
                ...values,
                date: new Date().toISOString(),
            };
            const res = await apiRequest("POST", "/api/nutrition", newLog);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
            form.reset();
            toast({
                title: "Meal logged",
                description: "Your nutrition log has been updated.",
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to log meal",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createLogMutation.mutate(values);
    }

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border/40 pb-6">
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent inline-block">
                        Nutrition Tracker
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Track your meals and macros.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-8">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all shadow-lg shadow-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-primary/20 p-2 rounded-full text-primary">🧠</span>
                                    AI Smart Analyze
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const text = (e.currentTarget.elements.namedItem("description") as HTMLTextAreaElement).value;
                                        analyzeMutation.mutate(text);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Describe your meal</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="e.g., A grilled chicken breast with a cup of brown rice and broccoli"
                                            className="bg-background/50 border-input/50 focus:border-primary/50 min-h-[100px]"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
                                        disabled={analyzeMutation.isPending}
                                    >
                                        {analyzeMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Analyze with AI
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all shadow-lg shadow-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-primary/20 p-2 rounded-full text-primary">🍽️</span>
                                    Log a Meal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="foodName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Food Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Grilled Chicken Breast" {...field} className="bg-background/50 border-input/50 focus:border-primary/50 transition-colors" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="calories"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Calories</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="protein"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Protein (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="carbs"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Carbs (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fat"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Fat (g)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-background/50 border-input/50 focus:border-primary/50" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-neon font-semibold text-white transition-all hover:scale-[1.02]" disabled={createLogMutation.isPending}>
                                            {createLogMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-4 w-4" />
                                            )}
                                            Add Log
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-card/40 border-border/60">
                        <CardHeader>
                            <CardTitle>Recent Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : foodLogs?.length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <p className="text-muted-foreground">No meals logged yet.</p>
                                    <p className="text-xs text-muted-foreground/60">Start tracking your macros to reach your goals.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent max-h-[500px] overflow-y-auto">
                                    {foodLogs?.map((log) => (
                                        <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-background/40 border border-border/40 hover:border-primary/30 transition-colors">
                                            <div>
                                                <p className="font-semibold text-foreground">{log.foodName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(log.date).toLocaleDateString()} &bull; <span className="text-primary/80">{log.mealType}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">{log.calories} kcal</p>
                                                <div className="text-[10px] text-muted-foreground space-x-1">
                                                    <span className="bg-blue-500/10 text-blue-500 px-1 rounded">P: {log.protein}g</span>
                                                    <span className="bg-green-500/10 text-green-500 px-1 rounded">C: {log.carbs}g</span>
                                                    <span className="bg-yellow-500/10 text-yellow-500 px-1 rounded">F: {log.fat}g</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
