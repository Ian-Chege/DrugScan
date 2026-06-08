import type { AppShadows } from "@/constants/Colors";
import type { AppColors } from "@/hooks/useTheme";
import { useTheme } from "@/hooks/useTheme";
import { useAuthActions } from "@convex-dev/auth/react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
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

export default function ResetPasswordScreen() {
  const { signIn } = useAuthActions();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = emailParam ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleReset = async () => {
    if (!code.trim()) {
      Alert.alert("Code required", "Please enter the reset code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please make sure both passwords match.");
      return;
    }

    setLoading(true);
    try {
      await signIn("password", {
        email,
        code: code.trim(),
        newPassword,
        flow: "reset-verification",
      });
      Alert.alert(
        "Password Reset",
        "Your password has been reset successfully. Please sign in.",
        [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isExpired = /expired|invalid.*code|code.*invalid/i.test(msg);
      Alert.alert(
        "Reset Failed",
        isExpired
          ? "The code is invalid or has expired. Please request a new one."
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
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={14} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.headerArea}>
            <View style={styles.iconBox}>
              <FontAwesome name="key" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the code sent to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, shadows.md]}>
            {/* Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>RESET CODE</Text>
              <View style={[styles.inputRow, shadows.sm]}>
                <FontAwesome
                  name="hashtag"
                  size={14}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter your reset code"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                  accessibilityLabel="Reset code"
                />
              </View>
            </View>

            {/* New Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <View style={[styles.inputRow, shadows.sm]}>
                <FontAwesome
                  name="lock"
                  size={14}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={newPasswordRef}
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showNew}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  accessibilityLabel="New password"
                />
                <Pressable onPress={() => setShowNew((v) => !v)} hitSlop={8}>
                  <FontAwesome
                    name={showNew ? "eye-slash" : "eye"}
                    size={14}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <View style={[styles.inputRow, shadows.sm]}>
                <FontAwesome
                  name="lock"
                  size={14}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmRef}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your new password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                  accessibilityLabel="Confirm new password"
                />
                <Pressable
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={8}
                >
                  <FontAwesome
                    name={showConfirm ? "eye-slash" : "eye"}
                    size={14}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleReset}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Reset password"
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Reset Password</Text>
              )}
            </Pressable>
          </View>

          {/* Resend link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive a code?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}> Resend</Text>
            </Pressable>
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
    emailHighlight: {
      color: colors.primary,
      fontWeight: "600",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
    },
    fieldGroup: { marginBottom: 16 },
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
      marginTop: 8,
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
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 28,
    },
    footerText: { fontSize: 14, color: colors.textSecondary },
    footerLink: { fontSize: 14, color: colors.primary, fontWeight: "700" },
  });
}
