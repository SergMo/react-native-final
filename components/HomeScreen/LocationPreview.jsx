import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colours } from "../../styles/base";
import { useFonts } from "expo-font";
import StarRating from "react-native-star-rating";

export function LocationPreview({
  name,
  type,
  distance,
  avStars,
  navigation,
  _id,
}) {
  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("SingleLocation", { uid: _id })}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.info}>
          <Text style={styles.text}>
            {type[0].toUpperCase() +
              type.split("").slice(1).join("") +
              `  |  ${distance}km`}
          </Text>
          <View style={styles.starContainer}>
            <StarRating
              disabled={true}
              maxStars={5}
              starSize={18}
              rating={avStars}
              fullStarColor="#FFC033"
              emptyStarColor="#DBDBDB"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 12,
    padding: 10,
    backgroundColor: colours.accent3Weak,
  },
  info: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: colours.text,
    height: 25,
  },
  text: {
    fontSize: 14,
    color: colours.lightText,
    fontFamily: "Poppins-Regular",
  },
  starContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
});
