import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Dumbbell,
    User,
    LogOut,
    Utensils,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { logoutMutation } = useAuth();
    const [location] = useLocation();

    const navItems = [
        { href: "/", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/tracker", icon: Dumbbell, label: "Workout Tracker" },
        { href: "/nutrition", icon: Utensils, label: "Nutrition" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-border/40">
            <div className="p-6">
                <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent italic tracking-tighter">
                    GYM RATZ
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium tracking-widest uppercase">
                    Unleash the Beast
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-3 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-neon"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white hover:translate-x-1"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
                                <span className="font-semibold">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-border/40 space-y-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Theme</span>
                    <ModeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => logoutMutation.mutate()}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Desktop Sidebar */}
            <aside className="w-72 hidden md:block fixed inset-y-0 left-0 z-50">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 md:pl-72 transition-all duration-300">
                {/* Mobile Header */}
                <header className="sticky top-0 z-40 md:hidden border-b border-border/40 bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                    <span className="text-xl font-bold italic tracking-tighter text-primary">GYM RATZ</span>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button size="icon" variant="ghost" onClick={() => logoutMutation.mutate()}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-10 overflow-auto animate-fade-in">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Background ambient glow */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>
        </div>
    );
}

// Helper for brand gradient
const brandGradient = "bg-gradient-to-r from-primary to-orange-600";
