import { View, Text } from "react-native";
import { COLORS } from "../../../src/constants/colors";

export default function FeedbackScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ fontSize: 18, color: COLORS.textPrimary }}>
        Feedback — Step 9
      </Text>
    </View>
  );
}
