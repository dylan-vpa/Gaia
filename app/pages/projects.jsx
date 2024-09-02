import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Modal, ActivityIndicator, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/Header';
import { checkSession, fetchProjects, createProject, fetchProjectStages, addProjectStage, deleteProject } from '../../utils/supabase/actions';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from "expo-status-bar";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

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

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(session.user.id, projectToDelete);
      loadProjects();
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    }
  };

  const openDeleteModal = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Proyectos de Investigación" />
      <View className="flex-1 px-4 pt-6">
        <Text className="text-3xl text-center font-bold mb-6 text-[#333]">
          Proyectos
        </Text>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-4 mb-4 border-b border-slate-200"
              onPress={() => handleSelectProject(item.id)}
              onLongPress={() => openDeleteModal(item.id)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-blue-200 rounded-lg mr-4 flex items-center justify-center">
                    <Text className="text-2xl font-bold text-blue-500">
                      {item.title.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#333]">{item.title}</Text>
                    <Text className="text-sm text-gray-500" numberOfLines={2}>{item.description}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => openDeleteModal(item.id)}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#777" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#58CC02"]}
            />
          }
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-xl">
              <Text className="text-center text-lg text-gray-500">
                No hay proyectos disponibles.
              </Text>
            </View>
          }
        />
      </View>
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6 bg-[#58CC02] rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para confirmar eliminación de proyecto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-end bg-transparent">
          <View className="bg-white px-4 py-6 rounded-t-3xl">
            <TouchableOpacity
              onPress={handleDeleteProject}
              className="py-6 border-b border-slate-200"
            >
              <Text className="text-red-500 text-center font-bold">
                Eliminar proyecto
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

      {/* Modal para crear proyecto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4 text-[#3C3C3C]">Crear Nuevo Proyecto</Text>
            <TextInput
              className="bg-[#F7F7F7] p-3 mb-4 rounded-xl"
              placeholder="Título del proyecto"
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
            />
            <TextInput
              className="bg-[#F7F7F7] p-3 mb-4 rounded-xl"
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
              className="bg-[#58CC02] p-4 rounded-xl mb-2"
            >
              <Text className="text-white font-bold text-center">Crear Proyecto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              className="p-4 rounded-xl border border-[#58CC02]"
            >
              <Text className="text-[#58CC02] font-bold text-center">Cancelar</Text>
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
            <Text className="text-2xl font-bold mb-4 text-[#3C3C3C]">Detalles del Proyecto</Text>
            <FlatList
              data={stages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-[#F7F7F7] p-4 mb-4 rounded-xl">
                  <Text className="text-lg font-semibold mb-2 text-[#3C3C3C]">{item.title}</Text>
                  <Text className="mb-2 text-[#777]">{item.content}</Text>
                  {item.image_url && (
                    <Image source={{ uri: item.image_url }} className="w-full h-40 rounded-xl" />
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View className="bg-[#F7F7F7] p-4 rounded-xl">
                  <Text className="text-center text-lg text-[#777]">
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
              className="bg-[#58CC02] p-4 rounded-xl mb-2"
            >
              <Text className="text-white font-bold text-center">Agregar Etapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              className="p-4 rounded-xl border border-[#58CC02]"
            >
              <Text className="text-[#58CC02] font-bold text-center">Cerrar</Text>
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
            <Text className="text-2xl font-bold mb-4 text-[#3C3C3C]">Agregar Nueva Etapa</Text>
            <TextInput
              className="bg-[#F7F7F7] p-3 mb-4 rounded-xl"
              placeholder="Título de la etapa"
              value={newStageTitle}
              onChangeText={setNewStageTitle}
            />
            <TextInput
              className="bg-[#F7F7F7] p-3 mb-4 rounded-xl"
              placeholder="Contenido de la etapa"
              value={newStageContent}
              onChangeText={setNewStageContent}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity onPress={pickImage} className="mb-4">
              <Text className="text-[#58CC02] font-bold">Seleccionar Imagen</Text>
            </TouchableOpacity>
            {newStageImage && <Image source={{ uri: newStageImage }} className="w-full h-40 mb-4 rounded-xl" />}
          </View>
          <View className="p-4">
            <TouchableOpacity
              onPress={handleAddStage}
              className="bg-[#58CC02] p-4 rounded-xl mb-2"
            >
              <Text className="text-white font-bold text-center">Agregar Etapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddStageModal(false)}
              className="p-4 rounded-xl border border-[#58CC02]"
            >
              <Text className="text-[#58CC02] font-bold text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default ResearchProjectsScreen;