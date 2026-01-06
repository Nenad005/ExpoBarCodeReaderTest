import { InventoryItem } from '@/hooks/inventory-menager';
import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InventoryItemCardProps {
  item: InventoryItem;
  onLongPress: (item: InventoryItem) => void;
}

export const InventoryItemCard = memo(function InventoryItemCard({ 
  item, 
  onLongPress 
}: InventoryItemCardProps) {
  return (
    <Pressable onLongPress={() => onLongPress(item)}>
      <View className="mx-5 rounded-xl px-4 py-3 mb-2 bg-card">
        <View className="flex-row justify-between items-start">
          <View className='flex-1 pr-2'>
            <Text className="font-semibold text-foreground text-base" numberOfLines={1}>{item.product.name}</Text>
            <Text className="text-[10px] text-foreground-muted">ID: {item.product.id}</Text>
          </View>
          <Text className='text-sm font-bold text-foreground-muted'>{item.product.price} RSD</Text>
        </View>
        
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border/30">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-[10px] uppercase text-foreground-muted font-bold">Whouse:</Text>
            <Text className="text-sm font-bold text-foreground">{item.in_warehouse ?? '-'}</Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Text className="text-[10px] uppercase text-foreground-muted font-bold">In club:</Text>
            <Text className="text-sm font-bold text-foreground">{item.in_club}</Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Text className="text-[10px] uppercase text-foreground-muted font-bold">On Shelf:</Text>
            <Text className="text-sm font-bold text-blue-500">{item.in_club - (item.in_warehouse ?? 0)}</Text>
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
}

export const InventoryItemDetail = memo(function InventoryItemDetail({
  item,
  onClose,
  onSaveBarcode,
}: InventoryItemDetailProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const placeholderColor = '#8E8E93';
  
  const [isEditingBarcode, setIsEditingBarcode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState(item.product.barcode || '');

  const handleSave = async () => {
    await onSaveBarcode(item, barcodeInput);
    setIsEditingBarcode(false);
  };

  const handleCancel = () => {
    setBarcodeInput(item.product.barcode || '');
    setIsEditingBarcode(false);
  };

  return (
    <View className="gap-4">
      <Text className="text-2xl font-bold text-foreground mb-2">{item.product.name}</Text>
      
      <View className="gap-3">
        <View className="flex-row justify-between py-2 border-b border-border/30">
          <Text className="text-sm text-foreground-muted">Product ID</Text>
          <Text className="text-sm font-semibold text-foreground">{item.product.id}</Text>
        </View>

        <View className="py-2 border-b border-border/30">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-foreground-muted">Barcode</Text>
            {!isEditingBarcode ? (
              <Pressable onPress={() => setIsEditingBarcode(true)}>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-foreground">{item.product.barcode || 'Not set'}</Text>
                  <Ionicons name="create-outline" size={16} color={tintColor} />
                </View>
              </Pressable>
            ) : null}
          </View>
          {isEditingBarcode && (
            <View className="gap-2">
              <TextInput
                className="bg-secondary rounded-lg px-3 py-2 text-foreground"
                placeholder="Enter barcode..."
                placeholderTextColor={placeholderColor}
                value={barcodeInput}
                onChangeText={setBarcodeInput}
                autoFocus
              />
              <View className="flex-row gap-2">
                <Pressable 
                  className="flex-1 bg-primary py-2 rounded-lg"
                  onPress={handleSave}
                >
                  <Text className="text-center text-primary-foreground font-semibold">Save</Text>
                </Pressable>
                <Pressable 
                  className="flex-1 bg-secondary py-2 rounded-lg"
                  onPress={handleCancel}
                >
                  <Text className="text-center text-foreground font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row justify-between py-2 border-b border-border/30">
          <Text className="text-sm text-foreground-muted">Price</Text>
          <Text className="text-lg font-bold text-foreground">{item.product.price} RSD</Text>
        </View>

        <View className="flex-row justify-between py-2 border-b border-border/30">
          <Text className="text-sm text-foreground-muted">Club ID</Text>
          <Text className="text-sm font-semibold text-foreground">{item.club_id}</Text>
        </View>
      </View>

      <View className="bg-secondary/50 rounded-xl p-4 mt-4">
        <Text className="text-base font-bold text-foreground mb-3">Inventory Status</Text>
        
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-foreground-muted">In Warehouse</Text>
            <Text className="text-base font-bold text-foreground">{item.in_warehouse ?? '-'}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-foreground-muted">Total in Club</Text>
            <Text className="text-base font-bold text-foreground">{item.in_club}</Text>
          </View>

          <View className="flex-row justify-between pt-2 mt-2 border-t border-border/30">
            <Text className="text-sm text-foreground-muted">On Shelf (Calculated)</Text>
            <Text className="text-lg font-bold text-blue-500">{item.in_club - (item.in_warehouse ?? 0)}</Text>
          </View>
        </View>
      </View>

      <Pressable 
        className="bg-primary py-3 rounded-xl mt-4"
        onPress={onClose}
      >
        <Text className="text-center text-primary-foreground font-semibold">Close</Text>
      </Pressable>
    </View>
  );
});
