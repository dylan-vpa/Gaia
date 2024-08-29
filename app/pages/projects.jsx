import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Modal, ActivityIndicator, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/Header';
import { checkSession, fetchProjects, createProject, fetchProjectStages, addProjectStage } from '../../utils/supabase/actions';
import * as ImagePicker from 'expo-image-picker';

const ResearchProjectsScreen = () => {
  const [session, setSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageContent, setNewStageContent] = useState('');
  const [newStageImage, setNewStageImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!session || !session.user) return;
    try {
      const projectData = await fetchProjects(session.user.id);
      setProjects(projectData);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  }, [session]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const currentSession = await checkSession();
        setSession(currentSession);
        if (!currentSession) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (session) {
      loadProjects();
    }
  }, [session, loadProjects]);

  const handleCreateProject = async () => {
    if (newProjectTitle.trim() === '' || !session) return;
    try {
      await createProject(session.user.id, newProjectTitle, newProjectDescription);
      setNewProjectTitle('');
      setNewProjectDescription('');
      setShowCreateModal(false);
      loadProjects();
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  const handleSelectProject = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      const stageData = await fetchProjectStages(projectId);
      setStages(stageData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar etapas:', error);
    }
  };

  const handleAddStage = async () => {
    if (newStageTitle.trim() === '' || !selectedProjectId) return;
    try {
      await addProjectStage(selectedProjectId, newStageTitle, newStageContent, newStageImage);
      setNewStageTitle('');
      setNewStageContent('');
      setNewStageImage(null);
      setShowAddStageModal(false);
      const updatedStages = await fetchProjectStages(selectedProjectId);
      setStages(updatedStages);
    } catch (error) {
      console.error('Error al agregar etapa:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setNewStageImage(result.uri);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProjects().then(() => setRefreshing(false));
  }, [loadProjects]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-400 to-emerald-600">
      <Header title="Proyectos de Investigación" />
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold mb-6 text-white text-center">
          Tus Proyectos
        </Text>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-5 mb-4 rounded-2xl shadow-lg"
              onPress={() => handleSelectProject(item.id)}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-lime-300 rounded-full mr-4 flex items-center justify-center">
                  <Text className="text-2xl font-bold text-green-800">{item.title[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-green-800">{item.title}</Text>
                  <Text className="text-sm text-gray-600">{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#10B981"]}
            />
          }
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-2xl shadow-lg">
              <Text className="text-center text-lg text-green-800">
                No hay proyectos disponibles.
              </Text>
            </View>
          }
        />
      </View>
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6 bg-primary rounded-full p-4"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para crear proyecto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Crear Nuevo Proyecto</Text>
            <TextInput
              className="bg-gray-100 p-2 mb-4 rounded"
              placeholder="Título del proyecto"
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
            />
            <TextInput
              className="bg-gray-100 p-2 mb-4 rounded"
              placeholder="Descripción del proyecto"
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              multiline
              numberOfLines={4}
            />
          </View>
          <View className="p-4">
            <TouchableOpacity
              onPress={handleCreateProject}
              className="bg-primary p-4 rounded-full mb-2"
            >
              <Text className="text-white font-bold text-center">Crear Proyecto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              className="p-4 rounded-full border border-primary"
            >
              <Text className="text-primary font-bold text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ver detalles del proyecto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Detalles del Proyecto</Text>
            <FlatList
              data={stages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-gray-100 p-4 mb-4 rounded-lg">
                  <Text className="text-lg font-semibold mb-2">{item.title}</Text>
                  <Text className="mb-2">{item.content}</Text>
                  {item.image_url && (
                    <Image source={{ uri: item.image_url }} className="w-full h-40 rounded" />
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View className="bg-gray-100 p-4 rounded-lg">
                  <Text className="text-center text-lg text-gray-600">
                    No hay etapas disponibles.
                  </Text>
                </View>
              }
            />
          </View>
          <View className="p-4">
            <TouchableOpacity
              onPress={() => {
                setShowDetailModal(false);
                setShowAddStageModal(true);
              }}
              className="bg-primary p-4 rounded-full mb-2"
            >
              <Text className="text-white font-bold text-center">Agregar Etapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              className="p-4 rounded-full border border-primary"
            >
              <Text className="text-primary font-bold text-center">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal para agregar etapa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddStageModal}
        onRequestClose={() => setShowAddStageModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Agregar Nueva Etapa</Text>
            <TextInput
              className="bg-gray-100 p-2 mb-4 rounded"
              placeholder="Título de la etapa"
              value={newStageTitle}
              onChangeText={setNewStageTitle}
            />
            <TextInput
              className="bg-gray-100 p-2 mb-4 rounded"
              placeholder="Contenido de la etapa"
              value={newStageContent}
              onChangeText={setNewStageContent}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity onPress={pickImage} className="mb-4">
              <Text className="text-primary font-bold">Seleccionar Imagen</Text>
            </TouchableOpacity>
            {newStageImage && <Image source={{ uri: newStageImage }} className="w-full h-40 mb-4 rounded" />}
          </View>
          <View className="p-4">
            <TouchableOpacity
              onPress={handleAddStage}
              className="bg-primary p-4 rounded-full mb-2"
            >
              <Text className="text-white font-bold text-center">Agregar Etapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddStageModal(false)}
              className="p-4 rounded-full border border-primary"
            >
              <Text className="text-primary font-bold text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ResearchProjectsScreen;