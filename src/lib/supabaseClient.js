import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * True only when both frontend Supabase environment variables are present.
 * When this is false the app still renders; backend-dependent features are
 * disabled and explain what configuration is missing.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_CONFIG_MESSAGE =
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file to enable uploads and hidden-gem submissions.";

let supabaseClient = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize the Supabase client:", error);
  }
}

/**
 * The initialized client, or null when configuration is missing/invalid.
 * Never assume this is non-null; use getSupabaseClient() or check
 * isSupabaseConfigured before calling it.
 */
export const supabase = supabaseClient;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const error = new Error(SUPABASE_CONFIG_MESSAGE);
    error.code = "SUPABASE_NOT_CONFIGURED";
    throw error;
  }
  return supabaseClient;
};

/**
 * Upload a file to the specified path in the 'heritage-uploads' bucket.
 * @param {File | Blob} file - The file to upload.
 * @param {string} path - The storage path for the file.
 * @returns {Promise<{path: string, url: string}>} Object containing uploaded file path and public URL.
 */
export const uploadFileToStorage = async (file, path) => {
  const client = getSupabaseClient();

  const { data, error } = await client.storage
    .from("heritage-uploads")
    .upload(path, file);

  if (error) throw error;

  const { data: urlData, error: urlError } = client.storage
    .from("heritage-uploads")
    .getPublicUrl(path);

  if (urlError) throw urlError;

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
};

/**
 * Insert a heritage gem record into the 'hidden_gems' table.
 * Assumes gemData includes a valid submitter_id matching RLS policy.
 * @param {Object} gemData - The data object representing the heritage gem.
 * @returns {Promise<Object>} The inserted heritage gem record.
 */
export const insertHeritageGem = async (gemData) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("hidden_gems")
    .insert([gemData])
    .select();

  if (error) throw error;
  return data[0];
};
