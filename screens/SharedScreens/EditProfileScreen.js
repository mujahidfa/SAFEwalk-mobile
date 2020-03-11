import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { Avatar, Input, Divider } from "react-native-elements";

export default function EditProfileScreen() {
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("Yoon");
  const [lastName, setLastName] = useState("Cho");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [interests, setInterests] = useState("");
  const [edit, setEdit] = useState(false);

  const uploadImage = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL).catch(function(error) {
      alert(error.message);
    });
    let result = await ImagePicker.launchImageLibraryAsync({
      allowEditing: true,
      aspect: [4, 3]
    });
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  // TODO: ADD React Hook Form see slack
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.containerTop}>
        <Text style={{ marginTop: 30, fontSize: 30, marginBottom: 20 }}>
          Profile
        </Text>
        {image === "" ? (
          <Avatar
            rounded
            size={125}
            title={firstName + " " + lastName}
            overlayContainerStyle={{ backgroundColor: "orange" }}
            titleStyle={{ fontSize: 20 }}
            showEditButton
            onEditPress={() => uploadImage()}
          />
        ) : (
          <Avatar
            rounded
            source={{ uri: image }}
            size={125}
            title={firstName + " " + lastName}
            overlayContainerStyle={{ backgroundColor: "orange" }}
            titleStyle={{ fontSize: 20 }}
            showEditButton
            onEditPress={() => uploadImage()}
          />
        )}
      </View>
      {!edit ? (
        <View style={styles.containerBottom}>
          <Divider style={styles.divider} />
          <Text style={styles.text}>First Name: {firstName}</Text>
          <Text style={styles.text}>Last Name: {lastName}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.text}>Phone Number: {phoneNumber}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.text}>Interests: {interests}</Text>
          <Divider style={styles.divider} />
          <TouchableOpacity onPress={() => setEdit(true)}>
            <Text style={styles.buttonEdit}> Edit Profile Information </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.containerBottom}>
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            leftIcon={{
              type: "font-awesome",
              name: "user"
            }}
          />
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            leftIcon={{
              type: "font-awesome",
              name: "user"
            }}
          />
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            leftIcon={{
              type: "font-awesome",
              name: "phone"
            }}
          />
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            placeholder="Interests"
            value={interests}
            onChangeText={setInterests}
            leftIcon={{
              type: "font-awesome",
              name: "clipboard"
            }}
          />
          <TouchableOpacity onPress={() => setEdit(false)}>
            <Text style={styles.buttonEdit}> Save Profile Information </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    flex: 0.4,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  containerBottom: {
    flex: 1,
    backgroundColor: "#fff"
  },
  buttonEdit: {
    backgroundColor: "orange",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginTop: 20
  },
  input: {
    height: 40,
    width: 20,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 5,
    marginLeft: 20
  },
  inputContainer: {
    borderBottomWidth: 0,
    marginBottom: 20,
    marginTop: 20
  },
  text: {
    fontSize: 25,
    marginBottom: 20,
    marginLeft: 20
  },
  divider: {
    backgroundColor: "black",
    marginBottom: 20
  }
});
