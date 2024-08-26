//Expo & React Native
import React, { useState, useEffect, useCallback } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

//Components
import Header from "../../components/ui/Header";
import PostCard from "../../components/ui/PostCard";

//Supabase
import { checkSession, fetchPosts, createPost } from "../../utils/supabase/actions";

// Componente principal Home
const Home = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Función para cargar las publicaciones
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Función para inicializar la página de inicio
    const initializeHome = async () => {
      const currentSession = await checkSession();
      setSession(currentSession);
      if (!currentSession) {
        router.replace("/login");
      } else {
        await loadPosts();
      }
    };
    initializeHome();
  }, [loadPosts]);

  // Función para manejar la creación de una nueva publicación
  const handleCreatePost = async () => {
    if (newPost.trim() === "" || !session) return;
    await createPost(session.user.id, newPost);
    setNewPost("");
    loadPosts();
  };

  // Función para renderizar cada tarjeta de publicación
  const renderPostCard = useCallback(({ item }) => (
    <PostCard
      post={item}
      session={session}
      onPostsChange={loadPosts}
    />
  ), [session, loadPosts]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header />
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadPosts}
      />
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 bg-primary rounded-full p-4"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-transparent bg-opacity-50">
          <View className="bg-white px-6 py-12 rounded-t-3xl">
            <TextInput
              value={newPost}
              onChangeText={setNewPost}
              placeholder="¿Qué está pasando?"
              multiline
              className="border-b border-slate-200 pb-2 text-medium"
            />
            <View className="flex-row justify-end items-center mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mr-4"
              >
                <Text className="text-gray-500 font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCreatePost();
                  setModalVisible(false);
                }}
                className="bg-primary rounded-full px-4 py-2"
              >
                <Text className="text-white font-bold">Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;