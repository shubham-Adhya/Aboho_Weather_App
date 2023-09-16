import React, { useCallback, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme/index.js";
import { fetchLocations, fetchWeatherForecast } from "../api/weather.js";
import { storeData, getData } from "../utils/asyncStorage.js";
import { debounce } from "lodash";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { MapPinIcon, CalendarDaysIcon } from "react-native-heroicons/solid";
import { weatherImages } from "../constants/index.js";
import * as Progress from "react-native-progress";

const HomeScreen = () => {
  const windowHeight = useWindowDimensions().height;
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };
  const handleSearch = (searchText) => {
    if (searchText.length > 2) {
      fetchLocations({ cityName: searchText }).then((data) => {
        setLocations(data);
      });
    }
  };
  useEffect(() => {
    fetchMyWeatherData();
  }, []);
  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Kolkata";
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // enabled={false}
      className="flex-1"
    >

        <View
          className="flex-1 relative h-full"
          style={[{ minHeight: Math.round(windowHeight) }]}
        >
          <StatusBar style="light" />
          <Image
            blurRadius={70}
            source={require("../assets/images/bg.png")}
            className="absolute h-full w-full"
          />
          {loading ? (
            <View className="flex-1 flex-row justify-center items-center">
              <Progress.CircleSnail thickness={10} size={140} color="white" />
            </View>
          ) : (
            <SafeAreaView className="flex flex-1">
              {/* screen section */}
              <View style={{ height: "7%" }} className="mx-4 relative z-50">
                <View
                  style={{
                    backgroundColor: showSearch
                      ? theme.bgWhite(0.2)
                      : "transparent",
                  }}
                  className="flex-row justify-end items-center rounded-full"
                >
                  {showSearch && (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder="Search city"
                      placeholderTextColor={"lightgray"}
                      className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => setShowSearch(!showSearch)}
                    style={{ backgroundColor: theme.bgWhite(0.3) }}
                    className="rounded-full p-3 m-1"
                  >
                    {showSearch ? (
                      <XMarkIcon size="25" color="white" />
                    ) : (
                      <MagnifyingGlassIcon size="25" color="white" />
                    )}
                  </TouchableOpacity>
                </View>
                {locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                    {locations.map((loc, index) => {
                      let showBorder = index + 1 != locations.length;
                      let borderClass = showBorder
                        ? "border-b-2 border-b-gray-400"
                        : "";
                      return (
                        <TouchableOpacity
                          onPress={() => handleLocation(loc)}
                          key={index}
                          className={
                            "flex-row items-center border-0 p-3 px-4 mb-1 " +
                            borderClass
                          }
                        >
                          <MapPinIcon size={20} color={"gray"} />
                          <Text className="text-black text-lg ml-2">
                            {loc?.name},{loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
              {/* forcast section  */}
              <View className="mx-4 flex justify-around flex-1 mb-2 relative">
                {/* location  */}
                <Text className="text-white text-center text-2xl font-bold">
                  {location?.name},
                  <Text className="text-lg font-semibold text-gray-300">
                    &nbsp;{location?.country}
                  </Text>
                </Text>

                {/* weather image  */}
                <View className="flex-row justify-center">
                  <Image
                    // source={{
                    //   uri:
                    //     "http:"+current?.condition.icon?.replace("64x64", "128x128"),
                    // }}
                    source={weatherImages[current?.condition.text]}
                    className="w-52 h-52"
                  />
                </View>

                {/* degree celcius  */}
                <View className="space-y-2">
                  <Text className="text-center font-bold text-white text-6xl ml-5">
                    {current?.temp_c}&#176;
                  </Text>
                  <Text className="text-center text-white text-xl tracking-widest">
                    {current?.condition.text}
                  </Text>
                </View>

                {/* other stats  */}
                <View className="flex-row justify-between mx-4">
                  <View className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/icons/wind.png")}
                      className="h-6 w-6"
                    />
                    <Text className="text-white font-semibold text-base">
                      {current?.wind_kph} kph
                    </Text>
                  </View>
                  <View className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/icons/drop.png")}
                      className="h-6 w-6"
                    />
                    <Text className="text-white font-semibold text-base">
                      {current?.humidity} %
                    </Text>
                  </View>
                  <View className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/icons/sun.png")}
                      className="h-6 w-6"
                    />
                    <Text className="text-white font-semibold text-base">
                      {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                    </Text>
                  </View>
                </View>

                {/* forecast for next days */}
                <View className="mb-2 space-y-3">
                  <View className="flex-row items-center mx-5 space-x-2">
                    <CalendarDaysIcon size="22" color="white" />
                    <Text className="text-white text-base">Daily forecast</Text>
                  </View>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    showsHorizontalScrollIndicator={true}
                  >
                    {weather?.forecast?.forecastday?.map((item, index) => {
                      let date = new Date(item.date);
                      let options = { weekday: "long" };
                      let dayName = date.toLocaleDateString("en-US", options);
                      dayName = dayName.split(",")[0];
                      return (
                        <View
                          key={index}
                          className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                          style={{ backgroundColor: theme.bgWhite(0.15) }}
                        >
                          <Image
                            source={weatherImages[item.day?.condition.text]}
                            className="h-11 w-11"
                          />
                          <Text className="text-white">{dayName}</Text>
                          <Text className="text-white text-xl font-semibold">
                            {item.day?.avgtemp_c}&#176;
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </SafeAreaView>
          )}
        </View>

    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
