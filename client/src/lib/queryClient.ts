import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown | undefined,
): Promise<Response> {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || res.statusText);
    }

    return res;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 5 * 60 * 1000,
            retry: false,
        },
        mutations: {
            onError: async (error) => {
                // You can add a global toast error handler here if needed
                console.error("Mutation error:", error);
            },
        },
    },
});
