import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function LoadingScreen() {
  return (
    <View style={[styles.container, styles.horizontal]}>
      <LottieView
        source={require("./../../assets/app-boot-loading")}
        speed={1}
        autoPlay={true}
        loop
        autoSize={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
});
