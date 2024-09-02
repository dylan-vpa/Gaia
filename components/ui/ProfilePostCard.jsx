import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  deletePost,
  fetchProfilePicture,
} from "../../utils/supabase/actions";

import { colors } from "../../constants";

const ProfilePostCard = ({ post, session, onPostsChange }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getProfilePicture();
  }, []);

  const getProfilePicture = useCallback(async () => {
    const pictureUrl = await fetchProfilePicture(post.user_id);
    setProfilePicture(pictureUrl);
    setImageError(false);
  }, [post.user_id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDeletePost = async () => {
    await deletePost(session.user.id, post.id);
    onPostsChange();
  };

  return (
    <TouchableOpacity 
      onLongPress={() => setShowDeleteModal(true)}
      className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-slate-200"
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          {profilePicture && !imageError ? (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              onError={handleImageError}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#58CC02" />
          )}
          <Text className="ml-3 text-[#777] text-sm">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          className="p-2"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#777" />
        </TouchableOpacity>
      </View>
      <Text className="text-[#3C3C3C]">{post.content}</Text>

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

export default ProfilePostCard;
