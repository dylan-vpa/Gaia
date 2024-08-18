//Expo & React Native
import React, { useState } from 'react';
import { SafeAreaView, ImageBackground, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

//Supabase
import { signInWithEmail } from '../../utils/supabase/actions';

//Constants
import { images } from "../../constants"

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      Alert.alert('Success!', 'You have successfully signed up!');
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
      <View className="m-4">
        <View className="p-6 flex gap-3 min-w-full bg-lightWhite rounded-3xl shadow-md">
          <Text className="font-bold text-center text-xxLarge">Inicia sesion</Text>
          <TextInput
            className="px-4 py-3 bg-slate-100 rounded-xl"
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            autoCompleteType="email"
            keyboardType="email-address"
          />
          <TextInput
            className="px-4 py-3 bg-slate-100 rounded-xl"
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          {error && <Text className="text-red font-large font-bold">{error}</Text>}
          <View className="flex- items-center">
            <TouchableOpacity className="px-12 py-2 w-full bg-primary rounded-xl" onPress={handleSignIn}>
              <Text className="text-white text-large text-center font-bold">Inicia sesion</Text>
            </TouchableOpacity>
            <Link href="/auth/signup" className="py-2 text-small font-bold">
              ¿No tienes una cuenta? Registrate
            </Link>
          </View>
          {loading && <Text className="text-primary font-large font-bold">Loading...</Text>}
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView >
  );
};


export default SignIn;