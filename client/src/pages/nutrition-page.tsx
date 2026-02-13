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
import { Loader2, Plus } from "lucide-react";

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
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h2>
                    <p className="text-muted-foreground">
                        Track your meals and macros.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Log a Meal</CardTitle>
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
                                                    <Input placeholder="Chicken Breast" {...field} />
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
                                                        <Input type="number" {...field} />
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
                                                        <Input type="number" {...field} />
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
                                                        <Input type="number" {...field} />
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
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createLogMutation.isPending}>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : foodLogs?.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No meals logged yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {foodLogs?.map((log) => (
                                        <div key={log.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium">{log.foodName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(log.date).toLocaleDateString()} - {log.mealType}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="font-medium">{log.calories} kcal</p>
                                                <p className="text-muted-foreground text-xs">
                                                    P: {log.protein}g C: {log.carbs}g F: {log.fat}g
                                                </p>
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
