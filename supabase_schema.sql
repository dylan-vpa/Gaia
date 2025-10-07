-- =====================================================
-- ESQUEMA COMPLETO PARA SUPABASE - GAIA APP
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA PROFILES (Perfiles de Usuario)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. TABLA POSTS (Publicaciones)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para posts
CREATE POLICY "Todos pueden ver los posts" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. TABLA COMMENTS (Comentarios)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comments
CREATE POLICY "Todos pueden ver los comentarios" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear comentarios" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios comentarios" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios comentarios" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. TABLA LIKES (Me gusta)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Habilitar RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para likes
CREATE POLICY "Todos pueden ver los likes" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios autenticados pueden dar like" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden quitar sus propios likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. TABLA RESEARCH_PROJECTS (Proyectos de Investigación)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para research_projects
CREATE POLICY "Los usuarios pueden ver sus propios proyectos" ON public.research_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios autenticados pueden crear proyectos" ON public.research_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios proyectos" ON public.research_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios proyectos" ON public.research_projects
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. TABLA PROJECT_STAGES (Etapas de Proyectos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.project_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_stages
CREATE POLICY "Los usuarios pueden ver las etapas de sus proyectos" ON public.project_stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_projects 
            WHERE id = project_stages.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden crear etapas en sus proyectos" ON public.project_stages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.research_projects 
            WHERE id = project_stages.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden actualizar etapas de sus proyectos" ON public.project_stages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.research_projects 
            WHERE id = project_stages.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden eliminar etapas de sus proyectos" ON public.project_stages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.research_projects 
            WHERE id = project_stages.project_id 
            AND user_id = auth.uid()
        )
    );

-- =====================================================
-- 7. TABLA GAMES (Juegos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para games
CREATE POLICY "Todos pueden ver los juegos" ON public.games
    FOR SELECT USING (true);

-- Solo administradores pueden crear/modificar juegos (opcional)
-- CREATE POLICY "Solo admins pueden crear juegos" ON public.games
--     FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 8. TABLA GAME_QUESTIONS (Preguntas de Juegos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.game_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array de opciones
    correct_answer INTEGER NOT NULL, -- Índice de la respuesta correcta
    question_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para game_questions
CREATE POLICY "Todos pueden ver las preguntas de juegos" ON public.game_questions
    FOR SELECT USING (true);

-- =====================================================
-- 9. TABLA GAME_SCORES (Puntuaciones de Juegos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para game_scores
CREATE POLICY "Los usuarios pueden ver todas las puntuaciones" ON public.game_scores
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios autenticados pueden guardar sus puntuaciones" ON public.game_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 10. CONFIGURACIÓN DE STORAGE BUCKETS
-- =====================================================

-- Bucket para imágenes de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de proyectos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. POLÍTICAS RLS PARA STORAGE
-- =====================================================

-- Políticas para bucket de perfiles
CREATE POLICY "Los usuarios pueden subir sus propias imágenes de perfil" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profiles' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Todos pueden ver las imágenes de perfil" ON storage.objects
    FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Los usuarios pueden actualizar sus propias imágenes de perfil" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profiles' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Los usuarios pueden eliminar sus propias imágenes de perfil" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profiles' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Políticas para bucket de imágenes de proyectos
CREATE POLICY "Los usuarios pueden subir imágenes a sus proyectos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project_images'
        AND EXISTS (
            SELECT 1 FROM public.research_projects 
            WHERE id::text = (storage.foldername(name))[1] 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Todos pueden ver las imágenes de proyectos" ON storage.objects
    FOR SELECT USING (bucket_id = 'project_images');

-- =====================================================
-- 12. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_projects_updated_at 
    BEFORE UPDATE ON public.research_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_stages_updated_at 
    BEFORE UPDATE ON public.project_stages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON public.games 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON public.research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_game_questions_game_id ON public.game_questions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_questions_order ON public.game_questions(game_id, question_order);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_game ON public.game_scores(user_id, game_id);

-- =====================================================
-- 14. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunos juegos de ejemplo
INSERT INTO public.games (title, description, difficulty_level) VALUES
('Quiz de Ciencias', 'Preguntas básicas de ciencias naturales', 1),
('Matemáticas Básicas', 'Operaciones matemáticas fundamentales', 1),
('Historia Universal', 'Conocimientos generales de historia', 2)
ON CONFLICT DO NOTHING;

-- Insertar preguntas de ejemplo para el primer juego
INSERT INTO public.game_questions (game_id, question, options, correct_answer, question_order) 
SELECT 
    g.id,
    '¿Cuál es el planeta más cercano al Sol?',
    '["Mercurio", "Venus", "Tierra", "Marte"]'::jsonb,
    0,
    1
FROM public.games g WHERE g.title = 'Quiz de Ciencias'
ON CONFLICT DO NOTHING;

INSERT INTO public.game_questions (game_id, question, options, correct_answer, question_order) 
SELECT 
    g.id,
    '¿Qué gas respiramos principalmente?',
    '["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"]'::jsonb,
    0,
    2
FROM public.games g WHERE g.title = 'Quiz de Ciencias'
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Asegúrate de que la autenticación esté habilitada
-- 3. Las políticas RLS protegen los datos según el usuario autenticado
-- 4. Los buckets de storage están configurados como públicos para facilitar el acceso a imágenes
-- 5. Los triggers mantienen automáticamente las fechas de actualización
-- 6. Los índices mejoran el rendimiento de las consultas más comunes
-- =====================================================