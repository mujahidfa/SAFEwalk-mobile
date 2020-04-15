<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
     <View style={styles.container}>
       <View style={styles.innerContainer}>
         {/* User Start and End Location input fields */}
         <View style={styles.inputContainer}>
           {errors.startLocation && (
             <Text style={style.textError}>Start location is required.</Text>
           )}
           <Input
             inputStyle={styles.inputStyle}
             inputContainerStyle={styles.inputContainerStyleTop}
             containerStyle={styles.containerStyle}
             placeholder="Start Location"
             ref={register({ name: "startLocation" }, { required: true })}
             value={location}
             onChangeText={(text) => {
               changeLocation("start", text);
             }}
             leftIcon={{
               type: "font-awesome",
               name: "map-marker",
             }}
           />
         </View>
         <View style={styles.inputContainer}>
           {errors.endLocation && (
             <Text style={style.textError}>Destination is required.</Text>
         )}
           <Input
               inputStyle={styles.inputStyle}
               inputContainerStyle={styles.inputContainerStyleBottom}
               containerStyle={styles.containerStyle}
               placeholder="Destination"
               ref={register({ name: "endLocation" }, { required: true })}
               value={destination}
               onChangeText={(text) => {
                 changeLocation("end", text);
               }}
               leftIcon={{
                 type: "font-awesome",
                 name: "map-marker",
               }}
           />
         </View>
         {/* Google Map */}
         <MapView style={styles.mapStyle} />
         {/* Button to Submit Request */}
         <View style={styles.buttonContainer}>
           <Button
               title="Request Now"
               onPress={() => addRequest()}
               loading={isLoading}
               disabled={isLoading}
           />
         </View>
       </View>
     </View>
   </TouchableWithoutFeedback>
