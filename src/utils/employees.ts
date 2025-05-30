
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  name: string;
  pix_key_1?: string;
  pix_key_2?: string;
  pix_key_3?: string;
  active: boolean;
  created_at: string;
  user_id: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const createEmployee = async (
  name: string, 
  pixKey1?: string, 
  pixKey2?: string, 
  pixKey3?: string
): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { error } = await supabase
      .from("employees")
      .insert({
        name: name.trim(),
        pix_key_1: pixKey1?.trim() || null,
        pix_key_2: pixKey2?.trim() || null,
        pix_key_3: pixKey3?.trim() || null,
        user_id: userData.user.id
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error creating employee:", error);
    return false;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("employees")
      .update({ active: false })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    return false;
  }
};
