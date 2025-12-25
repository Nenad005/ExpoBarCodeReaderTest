import { Account } from "@/app/(tabs)/account";
import { getGradientFromSeed } from "@/utils/gradientsHelper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type AccountAvatarProps = {
    account: Account | null;
    onPress?: () => void;
    onLongPress?: () => void;
};

export default function AccountAvatar({ account, onPress, onLongPress }: AccountAvatarProps) {
    const gradient = account ? getGradientFromSeed(account.email) : null;

    return (
        <Pressable 
            onPress={onPress} 
            onLongPress={onLongPress}
            delayLongPress={500}
            className="flex items-center gap-2"
        >
            {account && gradient ? (
                <View className="rounded-full overflow-hidden flex justify-center items-center w-20 h-20">
                    <LinearGradient
                        colors={gradient as [string, string, string]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        className="w-full h-full flex justify-center items-center"
                    >
                        <Text className="text-2xl font-bold text-white">
                            {account.nickname.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>
                </View>
            ) : (
                <View className="rounded-full flex justify-center items-center w-20 h-20 bg-secondary">
                    <Ionicons size={28} name="add" color="#a1a1aa" />
                </View>
            )}
            <Text className="text-foreground-secondary">
                {account ? account.nickname : "Add Account"}
            </Text>
        </Pressable>
    );
}