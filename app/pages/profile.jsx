import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../utils/supabase/client";
import { signOut, uploadProfilePicture, fetchProjects, fetchPosts, updateUserProfile, fetchUserProfile } from "../../utils/supabase/actions";
import { colors } from "../../constants";
import ProfilePostCard from "../../components/ui/ProfilePostCard";
import { StatusBar } from "expo-status-bar";

const EditProfileModal = ({ visible, onClose, onUpdateProfile, currentUser, currentProfilePicture, onUpdatePhoto }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        await onUpdatePhoto(uri);
      }
    } catch (error) {
      console.error("Error al seleccionar la imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleSubmit = () => {
    const updatedData = {};
    if (name !== currentUser?.name) updatedData.name = name;
    if (email !== currentUser?.email) updatedData.email = email;
    if (password) updatedData.password = password;

    if (Object.keys(updatedData).length > 0) {
      onUpdateProfile(updatedData);
    } else {
      Alert.alert("Información", "No se han realizado cambios");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white">
        <View className="flex-1 p-4">
          <Text className="text-2xl font-bold mb-4">Editar Perfil</Text>
          
          <View className="items-center mb-4">
            <Image
              source={{ uri: currentProfilePicture }}
              className="w-24 h-24 rounded-full mb-2"
            />
            <TouchableOpacity onPress={handleImagePick}>
              <Text className="text-primary font-bold">Cambiar foto de perfil</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="px-4 py-3 bg-slate-200 rounded-full mb-4"
            placeholder="Nuevo nombre"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            className="px-4 py-3 bg-slate-200 rounded-full mb-4"
            placeholder="Nuevo correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            className="px-4 py-3 bg-slate-200 rounded-full mb-4"
            placeholder="Nueva contraseña (dejar en blanco para no cambiar)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View className="p-4">
          <TouchableOpacity
            className="bg-primary p-4 rounded-full mb-2"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-center">Guardar cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-full border border-primary"
            onPress={onClose}
          >
            <Text className="text-primary font-bold text-center">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Profile = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userName, setUserName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
        fetchUserProjects(session.user.id);
        fetchUserPosts(session.user.id);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
        fetchUserProjects(session.user.id);
        fetchUserPosts(session.user.id);
      }
    });
  }, []);

  const loadUserProfile = async (userId) => {
    const profile = await fetchUserProfile(userId);
    if (profile) {
      setUserName(profile.name || '');
      setProfilePicture(profile.avatar_url);
    }
  };

  const fetchUserProjects = async (userId) => {
    const projectData = await fetchProjects(userId);
    setProjects(projectData);
  };

  const fetchUserPosts = async (userId) => {
    const postData = await fetchPosts();
    setPosts(postData.filter(post => post.user_id === userId));
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      Alert.alert("Éxito", "Has cerrado sesión correctamente");
      router.replace("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (uri) => {
    setLoading(true);
    try {
      const { data, error } = await uploadProfilePicture(uri);

      if (error) {
        throw new Error(error);
      }

      if (data && data.publicUrl) {
        setProfilePicture(data.publicUrl);
        Alert.alert("Éxito", "Foto de perfil actualizada");
      } else {
        throw new Error("No se pudo obtener la URL pública de la imagen");
      }
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      Alert.alert("Error", `No se pudo actualizar la foto de perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const result = await updateUserProfile(session.user.id, updatedData);
      if (result.success) {
        Alert.alert("Éxito", "Perfil actualizado correctamente");
        setModalVisible(false);
        loadUserProfile(session.user.id);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Alert.alert("Error", `No se pudo actualizar el perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProjects = () => (
    <View>
      <Text className="text-2xl font-bold mb-4 text-[#333]">Proyectos</Text>
      {projects.map((item) => (
        <TouchableOpacity
          key={item.id.toString()}
          className="bg-white p-4 mb-4 border-b border-slate-200"
          onPress={() => {/* Manejar la selección del proyecto */}}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-200 rounded-lg mr-4 flex items-center justify-center">
              <Text className="text-2xl font-bold text-blue-500">{item.title[0].toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-[#333]">{item.title}</Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>{item.description || 'Sin descripción'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {projects.length === 0 && (
        <View className="bg-white p-6 rounded-xl border border-slate-200">
          <Text className="text-center text-lg text-gray-500">
            No hay proyectos disponibles.
          </Text>
        </View>
      )}
    </View>
  );

  const renderPosts = () => (
    <View>
      <Text className="text-2xl font-bold mb-4 mt-6 text-[#333]">Publicaciones</Text>
      {posts.map((item) => (
        <ProfilePostCard
          key={item.id.toString()}
          post={item}
          session={session}
          onPostsChange={() => fetchUserPosts(session.user.id)}
        />
      ))}
      {posts.length === 0 && (
        <View className="bg-white p-6 rounded-xl border border-slate-200">
          <Text className="text-center text-lg text-gray-500">
            No hay publicaciones disponibles.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-4">
            <View className="flex-row items-center mb-6 mt-4">
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  className="w-20 h-20 rounded-full mr-4"
                />
              ) : (
                <Ionicons name="person-circle-outline" size={80} color="#58CC02" className="mr-4" />
              )}
              <View className="flex-1">
                <Text className="text-2xl font-bold text-[#333]">{userName}</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(true)}
                  className="bg-[#E5E5E5] px-4 py-2 rounded-2xl mt-2 flex-row items-center justify-center"
                >
                  <Text className="text-[#58CC02] font-bold text-center mr-2">Editar Perfil</Text>
                  <Ionicons name="pencil" size={16} color="#58CC02" />
                </TouchableOpacity>
              </View>
            </View>

            {renderProjects()}
            {renderPosts()}

            {error && <Text className="text-red-500 font-bold mt-2">{error}</Text>}
            {loading && <ActivityIndicator size="large" color="#58CC02" className="mt-2" />}
          </View>
        </ScrollView>

        {/* Botón de cerrar sesión fijo en la parte inferior */}
        <View className="p-4 bg-white border-t border-slate-200">
          <TouchableOpacity
            className="bg-[#58CC02] p-4 rounded-2xl flex-row items-center justify-center"
            onPress={handleSignOut}
          >
            <Text className="text-white font-bold text-center mr-2">Cerrar Sesión</Text>
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpdateProfile={handleUpdateProfile}
        currentUser={{ name: userName, email: session?.user?.email }}
        currentProfilePicture={profilePicture}
        onUpdatePhoto={handleUploadPhoto}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Profile;
