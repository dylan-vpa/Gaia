import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { createProject } from '../utils/supabase/actions';
import { useRouter } from 'expo-router';

const CreateProject = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleCreateProject = async () => {
    try {
      await createProject(userId, title, description);
      router.back();
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  return (
    <View className="flex-1 p-4">
      <TextInput
        className="bg-white p-2 mb-4 rounded"
        placeholder="Título del proyecto"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-white p-2 mb-4 rounded"
        placeholder="Descripción del proyecto"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity
        onPress={handleCreateProject}
        className="bg-primary p-4 rounded"
      >
        <Text className="text-white font-bold text-center">Crear Proyecto</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateProject;
