export interface RegisterInputDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface UserOutputDTO {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface LoginOutputDTO {
  token: string;
  user: UserOutputDTO;
}
