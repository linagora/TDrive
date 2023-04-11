/* eslint-disable @typescript-eslint/no-explicit-any */
class Electron {
  isElectron() {
    return (window as any).electron !== undefined;
  }

  setBadge(value: any) {
    if (!this.isElectron()) return;
    try {
      if (
        (window as any).electron &&
        (window as any).electron.remote &&
        (window as any).electron.remote.app &&
        (window as any).electron.remote.app.dock
      ) {
        (window as any).electron.remote.app.dock.setBadge(value);
      }
      if ((window as any).electron && (window as any).electron.ipcRenderer) {
        (window as any).electron.ipcRenderer.send('application:update_badge', value);
      }
    } catch (err) {
      console.log('No electron app available for setting dock badge');
    }
  }
}

const instanceElectron = new Electron();
export default instanceElectron;
