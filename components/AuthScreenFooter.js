import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

import colors from "../constants/colors";
import style from "../constants/style";

export default function Footer(props) {
  // props.type
  // props.onPress
  return (
    <View style={styles.footerContainer}>
      {props.type === "signup" ? (
        <>
          <Text style={styles.footerPrompt}>No account? </Text>
          <TouchableOpacity onPress={props.onPress}>
            <Text style={styles.footerClickable}>Sign up!</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.footerPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={props.onPress}>
            <Text style={styles.footerClickable}>Sign in.</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerPrompt: {
    fontSize: style.fontSize,
    color: colors.darkgray,
  },
  footerPromptUserType: {
    fontSize: style.fontSize,
    fontWeight: "bold",
  },
  footerClickable: {
    fontSize: style.fontSize,
    color: colors.darkorange,
    fontWeight: "normal",
  },
});
