import { LoadingStatus } from "@/hooks/inventory-menager";
import { View } from "react-native";
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useSyncedPulse } from "@/hooks/use-synced-animation";

export default function LoadingStatusIndicator({status} : {status: LoadingStatus}) {
    const pulse = useSyncedPulse();

    const getStatusColor = (status: LoadingStatus) => {
        switch (status) {
            case LoadingStatus.Cached:
                return "bg-orange-400";
            case LoadingStatus.Fetched:
                return "bg-emerald-500";
            case LoadingStatus.Fetching:
                return "bg-blue-500";
            case LoadingStatus.NotFound:
                return "bg-red-500";
            case LoadingStatus.Idle:
                return "bg-gray-400";
        }
    }

    const colorClass = getStatusColor(status);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2]) }],
            opacity: interpolate(pulse.value, [0, 0.75, 1], [0.75, 0, 0]),
        };
    });

    return <View className="relative flex items-center justify-center rounded-full">
        <Animated.View className={`absolute w-[12px] h-[12px] ${colorClass} opacity-75 rounded-full`} style={animatedStyle}></Animated.View>
        <View className={`relative w-3 h-3 ${colorClass} rounded-full`}></View>
    </View>
}