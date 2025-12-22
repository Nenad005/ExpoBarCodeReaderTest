import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

type ViewType = 'total' | 'shelf' | 'storage';

// Mock data for demonstration
const mockInventory = [
  { id: '1', name: 'AQUA VIVA - SL 0,75', barcode: '8600037542492', location: 'shelf', quantity: 10 },
  { id: '2', name: 'AQUA VIVA 0,5', barcode: '8600037003498', location: 'shelf', quantity: 20 },
  { id: '3', name: 'AQUA VIVA BCAA ZERO 0,75', barcode: '8600037656601', location: 'storage', quantity: 15 },
  { id: '4', name: 'AQUA VIVA HYDROACTIVE 0,75', barcode: '8600037042855', location: 'shelf', quantity: 12 },
  { id: '5', name: 'AQUA VIVA REBOOT 0,75L', barcode: '8600037004181', location: 'storage', quantity: 8 },
  { id: '6', name: 'AQUA VIVA REFRESH 0,75L PET', barcode: '8600037004075', location: 'shelf', quantity: 18 },
  { id: '7', name: 'AQUA VIVA RESTART 0,75', barcode: '8600037000107', location: 'storage', quantity: 9 },
];


export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const [selectedView, setSelectedView] = useState<ViewType>('total');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scanned barcode from params
  useEffect(() => {
    if (params.scanned) {
      setSearchQuery(params.scanned as string);
    }
  }, [params.scanned]);

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);
    
    if (selectedView === 'total') return matchesSearch;
    if (selectedView === 'shelf') return matchesSearch && item.location === 'shelf';
    if (selectedView === 'storage') return matchesSearch && item.location === 'storage';
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
      <View className="pt-16 px-5 pb-4">
        <Text className="text-3xl font-bold text-foreground">Inventory</Text>
      </View>

      {/* Segmented Control */}
      <View className="flex-row mx-5 mb-4 rounded-xl p-1 bg-secondary">
        <Pressable
          className={`flex-1 py-2 items-center rounded-lg ${selectedView === 'shelf' ? 'bg-primary' : ''}`}
          onPress={() => setSelectedView('shelf')}>
          <Text className={`text-sm font-semibold ${selectedView === 'shelf' ? 'text-primary-foreground' : 'text-foreground'}`}>
            On Shelf
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-2 items-center rounded-lg ${selectedView === 'storage' ? 'bg-primary' : ''}`}
          onPress={() => setSelectedView('storage')}>
          <Text className={`text-sm font-semibold ${selectedView === 'storage' ? 'text-primary-foreground' : 'text-foreground'}`}>
            Storage
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-2 items-center rounded-lg ${selectedView === 'total' ? 'bg-primary' : ''}`}
          onPress={() => setSelectedView('total')}>
          <Text className={`text-sm font-semibold ${selectedView === 'total' ? 'text-primary-foreground' : 'text-foreground'}`}>
            Total
          </Text>
        </Pressable>
      </View>

      {/* Search Bar with QR Scanner */}
      <View className="flex-row px-5 mb-4 gap-3">
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

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <View className="rounded-xl p-4 mb-3 bg-card">
            <View className="gap-1.5">
              <Text className="font-semibold text-foreground">{item.name}</Text>
              <Text className="text-xs text-foreground-muted">Barcode: {item.barcode}</Text>
              <View className="flex-row items-center gap-3 mt-1">
                <View className="px-2 py-1 rounded-md bg-primary/15">
                  <Text className="text-xs font-medium text-primary">
                    {item.location === 'shelf' ? 'On Shelf' : 'Storage'}
                  </Text>
                </View>
                <Text className="text-sm text-foreground-secondary">Qty: {item.quantity}</Text>
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
    </View>
  );
}
