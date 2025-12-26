import { Authorized, UnAuthorized } from '@/components/wrappers/Authorized';
import { SignedIn, SignedOut } from '@/components/wrappers/SignedIn';
import { Text, View, Pressable } from 'react-native';
import { useSession } from '@/hooks/session-menager';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { refetchSessionId, isLoading } = useSession();

  return (
    <View className="flex-1 bg-background">
      <Authorized>
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
                    Your session has expired or could not be established. Please try reconnecting.
                </Text>
                
                <Pressable 
                    onPress={() => refetchSessionId()}
                    className="w-full min-w-[200px] bg-primary py-3 px-6 rounded-xl items-center active:opacity-90"
                >
                    <Text className="text-primary-foreground font-semibold">
                        {isLoading ? "Connecting..." : "Retry Connection"}
                    </Text>
                </Pressable>

                <Link href="/account" asChild>
                    <Pressable className="py-3 px-6">
                        <Text className="text-primary font-medium">Manage Accounts</Text>
                    </Pressable>
                </Link>
            </View>
          </SignedIn>
          <SignedOut>
            <View className="items-center gap-4">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-2">
                    <Ionicons name="person" size={40} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-foreground">Welcome</Text>
                <Text className="text-foreground-secondary text-center mb-4">
                    Please sign in to access the inventory management system.
                </Text>
                
                <Link href="/account" asChild>
                    <Pressable className="w-full min-w-[200px] bg-primary py-3 px-6 rounded-xl items-center active:opacity-90">
                        <Text className="text-primary-foreground font-semibold">Sign In</Text>
                    </Pressable>
                </Link>
            </View>
          </SignedOut>
        </View>
      </UnAuthorized>
    </View>
  );
}