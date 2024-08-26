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
      <View className="">
        <View className="px-6 py-12 min-w-full bg-lightWhite rounded-t-3xl shadow-md">
          <Text className="mb-3 font-bold text-center text-xxLarge">Registrate</Text>
          <View className="gap-3">
          <TextInput
            className="px-4 py-3 bg-slate-100 rounded-full"
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
          />
          <TextInput
            className="px-4 py-3 bg-slate-100 rounded-full"
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          <TextInput
            className="px-4 py-3 bg-slate-100 rounded-full"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={true}
          />
          {error && <Text className="text-red font-large font-bold">{error}</Text>}
          <View className="items-center">
            <TouchableOpacity className="px-12 py-2 w-full bg-primary rounded-full" onPress={handleSignUp}>
              <Text className="text-white text-large text-center font-bold">Registrate</Text>
            </TouchableOpacity>
            <Link href="/auth/signin" className="py-2 text-small font-bold">
              ¿Ya tienes una cuenta? Inicia sesion
            </Link>
          </View>
          {loading && (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView >
  );
};

export default SignUp;