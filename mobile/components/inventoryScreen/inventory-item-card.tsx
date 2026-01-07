import { InventoryItem } from '@/hooks/inventory-menager';
import { Ionicons } from '@expo/vector-icons';
import { memo, RefObject, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import BarCodeChanger from './bar-code-changer';

interface InventoryItemCardProps {
  item: InventoryItem;
  onLongPress: (item: InventoryItem) => void;
}

export const InventoryItemCard = memo(function InventoryItemCard({ 
  item, 
  onLongPress 
}: InventoryItemCardProps) {
  const shelfCount = item.in_club - (item.in_warehouse ?? 0);
  const isNegative = shelfCount < 0;

  return (
    <Pressable 
      onLongPress={() => onLongPress(item)}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1}] })}
    >
      <View className="mx-4 my-2 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <View className='flex-1 pr-3'>
            <Text className="font-bold text-foreground text-lg leading-tight" numberOfLines={2}>
                {item.product.name}
            </Text>
            <Text className="text-xs text-foreground-muted font-mono mt-0.5">#{item.product.id}</Text>
          </View>
          <View className="bg-secondary px-2 py-1 rounded-lg">
            <Text className='text-xl font-bold text-foreground'>{item.product.price} <Text className="text-sm font-normal text-foreground-muted">RSD</Text></Text>
          </View>
        </View>
        
        <View className="flex-row items-stretch justify-between gap-2">
            {/* Warehouse Stat */}
            <View className="flex-1 bg-secondary/30 rounded-xl p-2 items-center justify-center">
                <Text className="text-[10px] uppercase text-foreground-muted font-bold mb-0.5 tracking-wider">Whouse</Text>
                <Text className="text-base font-black text-foreground">{item.in_warehouse ?? '-'}</Text>
            </View>

            {/* Club Stat */}
            <View className="flex-1 bg-secondary/30 rounded-xl p-2 items-center justify-center">
                <Text className="text-[10px] uppercase text-foreground-muted font-bold mb-0.5 tracking-wider">Club</Text>
                <Text className="text-base font-black text-foreground">{item.in_club}</Text>
            </View>

            {/* Shelf Stat */}
            <View className={`flex-1 rounded-xl p-2 items-center justify-center ${isNegative ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                <Text className={`text-[10px] uppercase font-bold mb-0.5 tracking-wider ${isNegative ? 'text-red-500' : 'text-blue-500'}`}>On Shelf</Text>
                <Text className={`text-base font-black ${isNegative ? 'text-red-500' : 'text-blue-500'}`}>{shelfCount}</Text>
            </View>
        </View>
      </View>
    </Pressable>
  );
});

interface InventoryItemDetailProps {
  item: InventoryItem;
  onClose: () => void;
  onSaveBarcode: (item: InventoryItem, barcode: string) => Promise<void>;
  bottomSheetRef: RefObject<BottomSheetMethods | null>
}

export const InventoryItemDetail = function InventoryItemDetail({
  item,
  onClose,
  onSaveBarcode,
  bottomSheetRef
}: InventoryItemDetailProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const [isEditingBarcode, setIsEditingBarcode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState(item.product.barcode || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when item changes
  useEffect(() => {
    setBarcodeInput(item.product.barcode || '');
    setIsEditingBarcode(false);
  }, [item]);

  const handleSave = async () => {
    try {
        setIsSaving(true);
        await onSaveBarcode(item, barcodeInput);
        setIsEditingBarcode(false);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setBarcodeInput(item.product.barcode || '');
    bottomSheetRef.current?.expand()
    setIsEditingBarcode(false);
  };

  const shelfCount = item.in_club - (item.in_warehouse ?? 0);

  return (
    <View className="flex-1 pb-6">
      <View className="flex-row justify-between items-start mb-4">
        <Text className="text-2xl font-bold text-foreground flex-1 pr-4">{item.product.name}</Text>
        <Pressable onPress={onClose} className="bg-secondary/50 p-2 rounded-full">
            <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </Pressable>
      </View>
      
      <View className="gap-4">
        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-2">
            <View className="bg-secondary/30 rounded-lg p-3 grow basis-[45%]">
                <Text className="text-xs text-foreground-muted mb-1">Price</Text>
                <Text className="text-lg font-bold text-foreground">{item.product.price} RSD</Text>
            </View>
            <View className="bg-secondary/30 rounded-lg p-3 grow basis-[45%]">
                <Text className="text-xs text-foreground-muted mb-1">Product ID</Text>
                <Text className="text-sm font-semibold text-foreground font-mono">{item.product.id}</Text>
            </View>
        </View>

        {/* Barcode Section */}
        <View className="bg-secondary/20 rounded-xl p-4 border border-border w-full">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Barcode</Text>
            {!isEditingBarcode && (
                 <Pressable onPress={() => setIsEditingBarcode(true)} className="flex-row items-center gap-3 bg-secondary/50 px-2 py-1 rounded-md active:opacity-70">
                    <Text className="text-lg font-medium text-primary">Edit</Text>
                </Pressable>
            )}
          </View>
          
          {isEditingBarcode ? (
            <BarCodeChanger
              barcodeInput={barcodeInput}
              setBarcodeInput={setBarcodeInput}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={cancelEdit}
            />
          ) : ( <>
              <Pressable onPress={() => setIsEditingBarcode}>
              </Pressable>
              <View className="flex-row items-center gap-3">
                    <Ionicons name="barcode-outline" size={24} color={tintColor} />
                    <Text className={`text-lg font-mono ${item.product.barcode ? 'text-foreground' : 'text-foreground-muted italic'}`}>
                        {item.product.barcode || 'No barcode set'}
                    </Text>
                </View>
              </>
          )}
        </View>

        {/* Stats Section */}
        <View className="bg-card rounded-xl border border-border p-4 mt-2">
            <Text className="text-base font-bold text-foreground mb-4">Stock Overview</Text>
            
            <View className="flex-row divide-x divide-border">
                <View className="flex-1 items-center px-2">
                    <Text className="text-2xl font-black text-foreground">{item.in_warehouse ?? '-'}</Text>
                    <Text className="text-xs text-foreground-muted text-center mt-1">Warehouse</Text>
                </View>
                <View className="flex-1 items-center px-2">
                    <Text className="text-2xl font-black text-foreground">{item.in_club}</Text>
                    <Text className="text-xs text-foreground-muted text-center mt-1">Total Club</Text>
                </View>
                <View className="flex-1 items-center px-2">
                    <Text className={`text-2xl font-black ${shelfCount < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {shelfCount}
                    </Text>
                    <Text className="text-xs text-foreground-muted text-center mt-1">Calculated Shelf</Text>
                </View>
            </View>
            
             <View className="mt-4 pt-3 border-t border-border">
                <View className="flex-row justify-between">
                    <Text className="text-xs text-foreground-muted">Club ID</Text>
                    <Text className="text-xs font-mono text-foreground">{item.club_id}</Text>
                </View>
             </View>
        </View>

      </View>
    </View>
  );
};
