import "@/assets/globals.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessionProvider } from "@/hooks/session-menager";
import { InventoryProvider } from "@/hooks/inventory-menager";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <InventoryProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="scan" options={{ presentation: 'modal', title: 'Scan Barcode' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </InventoryProvider>
    </SessionProvider>
  );
}
