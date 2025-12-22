  import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="pt-16 px-5 pb-5">
        <Text className="text-3xl font-bold text-danger">Welcome</Text>
      </View>
      
      <View className="flex-1 px-5 gap-4">
        <Text className="text-xl font-semibold text-foreground">
          Inventory Management System
        </Text>
        <Text className="text-base leading-6 text-foreground-secondary">
          Use the Inventory tab to manage your products and scan barcodes.
        </Text>
        
        <View className="flex-row gap-3 mt-5">
          <View className="flex-1 p-4 rounded-xl items-center bg-card">
            <Text className="text-3xl font-semibold text-foreground mb-1">0</Text>
            <Text className="text-xs text-foreground-muted">Total Items</Text>
          </View>
          <View className="flex-1 p-4 rounded-xl items-center bg-card">
            <Text className="text-3xl font-semibold text-foreground mb-1">0</Text>
            <Text className="text-xs text-foreground-muted">On Shelf</Text>
          </View>
          <View className="flex-1 p-4 rounded-xl items-center bg-card">
            <Text className="text-3xl font-semibold text-foreground mb-1">0</Text>
            <Text className="text-xs text-foreground-muted">In Storage</Text>
          </View>
        </View>
      </View>
    </View>
  );
}