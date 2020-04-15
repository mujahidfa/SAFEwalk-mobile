import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "react-native-elements";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function UWLogo(props) {
  return (
    <View style={styles.logoUWContainer}>
      <Image
        source={require("./../assets/uw-transportation-logo.png")}
        style={styles.logoUW}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoUWContainer: {
    alignItems: "center",
  },
  logoUW: {
    width: wp("55%"),
    height: hp("2.87%"),
  },
});
