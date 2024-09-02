//Expo & React Native
import { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

//Components
import Header from "../../components/ui/Header";
import PostCard from "../../components/ui/PostCard";

//Supabase
import {
  checkSession,
  fetchPosts,
  createPost,
} from "../../utils/supabase/actions";

const Home = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts);
    setLoading(false);
  }, []);

  useEffect(() => {
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

  const handleCreatePost = async () => {
    if (newPost.trim() === "" || !session) return;
    await createPost(session.user.id, newPost);
    setNewPost("");
    loadPosts();
  };

  const renderPostCard = useCallback(
    ({ item }) => (
      <PostCard 
        post={item} 
        session={session} 
        onPostsChange={loadPosts} 
        isOwnPost={item.user_id === session?.user?.id}
      />
    ),
    [session, loadPosts]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#58CC02" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadPosts}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      />
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 bg-[#58CC02] rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-transparent">
          <View className="bg-white px-6 py-12 rounded-t-3xl">
            <TextInput
              value={newPost}
              onChangeText={setNewPost}
              placeholder="¿Qué está pasando?"
              multiline
              className="border-b border-slate-200 pb-2 text-lg"
            />
            <View className="flex-row justify-end items-center mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mr-4"
              >
                <Text className="text-[#3C3C3C] font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCreatePost();
                  setModalVisible(false);
                }}
                className="bg-[#58CC02] rounded-2xl px-6 py-3"
              >
                <Text className="text-white font-bold">Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Home;
