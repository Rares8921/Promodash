import React, { useEffect } from "react";
import { View, Image, StyleSheet, StatusBar } from "react-native";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export default function SplashScreen() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 3000, easing: Easing.out(Easing.exp) });
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 2500, easing: Easing.ease });
    }, 5000);

  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image source={require("../assets/images/un.png")} style={styles.logo} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: [{ translateX: -96 }, { translateY: -90 }],
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});