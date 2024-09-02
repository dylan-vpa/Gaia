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
      <View className="w-full">
        <View className="px-6 py-12 bg-transparent rounded-t-3xl">
          <View className="mb-6 flex gap-3">
            <Text className="font-bold text-center text-3xl text-[#3C3C3C]">
              ¡Aprende mientras juegas, investiga mientras creas!
            </Text>
            <Text className="text-center text-base text-[#777]">
              Regístrate y empieza a aprender sobre nuestros ecosistemas
              mientras interactúas con nuestra comunidad
            </Text>
          </View>
          <View className="mt-6 flex gap-4 items-center">
            <Link
              href="/auth/signup"
              className="w-full bg-[#58CC02] py-3 rounded-xl flex items-center justify-center text-center"
            >
              <Text className="text-white font-bold text-lg">
                Regístrate
              </Text>
            </Link>
            <Link
              href="/auth/signin"
              className="w-full border border-[#58CC02] py-3 rounded-xl flex items-center justify-center text-center"
            >
              <Text className="text-[#58CC02] font-bold text-lg">
                Inicia sesión
              </Text>
            </Link>
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Home;