import { Account } from "@/app/(tabs)/account";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

type EditAccountModalProps = {
    visible: boolean;
    account: Account | null;
    onClose: () => void;
    onSaveAccount: (account: Account) => void;
    onDeleteAccount: (accountId: string) => void;
};

export default function EditAccountModal({
    visible,
    account,
    onClose,
    onSaveAccount,
    onDeleteAccount,
}: EditAccountModalProps) {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (account) {
            setNickname(account.nickname);
            setEmail(account.email);
            setPassword(account.password);
        }
    }, [account]);

    const resetForm = () => {
        setNickname("");
        setEmail("");
        setPassword("");
        setError("");
        setShowPassword(false);
        setShowDeleteConfirm(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!account) return;

        // Validation
        if (!nickname.trim()) {
            setError("Nickname is required");
            return;
        }
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (!email.includes("@")) {
            setError("Please enter a valid email");
            return;
        }
        if (!password.trim()) {
            setError("Password is required");
            return;
        }
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }

        const updatedAccount: Account = {
            id: account.id,
            nickname: nickname.trim(),
            email: email.trim().toLowerCase(),
            password: password,
        };

        onSaveAccount(updatedAccount);
        resetForm();
    };

    const handleDelete = () => {
        if (!account) return;
        onDeleteAccount(account.id);
        resetForm();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-5">
                    <View className="w-full max-w-md bg-background rounded-2xl p-6">
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-foreground">
                                Edit Account
                            </Text>
                            <Pressable onPress={handleClose} className="p-1">
                                <Ionicons name="close" size={24} color="#a1a1aa" />
                            </Pressable>
                        </View>

                        {/* Error Message */}
                        {error ? (
                            <View className="bg-danger/10 rounded-lg p-3 mb-4">
                                <Text className="text-danger text-sm">{error}</Text>
                            </View>
                        ) : null}

                        {/* Nickname Input */}
                        <View className="mb-4">
                            <Text className="text-foreground-secondary text-sm mb-2">
                                Nickname
                            </Text>
                            <TextInput
                                className="bg-secondary text-foreground rounded-xl px-4 py-3"
                                placeholder="Enter nickname"
                                placeholderTextColor="#71717a"
                                value={nickname}
                                onChangeText={(text) => {
                                    setNickname(text);
                                    setError("");
                                }}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-foreground-secondary text-sm mb-2">
                                Email
                            </Text>
                            <TextInput
                                className="bg-secondary text-foreground rounded-xl px-4 py-3"
                                placeholder="Enter email"
                                placeholderTextColor="#71717a"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setError("");
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <Text className="text-foreground-secondary text-sm mb-2">
                                Password
                            </Text>
                            <View className="flex-row items-center bg-secondary rounded-xl">
                                <TextInput
                                    className="flex-1 text-foreground px-4 py-3"
                                    placeholder="Enter password"
                                    placeholderTextColor="#71717a"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setError("");
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="px-4"
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="#71717a"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Delete Confirmation */}
                        {showDeleteConfirm ? (
                            <View className="bg-danger/10 rounded-xl p-4 mb-4">
                                <Text className="text-danger text-center mb-3">
                                    Are you sure you want to delete this account?
                                </Text>
                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={() => setShowDeleteConfirm(false)}
                                        className="flex-1 bg-secondary py-2 rounded-lg items-center"
                                    >
                                        <Text className="text-foreground font-medium">Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleDelete}
                                        className="flex-1 bg-danger py-2 rounded-lg items-center"
                                    >
                                        <Text className="text-white font-medium">Delete</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => setShowDeleteConfirm(true)}
                                className="mb-4 py-2 items-center"
                            >
                                <Text className="text-danger font-medium">Delete Account</Text>
                            </Pressable>
                        )}

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={handleClose}
                                className="flex-1 bg-secondary py-3 rounded-xl items-center"
                            >
                                <Text className="text-foreground font-semibold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSave}
                                className="flex-1 bg-primary py-3 rounded-xl items-center"
                            >
                                <Text className="text-primary-foreground font-semibold">
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
