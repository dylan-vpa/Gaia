import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';

const ProjectDetail = ({ projectId, stages, onAddStage }) => {
  const renderStageItem = ({ item }) => (
    <View className="bg-white p-4 mb-2 rounded-lg shadow">
      <Text className="text-lg font-bold">{item.title}</Text>
      <Text className="text-gray-600 mt-1">{item.content}</Text>
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-40 mt-2 rounded"
          resizeMode="cover"
        />
      )}
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={stages}
        renderItem={renderStageItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text className="text-center mt-4">No hay etapas aún.</Text>
        }
      />
      <TouchableOpacity
        onPress={onAddStage}
        className="bg-primary p-4 rounded-full absolute bottom-4 right-4"
      >
        <Text className="text-white font-bold">Agregar Etapa</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProjectDetail;
