export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
