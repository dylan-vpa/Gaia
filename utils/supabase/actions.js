// Supabase
import { supabase } from "./client";

// Auth
const signInWithEmail = async (email, password) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

const signUpWithEmail = async (email, password) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (!user)
      throw new Error("Please check your email for verification link!");
  } catch (error) {
    throw error;
  }
};

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

const checkSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await ensureProfile(session.user);
  }
  return session;
};

const ensureProfile = async (user) => {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    await supabase
      .from("profiles")
      .insert({ id: user.id, name: user.email.split("@")[0] });
  }
};

// Posts
const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id (name),
      likes (id)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data.map((post) => ({
    ...post,
    likes_count: post.likes.length,
  }));
};

const createPost = async (userId, content) => {
  await supabase.from("posts").insert({ user_id: userId, content });
};

const likePost = async (userId, postId) => {
  const { error } = await supabase
    .from("likes")
    .insert({ user_id: userId, post_id: postId });

  if (error && error.code === "23505") {
    await supabase
      .from("likes")
      .delete()
      .match({ user_id: userId, post_id: postId });
  }
};

// Comments
const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles:user_id (name)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data;
};

const createComment = async (userId, postId, content) => {
  const { error } = await supabase
    .from("comments")
    .insert({ user_id: userId, post_id: postId, content });

  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

const deleteComment = async (userId, commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .match({ id: commentId, user_id: userId });

  if (error) throw error;
};

const deletePost = async (userId, postId) => {
  await supabase.from("posts").delete().eq("id", postId).eq("user_id", userId);
};  

const checkLikeExists = async (userId, postId) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) {
    console.error("Error al verificar el like:", error);
    return false;
  }

  return data.length > 0;
};

//Profile
const fetchProfilePicture = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single()

        if (error) throw error
        
        if (data?.avatar_url) {
            const fullUrl = data.avatar_url.startsWith('http') 
                ? data.avatar_url 
                : `${supabase.supabaseUrl}/storage/v1/object/public/profiles/${data.avatar_url}`;
            return `${fullUrl}?t=${new Date().getTime()}`;
        }
        return null;
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        return null;
    }
}
  
const uploadProfilePicture = async (uri) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Usuario no autenticado");

    const fileName = uri.split('/').pop();

    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(`${user.id}/${fileName}`, {
        uri: uri,
        type: 'image/*'
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(`${user.id}/${fileName}`);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { data: publicUrlData, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Juegos
const fetchGames = async () => {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

const fetchGameQuestions = async (gameId) => {
  const { data, error } = await supabase
    .from("game_questions")
    .select("*")
    .eq("game_id", gameId)
    .order("question_order", { ascending: true });

  if (error) {
    console.error("Error al obtener preguntas del juego:", error);
    return [];
  }

  return data;
};

const saveGameScore = async (userId, gameId, score) => {
  const { data, error } = await supabase
    .from("game_scores")
    .insert({ user_id: userId, game_id: gameId, score: score })
    .select();

  if (error) {
    console.error("Error al guardar puntaje:", error);
    throw error;
  }

  return data[0];
};

const fetchUserGameScores = async (userId, gameId) => {
  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener puntajes del usuario:", error);
    return [];
  }

  return data;
};

// Proyectos de investigación
const createProject = async (userId, title, description) => {
  const { data, error } = await supabase
    .from('research_projects')
    .insert({ user_id: userId, title, description })
    .select();

  if (error) throw error;
  return data[0];
};

const fetchProjects = async (userId) => {
  const { data, error } = await supabase
    .from('research_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const addProjectStage = async (projectId, title, content, imageUri) => {
  let imageUrl = null;
  if (imageUri) {
    const fileName = `${projectId}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('project_images')
      .upload(fileName, { uri: imageUri, type: 'image/jpeg' });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project_images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { data, error } = await supabase
    .from('project_stages')
    .insert({ project_id: projectId, title, content, image_url: imageUrl })
    .select();

  if (error) throw error;
  return data[0];
};

const fetchProjectStages = async (projectId) => {
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  checkSession,
  fetchPosts,
  createPost,
  likePost,
  deletePost,
  fetchComments,
  createComment,
  deleteComment,
  fetchProfilePicture,
  uploadProfilePicture,
  checkLikeExists,
  fetchGames,
  fetchGameQuestions,
  saveGameScore,
  fetchUserGameScores,
  createProject,
  fetchProjects,
  addProjectStage,
  fetchProjectStages
};

export const updateUserProfile = async (userId, updatedData) => {
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
        .from('profiles')
        .update({ name: updatedData.name })
        .eq('id', userId);
      if (profileError) throw profileError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return { success: false, error: error.message };
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    return null;
  }
};

export const fetchQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};