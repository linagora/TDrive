import SecuredConnection from './SecuredConnection.js';
/** MultipleSecuredConnections
 * Manage multiple secured connections as one (multiple publish and centralized event manager)
 */

export default class MultipleSecuredConnections {
  constructor(callback, options) {
    if (!options) {
      options = {};
    }

    //Options :
    this.disableDuplicates = options.disableDuplicates !== false;

    this.secured_connections = {};
    this.callback = callback;

    this.removing_secured_connections_timeouts = {};
  }

  publish(data) {
    Object.keys(this.secured_connections).forEach(secured_connection_key => {
      var secured_connection = this.secured_connections[secured_connection_key];
      secured_connection.publish(data, () => {});
    });
  }

  event(route, event, data) {
    //Disable duplicates
    var string = JSON.stringify(data);
    if (
      string === this.last_event &&
      this.disableDuplicates &&
      !(event === 'close' || event === 'open' || event === 'init')
    ) {
      return;
    }
    this.last_event = string;

    if (!data) {
      data = {};
    }
    data._route = route;
    if (this.callback) this.callback(event, data);
  }

  addConnection(route, option, http_options, key) {
    if (this.secured_connections[route]) {
      this.secured_connections[route].removing = false;
      if (this.removing_secured_connections_timeouts[route]) {
        clearTimeout(this.removing_secured_connections_timeouts[route]);
      }
      return;
    }

    if (this.secured_connections[route]) {
      return;
    }

    this.secured_connections[route] = new SecuredConnection(
      route,
      option,
      (event, data) => {
        this.event(route, event, data);
      },
      http_options,
      key,
    );
  }

  removeConnection(route) {
    if (!this.secured_connections[route] || this.secured_connections[route].removing) {
      return;
    }

    if (this.removing_secured_connections_timeouts[route]) {
      clearTimeout(this.removing_secured_connections_timeouts[route]);
    }

    this.secured_connections[route].removing = true;
    this.removing_secured_connections_timeouts[route] = setTimeout(() => {
      if (this.secured_connections[route]) {
        this.secured_connections[route].close();
        delete this.secured_connections[route];
      }
    }, 10000);
  }

  getRoutes() {
    return Object.keys(this.secured_connections);
  }

  closeAll() {
    Object.keys(this.secured_connections).foEach(route => {
      this.removeConnection(route);
    });
  }
}
