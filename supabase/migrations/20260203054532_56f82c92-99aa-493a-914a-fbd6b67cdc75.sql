-- Create role enum for users
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create diseases table (reference data)
CREATE TABLE public.diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    symptoms TEXT,
    causes TEXT,
    spread_risk TEXT CHECK (spread_risk IN ('low', 'medium', 'high')),
    organic_treatments TEXT,
    chemical_treatments TEXT,
    prevention_tips TEXT,
    image_examples TEXT[],
    affected_plants TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scans table for user scan history
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    plant_type TEXT,
    disease_name TEXT,
    disease_id UUID REFERENCES public.diseases(id),
    confidence DECIMAL(5,2),
    severity TEXT CHECK (severity IN ('healthy', 'mild', 'moderate', 'severe')),
    notes TEXT,
    location TEXT,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage, users can view own)
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Diseases policies (public read, admin write)
CREATE POLICY "Anyone can view diseases"
    ON public.diseases FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage diseases"
    ON public.diseases FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Scans policies
CREATE POLICY "Users can view their own scans"
    ON public.scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans"
    ON public.scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
    ON public.scans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
    ON public.scans FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scans"
    ON public.scans FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diseases_updated_at
    BEFORE UPDATE ON public.diseases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for scan images
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-images', 'scan-images', true);

-- Storage policies for scan images
CREATE POLICY "Anyone can view scan images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'scan-images');

CREATE POLICY "Authenticated users can upload scan images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'scan-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own scan images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own scan images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert some initial disease data
INSERT INTO public.diseases (name, description, symptoms, causes, spread_risk, organic_treatments, chemical_treatments, prevention_tips, affected_plants) VALUES
('Powdery Mildew', 'A fungal disease that appears as white powdery spots on leaves and stems.', 'White powdery coating on leaves, stems, and flowers. Leaves may yellow and drop prematurely.', 'Caused by various species of fungi. Thrives in warm, dry conditions with high humidity at night.', 'high', 'Neem oil spray, baking soda solution (1 tbsp per gallon of water), milk spray (40% milk to 60% water)', 'Sulfur-based fungicides, potassium bicarbonate sprays, myclobutanil', 'Ensure good air circulation, avoid overhead watering, remove infected plant parts, choose resistant varieties', ARRAY['tomatoes', 'squash', 'cucumbers', 'roses', 'grapes']),
('Late Blight', 'A devastating disease that can destroy entire crops within days.', 'Dark, water-soaked spots on leaves that turn brown. White fuzzy growth on leaf undersides. Fruit develops brown, firm spots.', 'Caused by Phytophthora infestans oomycete. Spreads rapidly in cool, wet conditions.', 'high', 'Copper-based organic fungicides, remove and destroy infected plants immediately', 'Chlorothalonil, mancozeb, fixed copper fungicides. Apply preventatively before symptoms appear.', 'Plant resistant varieties, avoid overhead irrigation, ensure good air circulation, destroy volunteer plants', ARRAY['tomatoes', 'potatoes']),
('Leaf Spot', 'Circular or irregular spots on leaves caused by various fungi or bacteria.', 'Small, dark spots on leaves that may have yellow halos. Spots may merge, causing leaf death.', 'Various fungal and bacterial pathogens. Spreads through water splash and contaminated tools.', 'medium', 'Remove infected leaves, apply neem oil, use compost tea as foliar spray', 'Copper-based fungicides, chlorothalonil for severe cases', 'Water at soil level, remove plant debris, rotate crops, sterilize pruning tools', ARRAY['tomatoes', 'peppers', 'strawberries', 'roses']),
('Rust', 'Fungal disease characterized by rust-colored pustules on plant surfaces.', 'Orange, yellow, or brown pustules on leaves, stems, or fruits. Severe infections cause leaf drop.', 'Caused by various Puccinia species. Spores spread by wind and require moisture to germinate.', 'medium', 'Sulfur dust, neem oil applications, remove infected plant material', 'Myclobutanil, propiconazole, triadimefon fungicides', 'Improve air circulation, avoid wetting foliage, remove alternate hosts, choose resistant varieties', ARRAY['beans', 'wheat', 'corn', 'roses', 'hollyhocks']),
('Healthy Plant', 'No disease detected. Your plant appears to be in good health.', 'Vibrant green color, no spots or discoloration, strong stems, healthy growth pattern.', 'N/A - This indicates a healthy plant with no visible disease symptoms.', 'low', 'Continue regular care routine. Consider preventive measures during high-risk seasons.', 'No treatment needed. Preventive fungicide applications during humid weather optional.', 'Maintain good watering practices, ensure proper nutrition, monitor regularly for early signs of problems', ARRAY['all plants']);