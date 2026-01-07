import { Authorized, UnAuthorized } from '@/components/wrappers/Authorized';
import { SignedIn } from '@/components/wrappers/SignedIn';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSession } from '@/hooks/session-menager';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { BackHandler } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { InventoryItem, LoadingStatus, useInventory } from '@/hooks/inventory-menager';
import LoadingStatusIndicator from '@/components/ui/loadingStatusIndicator';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InventoryItemCard, InventoryItemDetail } from '@/components/inventoryScreen/inventory-item-card';

type SortOption = "abcasc" | "abcdesc" | "prcasc" | "prcdesc" | "stkasc" | "stkdesc"

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const [sortOption, setSortOption] = useState<SortOption>("abcasc")
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [detailBottomSheetIndex, setDetailBottomSheetIndex] = useState(-1);
  const {session, refetchSessionId, isLoading: isSessionLoading} = useSession();
  const {warehouseItems, upfitItems, inventoryItems, upfitStatus, warehouseStatus, refetchUpfit, refetchWarehouse, updateWarehouseItem} = useInventory();

  useEffect(() => {
    if (params.scanned) {
      setSearchQuery(params.scanned as string);
    }
  }, [params.scanned]);

  const filteredItems = inventoryItems?.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.product.name.toLowerCase().includes(query) ||
      item.product.id.toLowerCase().includes(query) ||
      (item.product.barcode && item.product.barcode.toLowerCase().includes(query))
    );
  });

  const sortedItems = [...(filteredItems || [])].sort((a, b) => {
    switch (sortOption) {
      case "abcasc":
        return a.product.name.localeCompare(b.product.name);
      case "abcdesc":
        return b.product.name.localeCompare(a.product.name);
      case "prcasc":
        return a.product.price - b.product.price;
      case "prcdesc":
        return b.product.price - a.product.price;
      case "stkasc":
        return a.in_club - b.in_club;
      case "stkdesc":
        return b.in_club - a.in_club;
      default:
        return 0;
    }
  });

  const handleScanPress = () => {
    router.push('/scan');
  };

  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const placeholderColor = '#8E8E93';

  const bottomSheetRef = useRef<BottomSheet>(null);
  const detailBottomSheetRef = useRef<BottomSheet>(null);

  const sortOptions: Record<SortOption, string> = {
    "abcasc" : "Alphabetical (A-Z)",
    "abcdesc" : "Alphabetical (Z-A)",
    "prcasc" : "Price (lowest)",
    "prcdesc" : "Price (highest)",
    "stkasc" : "Stock (lowest)",
    "stkdesc" : "Stock (highest)"
  }

  const onSortChange = (value: SortOption) => {
    setSortOption(value)
    bottomSheetRef.current?.close()
  }

  const handleItemLongPress = (item: InventoryItem) => {
    setSelectedItem(item);
    detailBottomSheetRef.current?.expand();
  };

  const handleSaveBarcode = async (item: InventoryItem, barcode: string) => {
    console.log("dosao")
    if (!item) return;
    console.log("provera")
    
    try {
      console.log("pokusavam")
      await updateWarehouseItem({
        product: {...item.product, barcode: barcode},
        club_id: item.club_id,
        in_warehouse: item.in_warehouse === null ? 0 : item.in_warehouse
      })
      console.log("uspeo")
    } catch (error) {
      console.error('Failed to update barcode:', error);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  useEffect(() => {
    const onBackPress = () => {
      let closed = false;
      if (detailBottomSheetIndex !== -1) {
        detailBottomSheetRef.current?.close();
        closed = true;
      }
      if (bottomSheetIndex !== -1) {
        bottomSheetRef.current?.close();
        closed = true;
      }
      return closed;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [detailBottomSheetIndex, bottomSheetIndex]);

  return (
    <View className="flex-1 bg-background">
      <Authorized>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <FlatList
            refreshing={upfitStatus === LoadingStatus.Fetching && warehouseStatus === LoadingStatus.Fetching}
            onRefresh={async () => {
              refetchUpfit();
              refetchWarehouse();
            }}
            data={sortedItems}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View className="px-5">
                <View className="pt-16 pb-4 flex flex-row gap-1 items-start">
                  <View>
                    <Text className="text-3xl font-bold text-foreground">Club Inventory</Text>
                    <Text className='text-foreground-muted'>{`${session?.club_name}`}</Text>
                  </View>
                  <View className='flex flex-col ml-auto items-end mt-1'>
                    <View className='flex-row items-center gap-1'>
                      <Text className='text-foreground-muted text-right'>Upfit -</Text>
                      <LoadingStatusIndicator status={upfitStatus}/>
                    </View>
                    <View className='flex-row items-center gap-1'>
                      <Text className='text-foreground-muted text-right'>Warehouse -</Text>
                      <LoadingStatusIndicator status={warehouseStatus}/>
                    </View>
                  </View>
                </View>

                {/* Search Bar with QR Scanner */}
                <View className="flex-row mb-4 gap-1">
                  <View className="flex-1 flex-row items-center rounded-xl px-3 gap-2 h-11 bg-secondary">
                    <IconSymbol size={20} name="magnifyingglass" color={placeholderColor} />
                    <TextInput
                      className="flex-1 text-base text-foreground"
                      placeholder="Search for products..."
                      placeholderTextColor={placeholderColor}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => {
                          setSearchQuery('')
                        }}>
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
                  <Pressable onPress={() => bottomSheetRef.current?.snapToIndex(1)} className="w-11 h-11 rounded-xl items-center justify-center bg-secondary" >
                    <FontAwesome size={24} name='sliders' color={tintColor}></FontAwesome>
                  </Pressable>
                  <Pressable className="w-11 h-11 rounded-xl items-center justify-center bg-secondary" >
                    <Ionicons size={30} name='help-circle' color={tintColor}></Ionicons>
                  </Pressable>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <InventoryItemCard item={item} onLongPress={handleItemLongPress} />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-16 gap-3">
                <IconSymbol size={60} name="shippingbox" color={placeholderColor} />
                <Text className="text-base text-foreground-muted">No items found</Text>
              </View>
            }
          />
          <BottomSheet 
            ref={bottomSheetRef} 
            onChange={setBottomSheetIndex}
            snapPoints={["30%", "40%"]} 
            index={-1} 
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            backgroundStyle={{backgroundColor: isDark ? "#18181b" : "#e4e4e7"}}
            handleIndicatorStyle={{backgroundColor: "white"}}
            handleStyle={{borderBottomWidth: 1, borderBottomColor: "white", borderStyle: "dashed"}}
          >
            <BottomSheetView className="p-6 gap-6">
              <Text className="text-xl font-bold text-foreground mb-2">Sort Inventory</Text>
              <View className="gap-4 flex flex-row flex-wrap">
                {(Object.keys(sortOptions) as SortOption[]).map((key) => {
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSortChange(key)}
                      className="flex-row items-center justify-start gap-2"
                    >
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        sortOption === key 
                          ? 'border-primary' 
                          : 'border-foreground-muted'
                      }`}>
                        {sortOption === key && (
                          <View className="w-3 h-3 bg-primary rounded-full" />
                        )}
                      </View>
                      <Text className={`text-base ${sortOption === key ? 'text-primary font-semibold' : 'text-foreground-muted'}`}>
                        {sortOptions[key]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet 
            onChange={setDetailBottomSheetIndex}
            ref={detailBottomSheetRef} 
            snapPoints={["24%"]} 
            index={-1} 
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            backgroundStyle={{backgroundColor: isDark ? "#18181b" : "#e4e4e7"}}
            handleIndicatorStyle={{backgroundColor: "white"}}
            handleStyle={{borderBottomWidth: 1, borderBottomColor: "white", borderStyle: "dashed"}}
          >
            <BottomSheetView className="flex-1 p-6">
              {selectedItem && (
                <InventoryItemDetail
                  bottomSheetRef = {detailBottomSheetRef}
                  item={selectedItem}
                  onClose={() => detailBottomSheetRef.current?.close()}
                  onSaveBarcode={handleSaveBarcode}
                />
              )}
            </BottomSheetView>
          </BottomSheet>
        </GestureHandlerRootView>
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
