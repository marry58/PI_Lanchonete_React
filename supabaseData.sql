-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text,
  imagem text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nomeCategoria text,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lanchonete (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome_lanchonete text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  endereco text,
  status boolean,
  telefone text,
  horario text,
  CONSTRAINT lanchonete_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pedido_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id uuid,
  product_id uuid,
  title text,
  price numeric NOT NULL DEFAULT 0.00,
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pedido_items_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);
CREATE TABLE public.pedidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  auth_user_id uuid,
  total numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'pending'::text,
  address text,
  payment_method text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);
CREATE TABLE public.produtos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco numeric NOT NULL CHECK (preco >= 0::numeric),
  imagem text,
  estoque integer DEFAULT 0 CHECK (estoque >= 0),
  disponivel boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  categoria_id uuid,
  CONSTRAINT produtos_pkey PRIMARY KEY (id),
  CONSTRAINT produtos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  cpf character varying,
  cep character varying,
  unidade text,
  nasc date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nome text,
  email text,
  telefone text,
  role text NOT NULL DEFAULT 'client'::text,
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);