import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "react-native-elements";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "../constants/colors";

export default function SAFEwalkLogo() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("./../assets/safewalk-logo.png")}
        style={styles.logo}
        accessibilityLabel="logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: wp("70%"), //280,
    height: wp("21.4%"), //85,
  },
  logoSAFEwalkContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  logoSAFE: {
    fontWeight: "bold",
    fontSize: wp("15%"),
    color: colors.orange,
    lineHeight: 80,
  },
  logoWALK: {
    fontStyle: "italic",
    fontSize: wp("15%"),
    color: colors.orange,
    lineHeight: 80,
  },
  logoFooter: {
    alignSelf: "flex-start",
  },
});
