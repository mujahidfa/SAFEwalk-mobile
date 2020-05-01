import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { Avatar, Divider } from "react-native-elements";
import { useForm } from "react-hook-form";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { TextInput as RNTextInput } from "react-native-paper";

// Components
import Button from "./../../components/Button";
import TextInput from "./../../components/TextInput";

// Constants
import url from "./../../constants/api";
import colors from "../../constants/colors";
import style from "./../../constants/style";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";

export default function EditProfileScreen() {
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [interests, setInterests] = useState("");
  const [edit, setEdit] = useState(false);

  const { userToken, email, userType } = useContext(AuthContext);

  // forms input handling
  const { register, setValue, handleSubmit, errors } = useForm();

  // update input upon change
  useEffect(() => {
    register("phoneNumber");
  }, [register]);

  // when component is mounted
  useEffect(() => {
    const response = getProfileInfo();
  }, []);

  const getProfileInfo = async () => {
    let user = true;
    let endpoint = "/api/Users/";
    if (userType === "safewalker") {
      endpoint = "/api/Safewalkers/";
      user = false;
    }

    // get info from the database
    const response = await fetch(url + endpoint + email, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        email: email,
        token: userToken,
        isUser: user,
      },
    }).then((response) => {
      if (!(response.status === 200)) {
        console.log("captured " + response.status + "! Try again.");
      } else {
        return response.json();
      }
    });

    // set states to proper values based on backend response
    setFirstName(response.firstName);
    setLastName(response.lastName);
    setPhoneNumber(response.phoneNumber);
    setValue("phoneNumber", response.phoneNumber);
    setImage(response.photo);
    setInterests(response.interest);
  };

  // upon clicking the edit button on the avatar
  const uploadImage = async () => {
    // ask for permission to access camera roll
    await Permissions.askAsync(Permissions.CAMERA_ROLL).catch(function(error) {
      alert(error.message);
    });

    // select the image and size appropriately
    let result = await ImagePicker.launchImageLibraryAsync({
      allowEditing: true,
      aspect: [4, 3],
    });

    // if process has not been canceled, set state image and send to database
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  // for formatting phone number
  const formatPhone = () => {
    return (
      "(" +
      phoneNumber.substring(0, 3) +
      ") " +
      phoneNumber.substring(3, 6) +
      "-" +
      phoneNumber.substring(6, 10)
    );
  };

  // upon clicking save profile information button
  const saveProfileInfo = async (data) => {
    await setPhoneNumber(data.phoneNumber);

    let endpoint = "/api/Users/";
    if (userType === "safewalker") {
      endpoint = "/api/Safewalkers/";
    }
    console.log("Phone number in saveProfileInfo:" + phoneNumber);
    // send new info to the database
    const response = await fetch(url + endpoint + email, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        token: userToken,
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: data.phoneNumber,
        interest: interests,
        photo: image,
      }),
    })
      .then((response) => {
        if (!(response.status === 200)) {
          console.log("captured " + response.status + "! Try again.");
        } else {
          console.log("success!");
          setEdit(false);
        }
      })
      .catch((error) => {
        console.log(error.message);
        //console.log("Error in saving profile information. Please try again.");
      });
  };

  // function that is called after save profile information button is pushed
  const onSubmit = (data) => {
    const response = saveProfileInfo(data);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {!edit ? (
        <ScrollView style={styles.container}>
          <SafeAreaView style={styles.innerContainer}>
            <View
              style={{ alignItems: "center", marginBottom: 40, marginTop: 40 }}
            >
              {/* Fix so avatar does not move when clicking edit button */}
              {!image ? (
                <Avatar
                  rounded
                  accessibilityLabel="NoImageAvatar"
                  size={150}
                  title={firstName[0].toString() + lastName[0].toString()}
                  containerStyle={styles.avatar}
                  overlayContainerStyle={{
                    backgroundColor: colors.medlightgray,
                  }}
                />
              ) : (
                <Avatar
                  rounded
                  accessibilityLabel="ImageAvatar"
                  source={{ uri: image }}
                  size={150}
                  containerStyle={styles.avatar}
                />
              )}
            </View>
            <Divider accessibilityLabel="Divider 1" style={styles.divider} />
            <Text accessibilityLabel="Name" style={styles.text}>
              Name: {firstName + " " + lastName}
            </Text>
            <Divider accessibilityLabel="Divider 2" style={styles.divider} />
            <Text accessibilityLabel="Phone" style={styles.text}>
              Phone Number: {formatPhone()}
            </Text>
            <Divider accessibilityLabel="Divider 3" style={styles.divider} />
            <Text accessibilityLabel="Interests" style={styles.text}>
              Interests: {interests}
            </Text>
            <Divider accessibilityLabel="Divider 4" style={styles.divider} />

            {/* Button to Edit Profile */}
            <View style={styles.buttonContainer}>
              <Button
                accessibilityLabel="EditButton"
                title="Edit"
                onPress={() => setEdit(true)}
              />
            </View>
          </SafeAreaView>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView style={styles.container}>
          <SafeAreaView style={styles.innerContainer}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                marginBottom: 40,
                marginTop: 40,
              }}
            >
              {!image ? (
                <Avatar
                  rounded
                  accessibilityLabel="NoImageAvatarEdit"
                  size={150}
                  title={firstName[0].toString() + lastName[0].toString()}
                  containerStyle={styles.avatar}
                  overlayContainerStyle={{
                    backgroundColor: colors.medlightgray,
                  }}
                  showEditButton
                  onEditPress={() => uploadImage()}
                />
              ) : (
                <Avatar
                  rounded
                  accessibilityLabel="ImageAvatarEdit"
                  source={{ uri: image }}
                  size={150}
                  containerStyle={styles.avatar}
                  showEditButton
                  onEditPress={() => uploadImage()}
                />
              )}
            </View>
            <View style={{ backgroundColor: colors.white }}>
              <TextInput
                label="First Name"
                accessibilityLabel="FirstName"
                defaultValue={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                theme={{ colors: { primary: colors.orange } }}
                style={styles.inputContainer}
              />
              <TextInput
                label="Last Name"
                accessibilityLabel="LastName"
                defaultValue={lastName}
                onChangeText={setLastName}
                mode="outlined"
                theme={{ colors: { primary: colors.orange } }}
                style={styles.inputContainer}
              />

              {errors.phoneNumber && (
                <Text style={style.textError}>
                  Valid US phone number is required.
                </Text>
              )}
              <RNTextInput
                label="Phone Number"
                defaultValue={phoneNumber}
                accessibilityLabel="PhoneNumber"
                ref={register(
                  { name: "phoneNumber" },
                  {
                    required: false,
                    minLength: 10,
                    maxLength: 10,
                    pattern: /^[0-9]+$/,
                  }
                )}
                onChangeText={(text) => setValue("phoneNumber", text, true)}
                mode="outlined"
                theme={{ colors: { primary: colors.orange } }}
                style={styles.inputContainer}
                keyboardType={"numeric"}
              />
              <TextInput
                label="Interests"
                accessibilityLabel="InterestsInput"
                defaultValue={interests}
                placeholder={interests}
                onChangeText={setInterests}
                mode="outlined"
                multiline={true}
                numberOfLines={3}
                theme={{ colors: { primary: colors.orange } }}
                style={styles.inputContainer}
              />

              {/* Button to Edit Profile */}
              <View style={styles.buttonContainer}>
                <Button
                  accessibilityLabel="saveButton"
                  title="Save"
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginHorizontal: style.marginContainerHorizontal,
  },
  contentContainer: {
    flex: 1,
  },
  avatar: {
    marginTop: hp("2.5%"),
    marginBottom: hp("2.5%"),
  },
  text: {
    fontSize: style.fontSize,
    color: colors.gray,
    marginBottom: 20,
    marginLeft: 20,
  },
  divider: {
    backgroundColor: "black",
    marginBottom: 20,
  },
  inputContainer: {
    borderBottomWidth: 0,
    marginBottom: 10,
    height: style.inputHeight,
  },
  buttonContainer: {
    height: hp("20%"),
    justifyContent: "space-around",
  },
});
