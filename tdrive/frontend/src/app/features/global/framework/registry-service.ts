class ServiceRegistry {
  services: { [key: string]: unknown };

  constructor() {
    this.services = {};
  }

  register(name: string, service: unknown) {
    if (!service || !name) {
      return;
    }

    this.services[name] = service;
  }
}

export default new ServiceRegistry();
