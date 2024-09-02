//Supabase
import { supabase } from "../client";

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

export { fetchPosts, createPost, likePost };