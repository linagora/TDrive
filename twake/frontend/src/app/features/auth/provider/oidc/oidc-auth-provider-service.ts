import Oidc from 'oidc-client';

import environment from '../../../../environment/environment';
import { ConsoleConfiguration } from '../../../global/services/init-service';
import Observable from '../../../../deprecated/Observable/Observable';
import Logger from 'app/features/global/framework/logger-service';
import { getAsFrontUrl } from 'app/features/global/utils/URLUtils';
import { TdriveService } from '../../../global/framework/registry-decorator-service';
import EnvironmentService from '../../../global/framework/environment-service';
import { AuthProvider, InitParameters } from '../auth-provider';
import ConsoleService from 'app/features/console/services/console-service';
import jwtStorageService, { JWTDataType } from 'app/features/auth/jwt-storage-service';
import LocalStorage from 'app/features/global/framework/local-storage-service';

const OIDC_CALLBACK_URL = '/oidccallback';
const OIDC_SIGNOUT_URL = '/signout';

@TdriveService('OIDCAuthProvider')
export default class OIDCAuthProviderService
  extends Observable
  implements AuthProvider<unknown, unknown, unknown>
{
  private logger: Logger.Logger;
  private userManager: Oidc.UserManager | null = null;
  private initialized = false;
  private user!: Oidc.User;
  private params?: InitParameters;

  constructor(private configuration?: ConsoleConfiguration) {
    super();
    this.logger = Logger.getLogger('OIDCLoginProvider');
    this.logger.debug('OIDC configuration', configuration);
  }

  init(params: InitParameters): this {
    this.params = params;

    if (this.initialized) {
      this.logger.warn('Already initialized');
      return this;
    }

    if (!this.userManager) {
      Oidc.Log.logger = Logger.getLogger('OIDCClient');
      Oidc.Log.level = EnvironmentService.isProduction() ? Oidc.Log.WARN : Oidc.Log.DEBUG;

      this.userManager = new Oidc.UserManager({
        userStore: new Oidc.WebStorageStateStore({ store: window.localStorage }),
        authority: this.configuration?.authority || environment.api_root_url,
        client_id: this.configuration?.client_id,
        redirect_uri: getAsFrontUrl(OIDC_CALLBACK_URL),
        response_type: 'code',
        scope: 'openid profile email address phone offline_access',
        post_logout_redirect_uri: getAsFrontUrl(OIDC_SIGNOUT_URL),
        //silent_redirect_uri: getAsFrontUrl(OIDC_SILENT_URL),
        automaticSilentRenew: true,
        loadUserInfo: true,
        accessTokenExpiringNotificationTime: 60,
        filterProtocolClaims: true,
      });

      // For logout if signout or logout endpoint called
      // FIXME: This is not called, we must create the routes for it
      if ([OIDC_SIGNOUT_URL, '/logout'].includes(document.location.pathname)) {
        this.logger.debug('Redirect signout');
        this.signOut();
      }

      this.userManager.events.addUserLoaded(user => {
        // fires each time the user is loaded or updated
        this.logger.debug('OIDC user loaded listener', user);
        this.user = user;

        this.getJWTFromOidcToken(user, (err, jwt) => {
          if (err) {
            this.logger.error(
              'OIDC user loaded listener, error while getting the JWT from OIDC token',
              err,
            );
            this.signinRedirect();
            // FIXME: Should we return?
            //return;
          }

          if (!this.initialized) {
            // FIXME: Do we need to send back the user?
            this.onInitialized();
            this.initialized = true;
          } else {
            jwt && params.onNewToken(jwt);
          }
        });
      });

      this.userManager.events.addAccessTokenExpired(() => {
        this.logger.debug('OIDC access token expired listener');
        this.silentLogin();
        // FIXME: use params.onSessionExpired() if we can not renew
      });

      this.userManager.events.addAccessTokenExpiring(() => {
        this.logger.debug('OIDC access token is expiring');
        this.silentLogin();
      });

      this.userManager.events.addSilentRenewError(error => {
        // in case the renew failed, ask for login
        // since we have set automaticSilentRenew to true, this will be called when silentSignin raise error when token is expiring
        this.logger.error('OIDC silent renew error', error);
        this.signOut();
      });

      //This even listener is temporary disabled because of this issue: https://gitlab.ow2.org/lemonldap-ng/lemonldap-ng/-/issues/2358
      this.userManager.events.addUserSignedOut(() => {
        this.logger.info('OIDC Signed out listener');
        //this.signOut();
      });

      //This manage the initial sign-in when loading the app
      if (this.enforceFrontendUrl()) {
        this.silentLogin();
      }
    }

    return this;
  }

  //Redirect to valid frontend url to make sure oidc will work as expected
  private enforceFrontendUrl() {
    const frontUrl = (getDomain(environment.front_root_url || '') || '').toLocaleLowerCase();

    if (frontUrl && document.location.host.toLocaleLowerCase() !== frontUrl) {
      document.location.replace(
        document.location.protocol +
          '//' +
          getDomain(environment.front_root_url) +
          '/' +
          document.location.pathname +
          document.location.search +
          document.location.hash,
      );
      return false;
    }
    return true;
  }

  private async silentLogin(): Promise<void> {
    if (!this.userManager) {
      this.logger.debug('silentLogin, no auth provider');
      return;
    }

    //Try to use the in-url sign-in response from oidc if exists
    try {
      this.logger.debug('silentLogin, trying to get user from redirect callback');
      // This has to be called when we are in a redirect callback, not on other URLs
      // if so, we catch the error which will be 'No state in response' and we try to silently signin
      await this.userManager.signinRedirectCallback();
      // calling this will fire the userloaded event listener above
      await this.userManager.getUser();
    } catch (e) {
      this.logger.debug('silentLogin, not a signin response, trying to signin now', e);
      //There is no sign-in response, so we can try to silent login and use refresh token
      try {
        //First we try to see if we know this user
        let user = await this.userManager.getUser();
        if (user) {
          this.logger.debug('silentLogin, user is already defined, launching silent signin', user);
          // If user is defined, we try a silent signin
          // This will raise a userLoaded event, and so call some code in the listener above...
          user = await this.userManager.signinSilent();
          this.logger.debug('silentLogin, user from silent signin', user);
          // Note: the userloaded listener above should be called from the signinSilent call
          // if not get the JWT from the user and store the result in the JWT service with the help of callbacks
        } else {
          //If no user defined,  we try a redirect signin
          this.logger.debug('silentLogin, user not defined, launching a signin redirect');
          this.signinRedirect();
        }
      } catch (e) {
        this.logger.debug('silentLogin error, launching a signin redirect', e);
        // FIXME: We should also be able to show a message to the user with the onSessionExpired listener
        // In any case if it doesn't work we do a redirect signin
        this.signinRedirect();
      }
    }
  }

  async signIn(): Promise<void> {
    this.logger.info('Signin');
    await this.silentLogin();
  }

  async signUp(): Promise<void> {
    console.error("This doesn't exists for console provider.");
  }

  async signOut(): Promise<void> {
    this.logger.info('Signout');

    if (!this.userManager) {
      return;
    }

    try {
      // in some cases/providers we have to call remove to be sure to logout
      await this.userManager.removeUser();
    } catch (err) {
      this.logger.error('Can not delete user in signout', err);
    }

    try {
      await this.userManager.signoutRedirect({ id_token_hint: this.user?.id_token });
    } catch (err) {
      this.logger.error('Signout redirect error', err);
    }
  }

  /**
   * Try to get a new JWT token from the OIDC one:
   * Call the backend with the OIDC token, it will use it to get a new token from console
   */
  private async getJWTFromOidcToken(
    user: Oidc.User,
    callback: (err?: Error, accessToken?: JWTDataType) => void,
  ): Promise<void> {
    if (!user) {
      this.logger.info('getJWTFromOidcToken, Cannot getJWTFromOidcToken with a null user');
      callback(new Error('Cannot getJWTFromOidcToken with a null user'));
      return;
    }

    if (user.expired) {
      // TODO: try to get a new token from refresh one before asking for a JWT token
      this.logger.info('getJWTFromOidcToken, user expired');
    }

    ConsoleService.getNewAccessToken(
      { id_token: user.id_token, access_token: user.access_token },
      callback,
    );
  }

  signinRedirect() {
    if (document.location.href.indexOf('/login') === -1) {
      //Save requested URL for after redirect / sign-in
      LocalStorage.setItem('requested_url', {
        url: document.location.href,
        time: new Date().getTime(),
      });
    }

    jwtStorageService.clear();

    if (this.userManager) this.userManager.signinRedirect();
  }

  onInitialized() {
    //If user requested an url in the last 10 minutes, we open it
    const ref = LocalStorage.getItem('requested_url') as { url: string; time: number };
    if (ref && new Date().getTime() - ref.time < 1000 * 60 * 10) {
      LocalStorage.setItem('requested_url', null);
      document.location.replace(ref.url);
    }
    //End of post-login redirection

    this.params?.onInitialized();
  }
}

function getDomain(str: string): string {
  return ((str || '').split('//').pop() || '').split('/').shift() || '';
}
