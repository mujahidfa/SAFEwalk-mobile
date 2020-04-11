import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "./../constants/colors";

export default function SAFEWalkLogo(props) {
  return (
    <View style={styles.logoSAFEwalkContainer}>
      <Text style={styles.logoSAFE}>SAFE</Text>
      <Text style={styles.logoWALK}>walk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoSAFEwalkContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  logoSAFE: {
    fontWeight: "bold",
    fontSize: wp("18%"),
    color: colors.orange,
  },
  logoWALK: {
    fontStyle: "italic",
    fontSize: wp("18%"),
    color: colors.orange,
  },
});
