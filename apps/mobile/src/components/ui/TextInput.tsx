import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  optional?: boolean;
};

export function TextInput({
  label,
  error,
  containerStyle,
  optional = false,
  ...props
}: Props) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && (
          <Text style={styles.optional}>optional</Text>
        )}
      </View>

      <RNTextInput
        style={[
          styles.input,
          props.multiline && styles.inputMultiline,
          error ? styles.inputError : styles.inputNormal,
        ]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optional: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
  },
  inputNormal: {
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
});