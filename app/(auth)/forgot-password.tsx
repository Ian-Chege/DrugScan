import type { AppShadows } from "@/constants/Colors";
import type { AppColors } from "@/hooks/useTheme";
import { useTheme } from "@/hooks/useTheme";
import { useAuthActions } from "@convex-dev/auth/react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const { signIn } = useAuthActions();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await signIn("password", { email: trimmed, flow: "reset" });
      // Navigate to reset screen with the email so we can pre-fill it
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email: trimmed },
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Failed to send code",
        msg.includes("not found") || msg.includes("No account")
          ? "No account found with that email address."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={14} color={colors.primary} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.headerArea}>
            <View style={styles.iconBox}>
              <FontAwesome name="lock" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a reset code.
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, shadows.md]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[styles.inputRow, shadows.sm]}>
                <FontAwesome
                  name="envelope-o"
                  size={14}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSendCode}
                  accessibilityLabel="Email address"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleSendCode}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Send reset code"
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Send Reset Code</Text>
              )}
            </Pressable>

            <Text style={styles.hint}>
              Check your Convex dashboard logs for the code during development.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, shadows: AppShadows) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 32,
    },
    backText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
    headerArea: { alignItems: "center", marginBottom: 32 },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: colors.primarySoft,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.6,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
    },
    fieldGroup: { marginBottom: 20 },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      ...shadows.md,
    },
    submitBtnPressed: {
      backgroundColor: colors.primaryDark,
      transform: [{ scale: 0.98 }],
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    hint: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 18,
    },
  });
}
