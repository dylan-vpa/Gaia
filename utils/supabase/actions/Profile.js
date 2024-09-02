//Supabase
import { supabase } from "../client";

//Profile
const fetchProfilePicture = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();
  
      if (error) throw error;
  
      if (data?.avatar_url) {
        const fullUrl = data.avatar_url.startsWith("http")
          ? data.avatar_url
          : `${supabase.supabaseUrl}/storage/v1/object/public/profiles/${data.avatar_url}`;
        return `${fullUrl}?t=${new Date().getTime()}`;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  };
  
  const uploadProfilePicture = async (uri) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("Usuario no autenticado");
  
      const fileName = uri.split("/").pop();
  
      const { data, error } = await supabase.storage
        .from("profiles")
        .upload(`${user.id}/${fileName}`, {
          uri: uri,
          type: "image/*",
        });
  
      if (error) throw error;
  
      const { data: publicUrlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(`${user.id}/${fileName}`);
  
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("No se pudo obtener la URL pública de la imagen");
      }
  
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq("id", user.id);
  
      if (updateError) throw updateError;
  
      return { data: publicUrlData, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };
  
export { fetchProfilePicture, uploadProfilePicture };