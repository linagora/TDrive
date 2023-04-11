import { JWTDataType } from 'app/features/auth/jwt-storage-service';

type AuthEvent =
  | 'userLoaded'
  | 'userUnloaded'
  | 'userSignedOut'
  | 'accessTokenExpiring'
  | 'accessTokenExpired'
  | 'silentRenewError';

export type InitParameters = {
  onSessionExpired?: () => void;
  onNewToken: (token?: JWTDataType) => void;
  onInitialized: () => void;
};

export interface AuthProvider<SignInParameters, SignOutParameters, SignUpParameters> {
  init(params?: InitParameters): this;

  signIn?(params: SignInParameters): Promise<void>;

  signOut?(params: SignOutParameters): Promise<void>;

  signUp?(params: SignUpParameters): Promise<void>;

  addEventListener?(event: AuthEvent, listener: (args: unknown) => void): void;
}
