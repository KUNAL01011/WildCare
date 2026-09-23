import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/constants/colors';

export default function LoginScreen() {
  const { request, promptAsync, handleGoogleResponse, isLoading } = useAuth();

  // Fires whenever Google auth returns a result
  useEffect(() => {
    if (!handleGoogleResponse) return;
    handleGoogleResponse().catch((err) => {
      Alert.alert(
        'Sign-in failed',
        err?.message ?? 'Could not sign in. Please try again.'
      );
    });
  }, [handleGoogleResponse]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top section — branding */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          {/* Replace with your actual logo asset */}
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>

        <Text style={styles.appName}>WildCare</Text>
        <Text style={styles.tagline}>
          Report wildlife incidents.{'\n'}Connect with responders.
        </Text>
      </View>

      {/* Bottom section — sign in */}
      <View style={styles.bottom}>
        <Text style={styles.prompt}>Sign in to get started</Text>

        <TouchableOpacity
          style={[styles.googleButton, !request && styles.buttonDisabled]}
          onPress={() => promptAsync()}
          disabled={!request || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textPrimary} size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to help protect wildlife in your area.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  // Hero
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.accent,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Bottom
  bottom: {
    gap: 16,
    alignItems: 'center',
  },
  prompt: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textInverse,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.primaryMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});