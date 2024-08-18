//Expo & React Native
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react';
import { router } from 'expo-router';

//Supabase
import { signOut } from '../../utils/supabase/actions'

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSignOut = async () => {

    setLoading(true);
    try {
      await signOut();
      Alert.alert('Success!', 'You have successfully signed up!');
      router.replace("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex justify-center items-center h-full p-8">
      <Text>Home</Text>
      {error && <Text className="text-red font-large font-bold">{error}</Text>}
      <TouchableOpacity className="px-12 py-2 w-full bg-primary rounded-xl" onPress={handleSignOut}>
        <Text className="text-white text-large text-center font-bold">Cierra sesion</Text>
      </TouchableOpacity>
      {loading && <Text className="text-primary font-large font-bold">Loading...</Text>}
    </View>
  )
}

export default Home