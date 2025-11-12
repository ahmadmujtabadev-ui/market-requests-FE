import { HttpService } from "../index";

/** Domain types */
export type Exchange = "binance" | "bybit" | "bingx";
export type CredStatus = "active" | "revoked";

export interface CreateCredentialDto {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  email?: string;
  username?: string;
  label?: string;
}
export interface Credential {
  id: string;
  exchange: "binance" | "bybit" | "bingx";
  label: string;
  apiKeyMasked: string;
  apiKeyFingerprint: string;
  status: "active" | "revoked"; // <- needed for revoke UI update
  createdAt: string;
  lastUsedAt?: string;
  ownerEmail?: string;
  ownerUsername?: string;
  notes?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

class CredentialService extends HttpService {
  private readonly prefix: string = "/api/v1/credentials";

  /**
   * Create/Save credential
   */
  save = (data: any, option = {}): Promise<any> =>
    this.post(this.prefix + `/save`, data, option);

  /**
   * List credentials
   */
  getcrediential = (): Promise<any> => this.get(this.prefix + `/`, {});
  list = (): Promise<any> => this.get(this.prefix + `/`, {}); // optional alias

  /**
   * Rotate a credential
   * POST /api/v1/credentials/:id/rotate
   */
  rotate = (id: string, option = {}): Promise<any> =>
    this.post(`${this.prefix}/${id}/rotate`, {}, option);

  /**
   * Revoke a credential
   * POST /api/v1/credentials/:id/revoke
   */
  revoke = (id: string, option = {}): Promise<any> =>
    this.post(`${this.prefix}/${id}/revoke`, {}, option);

  /**
   * Delete a credential
   * DELETE /api/v1/credentials/:id
   */
  remove = (id: string, option = {}): Promise<any> =>
    this.delete(`${this.prefix}/${id}`, option);
}



export const credentialService = new CredentialService();
