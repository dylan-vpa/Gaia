//Expo & React Native
import React, { useState } from "react";
import {
  SafeAreaView,
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native";

//Supabase
import { signInWithEmail } from "../../utils/supabase/actions";

//Constants
import { images, colors } from "../../constants";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      Alert.alert("Success!", "You have successfully signed up!");
      router.replace("/pages/home");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-end items-center">
      <ImageBackground
        source={images.WelcomeBg}
        className="w-full h-full absolute"
        resizeMode="cover"
      />
      <View className="w-full">
        <View className="px-6 py-12 bg-transparent rounded-t-3xl">
          <Text className="mb-6 font-bold text-center text-3xl text-[#3C3C3C]">
            Inicia sesión
          </Text>
          <View className="gap-4">
            <TextInput
              className="px-4 py-3 bg-[#F7F7F7] rounded-xl"
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="email-address"
            />
            <TextInput
              className="px-4 py-3 bg-[#F7F7F7] rounded-xl"
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
            />
            {error && (
              <Text className="text-red-500 text-center font-bold">{error}</Text>
            )}
            <View className="items-center gap-4">
              <TouchableOpacity
                className="w-full bg-[#58CC02] py-3 rounded-xl"
                onPress={handleSignIn}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
              <Link href="/auth/signup" className="text-[#58CC02] font-bold">
                ¿No tienes una cuenta? Regístrate
              </Link>
            </View>
            {loading && <ActivityIndicator size="large" color="#58CC02" />}
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default SignIn;
