import type {
  InsulinType,
} from "./insulin";


export type AvailabilityLevel =
  | "alto"
  | "medio"
  | "baixo"
  | "critico"
  | "indisponivel";


export type UapsStock = {
  id_estoque: number;

  tipo: InsulinType;

  apresentacao: string;

  quantidade_disponivel: number;

  nivel_disponibilidade: AvailabilityLevel;

  lote: string;

  validade: string;

  updated_at: string;
};


export type Uaps = {
  id_uaps: number;

  nome: string;

  bairro: string;

  endereco: string;

  latitude: string | null;

  longitude: string | null;

  ativa: boolean;

  estoque: UapsStock[];
};