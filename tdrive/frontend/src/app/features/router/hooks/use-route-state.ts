import RouterService, { ClientStateType } from '../services/router-service';

/**
 * observedScope function which returns data to be observed by the hook
 */
export default function useRouteState(
  observedScope?: (state: ClientStateType) => ClientStateType,
): ClientStateType {
  return RouterService.useRouteState(observedScope);
}
