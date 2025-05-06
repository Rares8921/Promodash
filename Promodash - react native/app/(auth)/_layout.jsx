import { Stack } from "expo-router";
import i18n from "../../i18n";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" options={{ title: i18n.t("auth.signup") }} />
    </Stack>
  );
}