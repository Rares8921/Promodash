import { WebView } from "react-native-webview";
import { View, Dimensions } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../app/context/ThemeContext";

export default function RecaptchaWebView({ onVerify }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "Dark";
  const screenHeight = Dimensions.get("window").height;

  return (
    <View style={{
      width: "100%",
      height: screenHeight * 0.6,
      backgroundColor: isDarkMode ? "#121212" : "#ffffff",
      borderRadius: 12,
      overflow: "hidden"
    }}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: "https://promodash.vercel.app/captcha.html" }}
        javaScriptEnabled
        onMessage={(event) => {
          const token = event.nativeEvent.data;
          if (token) {
            onVerify(token);
          }
        }}
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
}
