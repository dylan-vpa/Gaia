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
    <View className="bg-white p-4 border-b border-slate-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center">
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
            <Text className="font-bold">You</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(post.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          className="p-2"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <Text className="mb-4">{post.content}</Text>

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
              <Text className="text-red-500 text-center">
                Eliminar publicación
              </Text>
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

export default ProfilePostCard;
