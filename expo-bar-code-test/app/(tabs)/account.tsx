import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const iconColor = colors.icon;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol size={60} name="person.circle.fill" color={iconColor} />
          </View>
          <ThemedText type="title">John Doe</ThemedText>
          <ThemedText style={styles.email}>john.doe@example.com</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>
          
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="bell.fill" color={iconColor} />
            <ThemedText style={styles.menuText}>Notifications</ThemedText>
          </View>
          
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="lock.fill" color={iconColor} />
            <ThemedText style={styles.menuText}>Privacy</ThemedText>
          </View>
          
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="globe" color={iconColor} />
            <ThemedText style={styles.menuText}>Language</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Support</ThemedText>
          
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="questionmark.circle.fill" color={iconColor} />
            <ThemedText style={styles.menuText}>Help Center</ThemedText>
          </View>
          
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="exclamationmark.bubble.fill" color={iconColor} />
            <ThemedText style={styles.menuText}>Report Issue</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuItem}>
            <IconSymbol size={24} name="arrow.right.square.fill" color="#ff3b30" />
            <ThemedText lightColor="#ff3b30" darkColor="#ff453a" style={styles.menuText}>Sign Out</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  email: {
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
});
