// Expo & React Native
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, SafeAreaView, ImageBackground } from "react-native";
import { useState, useEffect } from "react";

//Supabase
import { supabase } from "../utils/supabase/client";
import { Session } from "@supabase/supabase-js";

//Constants
import { images } from "../constants";

const Home = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session) {
        router.replace("/pages/home");
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        router.replace("/pages/home");
      }
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 justify-end items-center">
      <ImageBackground
        source={images.WelcomeBg}
        className="w-full h-full absolute"
        resizeMode="cover"
      />
      <View className="">
        <View className="px-6 py-12 min-w-full bg-lightWhite rounded-t-3xl shadow-md">
          <View className="mb-6 flex gap-3">
            <Text className="font-bold text-center text-xxLarge">
              ¡Aprende mientras juegas, investiga mientras creas!
            </Text>
            <Text className="text-gray-600 text-center text-medium text-gray">
              Registrate y empieza a aprender sobre nuestros ecosistemas
              mientras e interactuas con nuestra comudidad
            </Text>
          </View>
          <View className="mt-6 flex gap-2 items-center">
            <Link
              href="/auth/signup"
              className="px-12 py-2 w-11/12 bg-primary text-white rounded-xl text-large text-center font-bold rounded-full"
            >
              Registrate
            </Link>
            <Link href="/auth/signin" className="text-large font-bold">
              Inicia sesion
            </Link>
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Home;
