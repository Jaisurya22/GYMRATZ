import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Dumbbell,
    User,
    LogOut,
    Utensils,
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { logoutMutation } = useAuth();
    const [location] = useLocation();

    const navItems = [
        { href: "/", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/tracker", icon: Dumbbell, label: "Workout Tracker" },
        { href: "/nutrition", icon: Utensils, label: "Nutrition" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Gym Rat
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-3"
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        className="w-full gap-2 text-destructive hover:text-destructive"
                        onClick={() => logoutMutation.mutate()}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center">
                    <span className="font-bold">Gym Rat</span>
                    <Button size="sm" variant="ghost" onClick={() => logoutMutation.mutate()}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
