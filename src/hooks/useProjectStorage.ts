import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { SlideData, TextStyle, AspectRatio } from "@/pages/Editor";

export interface Project {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  textStyle: TextStyle;
  slides: SlideData[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  aspect_ratio: string;
  text_style: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface SlideRow {
  id: string;
  project_id: string;
  slide_order: number;
  image_url: string | null;
  text: string;
  text_position: { x: number; y: number };
  position_mode: string;
}

export function useProjectStorage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const uploadImage = useCallback(async (file: File | Blob, slideId: string): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${user.id}/${slideId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('carousel-images')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('carousel-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }, [user]);

  const convertBlobUrlToFile = async (blobUrl: string): Promise<Blob | null> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error converting blob URL:', error);
      return null;
    }
  };

  const saveProject = useCallback(async (
    projectId: string | null,
    title: string,
    aspectRatio: AspectRatio,
    textStyle: TextStyle,
    slides: SlideData[]
  ): Promise<string | null> => {
    if (!user) {
      toast.error("Войдите в аккаунт для сохранения проекта");
      return null;
    }
    
    setIsLoading(true);
    
    try {
      // Create or update project
      let currentProjectId = projectId;
      
      if (!currentProjectId) {
        // Create new project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            title,
            aspect_ratio: aspectRatio,
            text_style: JSON.parse(JSON.stringify(textStyle)),
          } as never)
          .select()
          .single();
        
        if (projectError) throw projectError;
        currentProjectId = (projectData as unknown as ProjectRow).id;
      } else {
        // Update existing project
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            title,
            aspect_ratio: aspectRatio,
            text_style: JSON.parse(JSON.stringify(textStyle)),
          } as never)
          .eq('id', currentProjectId);
        
        if (updateError) throw updateError;
        
        // Delete existing slides
        await supabase
          .from('project_slides')
          .delete()
          .eq('project_id', currentProjectId);
      }
      
      // Upload images and create slides
      const slidesData = await Promise.all(
        slides.map(async (slide, index) => {
          let imageUrl = slide.image;
          
          // If it's a blob URL, upload to storage
          if (slide.image?.startsWith('blob:')) {
            const blob = await convertBlobUrlToFile(slide.image);
            if (blob) {
              const uploadedUrl = await uploadImage(blob, slide.id);
              imageUrl = uploadedUrl;
            }
          }
          
          return {
            project_id: currentProjectId,
            slide_order: index,
            image_url: imageUrl,
            text: slide.text,
            text_position: slide.textPosition,
            position_mode: slide.positionMode,
          };
        })
      );
      
      const { error: slidesError } = await supabase
        .from('project_slides')
        .insert(slidesData);
      
      if (slidesError) throw slidesError;
      
      toast.success("Проект сохранён!");
      return currentProjectId;
    } catch (error: unknown) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error("Ошибка сохранения", { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, uploadImage]);

  const loadProject = useCallback(async (projectId: string): Promise<Project | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      const { data: slidesData, error: slidesError } = await supabase
        .from('project_slides')
        .select('*')
        .eq('project_id', projectId)
        .order('slide_order');
      
      if (slidesError) throw slidesError;
      
      const typedProject = projectData as unknown as ProjectRow;
      const typedSlides = slidesData as unknown as SlideRow[];
      
      const slides: SlideData[] = typedSlides.map((slide) => ({
        id: slide.id,
        image: slide.image_url,
        text: slide.text,
        textPosition: slide.text_position,
        positionMode: slide.position_mode as SlideData['positionMode'],
        imageOffset: { x: 0, y: 0 },
        imageScale: 1,
      }));
      
      const project: Project = {
        id: typedProject.id,
        title: typedProject.title,
        aspectRatio: typedProject.aspect_ratio as AspectRatio,
        textStyle: typedProject.text_style as unknown as TextStyle,
        slides,
        createdAt: typedProject.created_at,
        updatedAt: typedProject.updated_at,
      };
      
      return project;
    } catch (error: unknown) {
      console.error('Load error:', error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error("Ошибка загрузки проекта", { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserProjects = useCallback(async (): Promise<Project[]> => {
    if (!user) return [];
    
    setIsLoading(true);
    
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      const typedProjects = projectsData as unknown as ProjectRow[];
      
      const projectsList: Project[] = typedProjects.map((p) => ({
        id: p.id,
        title: p.title,
        aspectRatio: p.aspect_ratio as AspectRatio,
        textStyle: p.text_style as unknown as TextStyle,
        slides: [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
      
      setProjects(projectsList);
      return projectsList;
    } catch (error: unknown) {
      console.error('Load projects error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Проект удалён");
      return true;
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error("Ошибка удаления", { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    projects,
    saveProject,
    loadProject,
    loadUserProjects,
    deleteProject,
  };
}
