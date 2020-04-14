return (
  <View style={{ flex: 1 }}>
    {/* Conditional Statement Based on if the User has made a Request */}
    {!request ? (
      <View style={styles.container}>
        {/* User Start and End Location Input Fields */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.mapStyle}
          showsUserLocation={true}
          ref={mapRef}
          minZoomLevel={10}
          maxZoomLevel={15}
          onMapReady={onMapReady}
        >
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainerTop}
            value={start.text}
            onChangeText={onStartTextChange}
            onSubmitEditing={updateStart}
            placeholder='Start'
            returnKeyType='search'
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
            rightIcon={{
              type: "font-awesome",
              name: "location-arrow",
              onPress: console.log("pressed icon")
            }}
          />
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            value={destination.text}
            onChangeText={onDestinationTextChange}
            onSubmitEditing={updateDestination}
            placeholder='Destination'
            returnKeyType='search'
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
            rightIcon={{
              type: "font-awesome",
              name: "home",
            }}
          />
          <Text>  ETA: {eta}</Text>
          {markers.map((marker) => (
            <MapView.Marker
              key={marker.key}
              coordinate={{
                latitude: marker.coordinates.latitude,
                longitude: marker.coordinates.longitude
              }}
              title={marker.title}
              pinColor={pinColor[marker.key]}
            />
          ))}
        </MapView>
        <TouchableOpacity onPress={() => {navigator.geolocation.getCurrentPosition(showLocation);currentAsStart()}}>
          <Text style={styles.buttonCurrent}> Set Start to Current </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => homeAsDest()}>
          <Text style={styles.buttonCurrent}> Set Home to Dest. </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {getEta(); mapRef.current.fitToElements()}}>
          <Text style={styles.buttonConfirm}> ETA </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addRequest()}>
          <Text style={styles.buttonRequest}> Request SAFEwalk </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={styles.container}>
        {/* View When the User Submits a SAFEwalk Request */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            color: colors.orange,
            fontWeight: "bold"
          }}
        >
          Searching for {"\n"} SAFEwalker...
        </Text>
        <Icon
          type="font-awesome"
          name="hourglass"
          color={colors.orange}
          size={80}
          iconStyle={{ marginBottom: 100 }}
        />
        <TouchableOpacity onPress={() => cancelRequest()}>
          <Text style={styles.buttonCancel}> Cancel </Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);
