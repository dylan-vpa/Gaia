//Supabase
import { supabase } from "../client";

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
      .from("comments")
      .delete()
      .match({ id: commentId, user_id: userId });
  
    if (error) throw error;
  };
  
  const deletePost = async (userId, postId) => {
    await supabase.from("posts").delete().eq("id", postId).eq("user_id", userId);
  };
  
  const checkLikeExists = async (userId, postId) => {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId);
  
    if (error) {
      console.error("Error al verificar el like:", error);
      return false;
    }
  
    return data.length > 0;
  };

export { fetchComments, createComment, deleteComment, deletePost, checkLikeExists };