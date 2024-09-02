//Expo & React Native
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";

//Supabase
import {
  likePost,
  deletePost,
  fetchComments,
  createComment,
  deleteComment,
  fetchProfilePicture,
  checkLikeExists,
} from "../../utils/supabase/actions";

//Colors
import { colors } from "../../constants";

const PostCard = ({ post, session, onPostsChange, isOwnPost }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLikedByUser, setIsLikedByUser] = useState(false);

  useEffect(() => {
    const initializeCard = async () => {
      await Promise.all([getProfilePicture(), checkIfLiked(), loadComments()]);
    };

    initializeCard();
  }, []);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const getProfilePicture = useCallback(async () => {
    const pictureUrl = await fetchProfilePicture(post.user_id);
    setProfilePicture(pictureUrl);
    setImageError(false);
  }, [post.user_id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const checkIfLiked = async () => {
    try {
      const hasLiked = await checkLikeExists(session.user.id, post.id);
      setIsLikedByUser(hasLiked);
    } catch (error) {
      console.error("Error al verificar el like:", error);
    }
  };

  const loadComments = async () => {
    const fetchedComments = await fetchComments(post.id);
    setComments(fetchedComments);
  };

  const handleLikePost = async () => {
    try {
      setIsLikedByUser(!isLikedByUser);
      await likePost(session.user.id, post.id);
      onPostsChange();
    } catch (error) {
      setIsLikedByUser(!isLikedByUser);
      console.error("Error al dar like:", error);
    }
  };

  const handleDeletePost = async () => {
    await deletePost(session.user.id, post.id);
    onPostsChange();
  };

  const handleCreateComment = async () => {
    if (newComment.trim() === "") return;
    await createComment(session.user.id, post.id, newComment);
    setNewComment("");
    loadComments();
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(session.user.id, commentId);
      // Actualizar la lista de comentarios localmente
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error al eliminar el comentario:", error);
    }
  };

  const handleLongPress = () => {
    if (isOwnPost) {
      // Mostrar opción de borrar solo si es el post del usuario
      Alert.alert(
        "Borrar post",
        "¿Estás seguro de que quieres borrar este post?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Borrar", 
            onPress: handleDeletePost,
            style: "destructive"
          }
        ]
      );
    }
  };

  return (
    <TouchableOpacity 
      onLongPress={handleLongPress}
      className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-slate-200"
    >
      <View className="flex-row items-center mb-2">
        {profilePicture && !imageError ? (
          <Image
            source={{ uri: profilePicture }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            onError={handleImageError}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#58CC02" />
        )}
        <View className="ml-3">
          <Text className="font-bold text-[#3C3C3C]">{post.profiles.name}</Text>
          <Text className="text-[#777] text-sm">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text className="mb-4 text-[#3C3C3C]">{post.content}</Text>
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={handleLikePost}
          className="flex-row items-center"
        >
          <Ionicons
            name={isLikedByUser ? "heart" : "heart-outline"}
            size={20}
            color={isLikedByUser ? "#58CC02" : "#777"}
          />
          <Text className="ml-2 text-[#777]">{post.likes_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowComments(!showComments)}
          className="flex-row items-center"
        >
          <Ionicons
            name={showComments ? "chatbubble" : "chatbubble-outline"}
            size={20}
            color={showComments ? "#58CC02" : "#777"}
          />
          <Text className="ml-2 text-[#777]">{comments.length}</Text>
        </TouchableOpacity>
        {post.user_id === session?.user?.id && (
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="flex-row items-center"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>
      {showComments && (
        <View className="mt-4">
          <FlatList
            data={comments}
            renderItem={({ item }) => (
              <Comment
                comment={item}
                session={session}
                onDeleteComment={handleDeleteComment}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <View className="flex-row mt-2">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Escribe un comentario..."
              className="flex-1 border border-[#E5E5E5] rounded-full px-4 py-2"
            />
            <TouchableOpacity
              onPress={handleCreateComment}
              className="bg-[#58CC02] rounded-full p-2 ml-2 justify-center"
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-end bg-transparent">
          <View className="bg-white px-4 py-6 rounded-t-3xl">
            <TouchableOpacity
              onPress={handleDeletePost}
              className="py-6 border-b border-slate-200"
            >
              <Text className="text-red-500 text-center font-bold">
                Eliminar publicación
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              className="py-6"
            >
              <Text className="text-[#58CC02] text-center font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const Comment = ({ comment, session, onDeleteComment }) => (
  <View className="mt-2 pb-2 border-b border-slate-200">
    <View className="flex-row justify-between">
      <Text className="font-bold text-[#3C3C3C]">{comment.profiles.name}</Text>
      {comment.user_id === session?.user?.id && (
        <TouchableOpacity onPress={() => onDeleteComment(comment.id)}>
          <Ionicons name="trash-outline" size={20} color="#777" />
        </TouchableOpacity>
      )}
    </View>
    <Text className="mt-1 text-[#3C3C3C]">{comment.content}</Text>
  </View>
);

export default PostCard;