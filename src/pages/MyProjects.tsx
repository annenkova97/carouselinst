import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProjectStorage, Project } from "@/hooks/useProjectStorage";
import { Plus, Trash2, Loader2, FolderOpen, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyProjects = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { projects, loadUserProjects, deleteProject, isLoading } = useProjectStorage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserProjects().then((loadedProjects) => {
        // Load first slide thumbnail for each project
        loadedProjects.forEach((project) => {
          loadProjectThumbnail(project.id);
        });
      });
    }
  }, [user, loadUserProjects]);

  const loadProjectThumbnail = async (projectId: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from('project_slides')
        .select('image_url')
        .eq('project_id', projectId)
        .order('slide_order')
        .limit(1);
      
      if (data && data.length > 0 && data[0].image_url) {
        setThumbnails(prev => ({ ...prev, [projectId]: data[0].image_url }));
      }
    } catch (error) {
      console.error('Error loading thumbnail:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId);
    await deleteProject(projectId);
    setDeletingId(null);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor?project=${projectId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Мои проекты</h1>
            <Button className="bg-gradient-brand" asChild>
              <Link to="/editor">
                <Plus className="w-4 h-4 mr-2" />
                Новый проект
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Пока нет проектов</h2>
              <p className="text-muted-foreground mb-6">
                Создайте свою первую карусель для Instagram
              </p>
              <Button className="bg-gradient-brand" asChild>
                <Link to="/editor">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать карусель
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <CardContent className="p-4">
                    <div 
                      className={`bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden ${
                        project.aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square"
                      }`}
                    >
                      {thumbnails[project.id] ? (
                        <img 
                          src={thumbnails[project.id]!} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(project.updatedAt), "d MMM yyyy", { locale: ru })}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deletingId === project.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Проект "{project.title}" будет удалён безвозвратно.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProjects;
