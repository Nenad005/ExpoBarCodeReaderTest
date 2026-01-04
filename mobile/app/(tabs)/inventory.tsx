import { Authorized, UnAuthorized } from '@/components/wrappers/Authorized';
import { SignedIn } from '@/components/wrappers/SignedIn';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSession } from '@/hooks/session-menager';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { parse } from 'node-html-parser';
import { bulkUpsertProductsProductsUpdateManyPost } from '@/backend-client';

type InventoryItem = {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  quantity: number;
};

async function fetchInventoryItems(sessionId: string): Promise<InventoryItem[]> {
  console.log("Fething inventory items...")
  const url = "https://nonstopfitness.upfit.cloud/financial/inventory-clubs";

  const cookieHeader = `PHPSESSID=${sessionId.trim()}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Cookie": cookieHeader,
    },
  });

  if (response.url && response.url !== url) {
    console.warn("[Inventory] Redirected to:", response.url);
  }

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const text = await response.text();
  const doc = parse(text);

  const itemElements = doc.querySelectorAll(".odd.gradeX");
  const items: InventoryItem[] = itemElements.map((itemEl, index) => {
    const tds = itemEl.querySelectorAll("td");
    const attributes = tds.map((td) => td.textContent.trim());
    return {
      id: attributes[0] ?? String(index),
      name: attributes[1] ?? '',
      barcode: null,
      price: parseInt(attributes[4].trim().slice(0, -3).replace(" ", "")),
      quantity: parseInt(attributes[2] ?? '0', 10),
    };
  });

  // console.log(items)

  return items;
}


export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const {session, refetchSessionId, isLoading: isSessionLoading} = useSession();
  
  const { data: items, error, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["inventory", session?.id],
    queryFn: () => fetchInventoryItems(session!.id),
    enabled: !!session?.id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      console.error("Inventory fetch error:", error);
    }
    if (items) {
      console.log("Inventory items loaded:", items.length);
    }
  }, [items, error]);

  useEffect(() => {
    if (params.scanned) {
      setSearchQuery(params.scanned as string);
    }
  }, [params.scanned]);

  useEffect(() => {
    if (!isLoading && items) {
      const products = items.map((item, index) => {
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          barcode: item.barcode
        }
      })

      console.log("upserting products")
      bulkUpsertProductsProductsUpdateManyPost({body: products})
    }
  }, [isLoading, items])

  const inventoryData = items ?? [];
  
  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchQuery));
    return matchesSearch;
  });

  const handleScanPress = () => {
    router.push('/scan');
  };

  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const placeholderColor = '#8E8E93';

  return (
    <View className="flex-1 bg-background">
      <Authorized>
        <FlatList
          refreshing={isRefetching}
          onRefresh={refetch}
          data={filteredInventory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            <View className="px-5">
              <View className="pt-16 pb-4 flex gap-1">
                <Text className="text-3xl font-bold text-foreground">Club Inventory</Text>
                <Text className='text-foreground-muted'>{`${session?.club_name}`}</Text>
              </View>

              {/* Search Bar with QR Scanner */}
              <View className="flex-row mb-4 gap-3">
                <View className="flex-1 flex-row items-center rounded-xl px-3 gap-2 h-11 bg-secondary">
                  <IconSymbol size={20} name="magnifyingglass" color={placeholderColor} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="Search products or barcodes..."
                    placeholderTextColor={placeholderColor}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons size={20} name="close-circle" color={placeholderColor} />
                    </Pressable>
                  )}
                </View>

                <Pressable 
                  className="w-11 h-11 rounded-xl items-center justify-center bg-secondary" 
                  onPress={handleScanPress}
                >
                  <Ionicons size={24} name="qr-code" color={tintColor} />
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mx-5 rounded-xl p-4 mb-3 bg-card">
              <View className="gap-1.5">
                <Text className="font-semibold text-foreground">{item.name}</Text>
                <Text className="text-xs text-foreground-muted">ID: {item.id}</Text>
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="px-2 py-1 rounded-md bg-primary/15">
                    <Text className="text-xs font-medium text-primary">
                      In Club
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground-secondary">Qty: {item.quantity}</Text>
                  <Text className='text-sm font-bold text-foreground-muted ml-auto'>{item.price}.00 RSD</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 gap-3">
              <IconSymbol size={60} name="shippingbox" color={placeholderColor} />
              <Text className="text-base text-foreground-muted">No items found</Text>
            </View>
          }
        />
      </Authorized>

      <UnAuthorized>
        <View className='flex-1 justify-center items-center p-5'>
          <SignedIn>
            <View className="items-center gap-4">
                <View className="w-20 h-20 bg-danger/10 rounded-full items-center justify-center mb-2">
                    <Ionicons name="alert-circle" size={40} color="#ef4444" />
                </View>
                <Text className="text-2xl font-bold text-foreground">Session Expired</Text>
                <Text className="text-foreground-secondary text-center mb-4">
                  Your session has expired. Please refresh to continue managing inventory.
                </Text>
                <Pressable 
                  className="bg-primary px-6 py-3 rounded-xl active:opacity-90"
                  onPress={() => refetchSessionId()}
                  disabled={isSessionLoading}
                >
                  <Text className="text-primary-foreground font-semibold">
                    {isSessionLoading ? 'Refreshing...' : 'Refresh Session'}
                  </Text>
                </Pressable>
            </View>
          </SignedIn>
        </View>
      </UnAuthorized>
    </View>
  );
}
