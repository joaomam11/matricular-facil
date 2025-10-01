-- Create students table
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  curso TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a school management system)
CREATE POLICY "Anyone can view students" 
ON public.alunos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create students" 
ON public.alunos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update students" 
ON public.alunos 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete students" 
ON public.alunos 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_alunos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alunos_timestamp
BEFORE UPDATE ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.update_alunos_updated_at();

-- Create index for search performance
CREATE INDEX idx_alunos_nome ON public.alunos(nome);
CREATE INDEX idx_alunos_curso ON public.alunos(curso);
CREATE INDEX idx_alunos_matricula ON public.alunos(matricula);