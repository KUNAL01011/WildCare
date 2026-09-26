import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../src/constants/colors";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.sub}>This page doesn't exist or was moved.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.btnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  btn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  btnText: {
    color: COLORS.textInverse,
    fontWeight: "700",
    fontSize: 15,
  },
});
