//Expo
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

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
    .eq('post_id', postId)
    .single();

  if (error) {
    console.error("Error al verificar el like:", error);
    return false;
  }

  return !!data;
};

//Profile
const fetchProfilePicture = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single()

            if (error) throw error
            
            if (data?.avatar_url) {
                console.log("URL de la imagen obtenida:", data.avatar_url);
                // Asegurarse de que la URL es absoluta
                const fullUrl = data.avatar_url.startsWith('http') 
                    ? data.avatar_url 
                    : `${supabase.supabaseUrl}/storage/v1/object/public/profiles/${data.avatar_url}`;
                return `${fullUrl}?t=${new Date().getTime()}`;
            }
            return null;
        }
    } catch (error) {
        console.error('Error al obtener la foto de perfil:', error.message);
        return null;
    }
}
  
const uploadProfilePicture = async (uri) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Usuario no autenticado");

    console.log("URI de la imagen a subir:", uri);

    // Obtener el nombre del archivo de la URI
    const fileName = uri.split('/').pop();

    // Subir el archivo directamente
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(`${user.id}/${fileName}`, {
        uri: uri,
        type: 'image/*'
      });

    if (error) throw error;

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(`${user.id}/${fileName}`);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    // Actualizar la URL de la foto de perfil en la tabla de perfiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    console.log("URL pública de la imagen subida:", publicUrlData.publicUrl);

    return { data: publicUrlData, error: null };
  } catch (error) {
    console.error('Error detallado al subir la imagen:', error);
    return { data: null, error: error.message };
  }
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
  checkLikeExists
};