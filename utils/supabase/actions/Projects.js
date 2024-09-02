//Supabase
import { supabase } from "../client";

// Proyectos de investigación
const createProject = async (userId, title, description) => {
    const { data, error } = await supabase
      .from("research_projects")
      .insert({ user_id: userId, title, description })
      .select();
  
    if (error) throw error;
    return data[0];
  };
  
  const fetchProjects = async (userId) => {
    const { data, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  
    if (error) throw error;
    return data;
  };
  
  const addProjectStage = async (projectId, title, content, imageUri) => {
    let imageUrl = null;
    if (imageUri) {
      const fileName = `${projectId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("project_images")
        .upload(fileName, { uri: imageUri, type: "image/jpeg" });
  
      if (uploadError) throw uploadError;
  
      const { data } = supabase.storage
        .from("project_images")
        .getPublicUrl(fileName);
  
      imageUrl = data.publicUrl;
    }
  
    const { data, error } = await supabase
      .from("project_stages")
      .insert({ project_id: projectId, title, content, image_url: imageUrl })
      .select();
  
    if (error) throw error;
    return data[0];
  };
  
  const fetchProjectStages = async (projectId) => {
    const { data, error } = await supabase
      .from("project_stages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
  
    if (error) throw error;
    return data;
  };
  
  const updateUserProfile = async (userId, updatedData) => {
    try {
      if (updatedData.email || updatedData.password) {
        const { data, error } = await supabase.auth.updateUser({
          email: updatedData.email,
          password: updatedData.password,
        });
        if (error) throw error;
      }
  
      if (updatedData.name) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ name: updatedData.name })
          .eq("id", userId);
        if (profileError) throw profileError;
      }
  
      return { success: true };
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      return { success: false, error: error.message };
    }
  };
  
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();
  
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
      return null;
    }
  };
  
  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) throw error;
  
      return data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  };

const deleteProject = async (userId, projectId) => {
  try {
    // Primero, verificamos que el proyecto pertenezca al usuario
    const { data: project, error: fetchError } = await supabase
      .from("research_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;
    if (!project) throw new Error("Proyecto no encontrado o no tienes permiso para eliminarlo");

    // Eliminamos las etapas del proyecto
    const { error: stagesDeleteError } = await supabase
      .from("project_stages")
      .delete()
      .eq("project_id", projectId);

    if (stagesDeleteError) throw stagesDeleteError;

    // Eliminamos el proyecto
    const { error: projectDeleteError } = await supabase
      .from("research_projects")
      .delete()
      .eq("id", projectId);

    if (projectDeleteError) throw projectDeleteError;

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el proyecto:", error);
    return { success: false, error: error.message };
  }
};

export { 
  createProject, 
  fetchProjects, 
  addProjectStage, 
  fetchProjectStages, 
  updateUserProfile, 
  fetchUserProfile, 
  fetchQuestions,
  deleteProject // Añadimos la nueva función a las exportaciones
};