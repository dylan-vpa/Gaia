import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { addProjectStage } from '../utils/supabase/actions';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const AddProjectStage = ({ projectId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleAddStage = async () => {
    try {
      await addProjectStage(projectId, title, content, image);
      router.back();
    } catch (error) {
      console.error('Error al agregar etapa:', error);
    }
  };

  return (
    <View className="flex-1 p-4">
      <TextInput
        className="bg-white p-2 mb-4 rounded"
        placeholder="Título de la etapa"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-white p-2 mb-4 rounded"
        placeholder="Contenido de la etapa"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity onPress={pickImage} className="mb-4">
        <Text className="text-primary font-bold">Seleccionar Imagen</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} className="w-full h-40 mb-4 rounded" />}
      <TouchableOpacity
        onPress={handleAddStage}
        className="bg-primary p-4 rounded"
      >
        <Text className="text-white font-bold text-center">Agregar Etapa</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddProjectStage;
