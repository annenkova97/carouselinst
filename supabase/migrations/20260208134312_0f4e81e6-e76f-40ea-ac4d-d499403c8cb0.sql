-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload carousel images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'carousel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own images
CREATE POLICY "Users can view own carousel images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'carousel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view all carousel images (for sharing)
CREATE POLICY "Public can view carousel images"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'carousel-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own carousel images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'carousel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'Без названия',
    aspect_ratio TEXT NOT NULL DEFAULT '1:1',
    text_style JSONB NOT NULL DEFAULT '{
        "fontFamily": "Montserrat",
        "fontSize": 24,
        "color": "#ffffff",
        "shadowEnabled": true,
        "shadowColor": "rgba(0,0,0,0.5)",
        "shadowBlur": 4,
        "strokeEnabled": false,
        "strokeColor": "#000000",
        "strokeWidth": 2,
        "backgroundEnabled": false,
        "backgroundColor": "rgba(0,0,0,0.5)",
        "backgroundPadding": 10,
        "backgroundRadius": 8
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project slides table
CREATE TABLE public.project_slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    slide_order INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    text TEXT NOT NULL DEFAULT '',
    text_position JSONB NOT NULL DEFAULT '{"x": 50, "y": 50}'::jsonb,
    position_mode TEXT NOT NULL DEFAULT 'fixed-center',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_slides ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Project slides policies
CREATE POLICY "Users can view own project slides"
ON public.project_slides
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_slides.project_id 
    AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create slides for own projects"
ON public.project_slides
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_slides.project_id 
    AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update slides for own projects"
ON public.project_slides
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_slides.project_id 
    AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete slides from own projects"
ON public.project_slides
FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_slides.project_id 
    AND projects.user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_project_slides_project_id ON public.project_slides(project_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();