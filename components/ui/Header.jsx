//Expo & React Native
import { useState, useEffect, useCallback } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

//Supabase
import { fetchProfilePicture } from "../../utils/supabase/actions";

const Header = () => {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);

  const getProfilePicture = useCallback(async () => {
    const pictureUrl = await fetchProfilePicture();
    console.log("URL de la imagen en Header:", pictureUrl);
    setProfilePicture(pictureUrl);
    setImageError(false);
  }, []);

  useEffect(() => {
    getProfilePicture();
  }, []);

  const handleImageError = () => {
    console.error("Error al cargar la imagen:", profilePicture);
    setImageError(true);
  };

  return (
    <View className="flex-row justify-between items-center pt-12 px-4 bg-white">
      <TouchableOpacity onPress={() => router.push("./profile")}>
        {profilePicture && !imageError ? (
          <Image
            source={{ uri: profilePicture }}
            className="w-10 h-10 rounded-full"
            onError={handleImageError}
            onLoad={() => console.log("Imagen cargada correctamente")}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="gray" />
        )}
      </TouchableOpacity>

      <Image
        source={require("../../assets/logo.png")}
        className="w-8 h-8 resizeMode-contain"
      />

      <Ionicons name="settings-outline" size={24} color="black" />
    </View>
  );
};

export default Header;
