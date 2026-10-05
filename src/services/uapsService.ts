import {
  apiRequest,
  authHeaders,
} from "./api";

import type {
  InsulinType,
} from "../types/insulin";

import type {
  Uaps,
} from "../types/uaps";


type ListUapsOptions = {
  tipo?: InsulinType;

  apresentacao?: string;

  apenasDisponiveis?: boolean;
};


export async function listUaps({
  tipo,
  apresentacao,
  apenasDisponiveis = true,
}: ListUapsOptions = {}): Promise<Uaps[]> {

  const params =
    new URLSearchParams();


  if (tipo) {
    params.set(
      "tipo",
      tipo
    );
  }


  if (apresentacao) {
    params.set(
      "apresentacao",
      apresentacao
    );
  }


  params.set(
    "apenas_disponiveis",
    String(apenasDisponiveis)
  );


  const query =
    params.toString();


  return apiRequest(
    `/api/uaps${query ? `?${query}` : ""}`,
    {
      headers:
        authHeaders(),
    }
  );
}