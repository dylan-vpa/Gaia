//Expo & React Native
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

//Supabase
import { signOut } from "../../utils/supabase/actions";
import { supabase } from "../../utils/supabase/client";
import { uploadProfilePicture } from "../../utils/supabase/actions";

//Constants
import { colors } from "../../constants";

const Profile = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

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

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      Alert.alert("Success!", "You have successfully signed up!");
      router.replace("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const fileName = uri.split("/").pop();

        console.log("URI seleccionada:", uri);
        console.log("Nombre del archivo:", fileName);

        // Verificar si el archivo existe
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log("Información del archivo:", fileInfo);

        const { data, error } = await uploadProfilePicture(uri, fileName);

        if (error) {
          throw new Error(error);
        }

        if (data && data.publicUrl) {
          setProfilePicture(data.publicUrl);
          Alert.alert("Éxito", "Foto de perfil actualizada");
        } else {
          throw new Error("No se pudo obtener la URL pública de la imagen");
        }
      }
    } catch (error) {
      console.error("Error completo:", error);
      setError(error.message);
      Alert.alert("Error", `No se pudo subir la imagen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex justify-center items-center h-full p-8">
      <Text>Profile</Text>
      {profilePicture && (
        <Image
          source={{ uri: profilePicture }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      <TouchableOpacity
        className="px-12 py-2 w-full bg-secondary rounded-full mt-4"
        onPress={handleUploadPhoto}
      >
        <Text className="text-white text-large text-center font-bold">
          Upload Photo
        </Text>
      </TouchableOpacity>
      {error && <Text className="text-red font-large font-bold">{error}</Text>}
      <TouchableOpacity
        className="px-12 py-2 w-full bg-primary rounded-full"
        onPress={handleSignOut}
      >
        <Text className="text-white text-large text-center font-bold">
          Sign Out
        </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={colors.primary} />}
    </View>
  );
};

export default Profile;
