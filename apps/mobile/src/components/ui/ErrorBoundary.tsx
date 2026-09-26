import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: COLORS.textInverse,
    fontWeight: "600",
    fontSize: 14,
  },
});
