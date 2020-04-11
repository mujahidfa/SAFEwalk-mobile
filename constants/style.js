import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "./colors";

const style = {
  marginContainerHorizontal: wp("10%"),
  buttonFontSize: hp("2%"),
  buttonHeight: hp("6%"),
  inputHeight: hp("6%"),
  textError: {
    color: colors.red,
    fontSize: hp("1.5%"),
  },
  fontSize: wp("4.5%"),
};

export default style;
