// Expo & React Native
import React, { useState } from 'react';
import { SafeAreaView, ImageBackground, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';

// Supabase
import { signUpWithEmail } from '../../utils/supabase/actions';

// Constants
import { images, colors } from "../../constants"

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
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
      <View className="w-full">
        <View className="px-6 py-12 bg-transparent rounded-t-3xl">
          <Text className="mb-6 font-bold text-center text-3xl text-[#3C3C3C]">Regístrate</Text>
          <View className="gap-4">
            <TextInput
              className="px-4 py-3 bg-[#F7F7F7] rounded-xl"
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
            />
            <TextInput
              className="px-4 py-3 bg-[#F7F7F7] rounded-xl"
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
            />
            <TextInput
              className="px-4 py-3 bg-[#F7F7F7] rounded-xl"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={true}
            />
            {error && <Text className="text-red-500 text-center font-bold">{error}</Text>}
            <View className="items-center gap-4">
              <TouchableOpacity 
                className="w-full bg-[#58CC02] py-3 rounded-xl" 
                onPress={handleSignUp}
              >
                <Text className="text-white text-center font-bold text-lg">Registrarse</Text>
              </TouchableOpacity>
              <Link href="/auth/signin" className="text-[#58CC02] font-bold">
                ¿Ya tienes una cuenta? Inicia sesión
              </Link>
            </View>
            {loading && (
              <ActivityIndicator size="large" color="#58CC02" />
            )}
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default SignUp;