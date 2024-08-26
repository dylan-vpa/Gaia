//Expo & React Native
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Modal, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';

//Supabase
import { likePost, deletePost, fetchComments, createComment, deleteComment, fetchProfilePicture, checkLikeExists } from "../../utils/supabase/actions";

//Colors
import { colors } from "../../constants";

const PostCard = ({ post, session, onPostsChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLikedByUser, setIsLikedByUser] = useState(false);

  useEffect(() => {
    const initializeCard = async () => {
      await Promise.all([
        getProfilePicture(),
        checkIfLiked(),
        loadComments()
      ]);
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
    console.log("URL de la imagen en PostCard:", pictureUrl);
    setProfilePicture(pictureUrl);
    setImageError(false);
  }, [post.user_id]);

  const handleImageError = () => {
    console.error("Error al cargar la imagen:", profilePicture);
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

  // Cargar comentarios
  const loadComments = async () => {
    const fetchedComments = await fetchComments(post.id);
    setComments(fetchedComments);
  };

  // Manejar el "Me gusta" del post
  const handleLikePost = async () => {
    try {
      setIsLikedByUser(!isLikedByUser); // Optimistic update
      await likePost(session.user.id, post.id);
      onPostsChange();
    } catch (error) {
      setIsLikedByUser(!isLikedByUser); // Revert if error
      console.error("Error al dar like:", error);
    }
  };

  // Manejar la eliminación del post
  const handleDeletePost = async () => {
    await deletePost(session.user.id, post.id);
    onPostsChange();
  };

  // Manejar la creación de un comentario
  const handleCreateComment = async () => {
    if (newComment.trim() === "") return;
    await createComment(session.user.id, post.id, newComment);
    setNewComment("");
    loadComments();
  };

  // Manejar la eliminación de un comentario
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(session.user.id, commentId);
      // Actualizar la lista de comentarios localmente
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Error al eliminar el comentario:", error);
    }
  };

  return (
    <View className="bg-white p-4 border-b border-slate-200">
      <View className="flex-row items-center mb-2">
        {profilePicture && !imageError ? (
          <Image
            source={{ uri: profilePicture }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            onError={handleImageError}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="gray" />
        )}
        <View className="ml-3">
          <Text className="font-bold">{post.profiles.name}</Text>
          <Text className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text className="mb-4">{post.content}</Text>
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={handleLikePost} className="flex-row items-center">
          <Ionicons 
            name={isLikedByUser ? "heart" : "heart-outline"} 
            size={20} 
            color={isLikedByUser ? colors.primary : "gray"} 
          />
          <Text className="ml-2 text-gray-500">{post.likes_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex-row items-center">
          <Ionicons 
            name={showComments ? "chatbubble" : "chatbubble-outline"} 
            size={20} 
            color={showComments ? colors.primary : "gray"} 
          />
          <Text className="ml-2 text-gray-500">{comments.length}</Text>
        </TouchableOpacity>
        {post.user_id === session?.user?.id && (
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} className="flex-row items-center">
            <Ionicons name="ellipsis-horizontal" size={20} color="gray" />
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
              className="flex-1 border border-gray-300 rounded-full px-4 py-2"
            />
            <TouchableOpacity onPress={handleCreateComment} className="bg-primary rounded-full p-2 ml-2 justify-center">
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
        <View className="flex-1 justify-end bg-transparent bg-opacity-50">
          <View className="bg-white px-4 py-6 rounded-t-lg">
            <TouchableOpacity 
              onPress={handleDeletePost}
              className="py-6 border-b border-slate-200"
            >
              <Text className="text-red-500 text-center">Eliminar publicación</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowDeleteModal(false)}
              className="py-6"
            >
              <Text className="text-primary text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Comment = ({ comment, session, onDeleteComment }) => (
  <View className="mt-2 pb-2 border-b border-gray-100">
    <View className="flex-row justify-between">
      <Text className="font-bold">{comment.profiles.name}</Text>
      {comment.user_id === session?.user?.id && (
        <TouchableOpacity onPress={() => onDeleteComment(comment.id)}>
          <Ionicons name="trash-outline" size={20} color="gray" />
        </TouchableOpacity>
      )}
    </View>
    <Text className="mt-1">{comment.content}</Text>
  </View>
);

export default PostCard;