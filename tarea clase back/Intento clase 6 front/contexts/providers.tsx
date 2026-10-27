"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeContext";
type Props = {
    children: React.ReactNode;
};
const queryClient = new QueryClient();
export function Providers(
    { children }: Props
) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                {children}
            </ThemeProvider>

        </QueryClientProvider>
    );
}
