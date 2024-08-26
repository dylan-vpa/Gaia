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
      <View className="">
        <View className="px-6 py-12 min-w-full bg-lightWhite rounded-t-3xl shadow-md">
          <Text className="mb-3 font-bold text-center text-xxLarge">
            Inicia sesion
          </Text>
          <View className="gap-3">
            <TextInput
              className="px-4 py-3 bg-slate-100 rounded-full"
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="email-address"
            />
            <TextInput
              className="px-4 py-3 bg-slate-100 rounded-full"
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
            />
            {error && (
              <Text className="text-red font-large font-bold">{error}</Text>
            )}
            <View className="flex- items-center">
              <TouchableOpacity
                className="px-12 py-2 w-full bg-primary rounded-full"
                onPress={handleSignIn}
              >
                <Text className="text-white text-large text-center font-bold">
                  Inicia sesion
                </Text>
              </TouchableOpacity>
              <Link href="/auth/signup" className="py-2 text-small font-bold">
                ¿No tienes una cuenta? Registrate
              </Link>
            </View>
            {loading && <ActivityIndicator size="large" color={colors.primary} />}
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default SignIn;
