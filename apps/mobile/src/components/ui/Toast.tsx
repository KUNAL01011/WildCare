import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

type ToastConfig = {
  bg: string;
  icon: string;
  color: string;
};

const TOAST_CONFIG: Record<ToastType, ToastConfig> = {
  success: { bg: "#ECFDF5", icon: "checkmark-circle", color: "#059669" },
  error: { bg: "#FEF2F2", icon: "close-circle", color: COLORS.error },
  warning: { bg: "#FFFBEB", icon: "warning", color: COLORS.warning },
  info: { bg: "#EFF6FF", icon: "information-circle", color: "#2563EB" },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[toast.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      dismiss();
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        { backgroundColor: config.bg },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name={config.icon as any} size={18} color={config.color} />
      <Text style={[styles.toastMessage, { color: config.color }]}>
        {toast.message}
      </Text>
      <TouchableOpacity
        onPress={dismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
