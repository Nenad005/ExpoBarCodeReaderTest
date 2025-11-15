import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const segmentBgColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const activeSegmentBgColor = Colors[colorScheme ?? 'light'].tint;
  const searchBarBgColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const inputTextColor = Colors[colorScheme ?? 'light'].text;
  const placeholderColor = isDark ? '#8E8E93' : '#8E8E93';
  const itemBgColor = isDark ? '#2C2C2E' : '#F2F2F7';
  const badgeBgColor = isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.15)';
  const badgeTextColor = isDark ? '#0A84FF' : '#007AFF';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Inventory</ThemedText>
      </View>

      {/* Segmented Control */}
      <View style={[styles.segmentedControl, { backgroundColor: segmentBgColor }]}>
        <Pressable
          style={[
            styles.segment,
            selectedView === 'shelf' && {
              backgroundColor: activeSegmentBgColor,
            },
          ]}
          onPress={() => setSelectedView('shelf')}>
          <ThemedText
            lightColor={selectedView === 'shelf' ? '#fff' : undefined}
            darkColor={selectedView === 'shelf' ? '#000' : undefined}
            style={styles.segmentText}>
            On Shelf
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.segment,
            selectedView === 'storage' && {
              backgroundColor: activeSegmentBgColor,
            },
          ]}
          onPress={() => setSelectedView('storage')}>
          <ThemedText
            lightColor={selectedView === 'storage' ? '#fff' : undefined}
            darkColor={selectedView === 'storage' ? '#000' : undefined}
            style={styles.segmentText}>
            Storage
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.segment,
            selectedView === 'total' && {
              backgroundColor: activeSegmentBgColor,
            },
          ]}
          onPress={() => setSelectedView('total')}>
          <ThemedText
            lightColor={selectedView === 'total' ? '#fff' : undefined}
            darkColor={selectedView === 'total' ? '#000' : undefined}
            style={styles.segmentText}>
            Total
          </ThemedText>
        </Pressable>
      </View>

      {/* Search Bar with QR Scanner */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: searchBarBgColor }]}>
          <IconSymbol size={20} name="magnifyingglass" color={placeholderColor} />
          <TextInput
            style={[styles.searchInput, { color: inputTextColor }]}
            placeholder="Search products or barcodes..."
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons size={20} name="search" color={placeholderColor} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.scanButton, { backgroundColor: searchBarBgColor }]} onPress={handleScanPress}>
          <Ionicons size={24} name="qr-code" color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.inventoryItem, { backgroundColor: itemBgColor }]}>
            <View style={styles.itemInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.itemBarcode}>Barcode: {item.barcode}</ThemedText>
              <View style={styles.itemDetails}>
                <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
                  <ThemedText lightColor={badgeTextColor} darkColor={badgeTextColor} style={styles.badgeText}>
                    {item.location === 'shelf' ? 'On Shelf' : 'Storage'}
                  </ThemedText>
                </View>
                <ThemedText style={styles.quantity}>Qty: {item.quantity}</ThemedText>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol size={60} name="shippingbox" color={placeholderColor} />
            <ThemedText style={styles.emptyText}>No items found</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  inventoryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    gap: 6,
  },
  itemBarcode: {
    fontSize: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quantity: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
