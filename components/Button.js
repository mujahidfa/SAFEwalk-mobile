import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-elements";

import colors from "./../constants/colors";
import style from "./../constants/style";

export default function WrapperButton(props) {
  return (
    <Button
      accessibilityLabel={props.accessibilityLabel}
      title={props.title}
      loading={props.loading}
      disabled={props.disabled}
      onPress={props.onPress}
      buttonStyle={[
        styles.buttonDimensions,
        props.color === "red"
          ? styles.buttonColorRed
          : styles.buttonColorOrange,
        props.type === "outline" ? styles.buttonTypeOutline : "",
        props.buttonStyle,
      ]}
      titleStyle={[
        styles.buttonTitle,
        props.type === "outline" ? styles.buttonTitleOutline : "",
        props.titleStyle,
      ]}
      containerStyle={props.containerStyle}
      type={props.type}
    />
  );
}

const styles = StyleSheet.create({
  /* Generic styles */
  buttonDimensions: {
    height: style.buttonHeight,
    borderRadius: 5,
  },
  buttonTitle: {
    fontSize: style.buttonFontSize,
  },

  /* Specific button color styles according to type prop */
  buttonColorRed: {
    backgroundColor: colors.red,
  },
  buttonColorOrange: {
    backgroundColor: colors.orange,
  },

  /* Specific button container styles according to type prop */
  buttonTypeOutline: {
    borderColor: colors.darkorange,
    borderWidth: 1,
    backgroundColor: "transparent",
  },

  /* Specific button title styles according to type prop */
  buttonTitleOutline: {
    fontSize: style.buttonFontSize,
    color: colors.darkorange,
  },
});
