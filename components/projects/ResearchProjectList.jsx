import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const ResearchProjectList = ({ projects, onSelectProject }) => {
  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onSelectProject(item.id)}
      className="bg-white p-4 mb-2 rounded-lg shadow"
    >
      <Text className="text-lg font-bold">{item.title}</Text>
      <Text className="text-gray-600 mt-1">{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={projects}
      renderItem={renderProjectItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <Text className="text-center mt-4">No hay proyectos aún.</Text>
      }
    />
  );
};

export default ResearchProjectList;
