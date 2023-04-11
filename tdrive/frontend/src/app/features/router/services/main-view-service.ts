import RouterService from './router-service';
import AppViewService, { ViewConfiguration } from './app-view-service';

class MainViewService extends AppViewService {
  public getViewType(): 'application' | 'channel' | '' {
    return this.getConfiguration().context?.type === 'application' ? 'application' : 'channel';
  }

  public select(channelId: string, configuration?: ViewConfiguration) {
    if (channelId !== this.getId()) {
      RouterService.push(RouterService.generateRouteFromState({ channelId, tabId: '' }));
    }
    super.select(channelId, configuration);
  }
}

export default new MainViewService();
