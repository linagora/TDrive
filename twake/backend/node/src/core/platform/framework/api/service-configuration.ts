export interface TdriveServiceConfiguration {
  get<T>(name?: string, defaultValue?: T): T;
}
