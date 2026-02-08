import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProjectStorage } from "@/hooks/useProjectStorage";
import { ArrowRight, FolderOpen, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const SavedProjectsSection = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { projects, loadUserProjects, isLoading } = useProjectStorage();

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user, loadUserProjects]);

  // Don't show section if not logged in
  if (authLoading || !user) {
    return null;
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor?project=${projectId}`);
  };

  // Show only first 4 projects
  const displayProjects = projects.slice(0, 4);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Мои проекты</h2>
          <Button variant="ghost" asChild>
            <Link to="/my-projects" className="flex items-center gap-2">
              Все проекты
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">Пока нет сохранённых проектов</h3>
            <p className="text-muted-foreground mb-4">
              Создайте свою первую карусель
            </p>
            <Button className="bg-gradient-brand" asChild>
              <Link to="/editor">
                <Plus className="w-4 h-4 mr-2" />
                Создать карусель
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProjects.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardContent className="p-3 md:p-4">
                  <div
                    className={`bg-muted rounded-lg mb-3 flex items-center justify-center ${
                      project.aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square"
                    }`}
                  >
                    <FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium truncate text-sm md:text-base">{project.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {format(new Date(project.updatedAt), "d MMM", { locale: ru })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
