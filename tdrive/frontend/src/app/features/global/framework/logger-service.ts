import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import EnvironmentService from './environment-service';

const isProduction = EnvironmentService.isProduction();

isProduction ? log.setDefaultLevel(log.levels.WARN) : log.setDefaultLevel(log.levels.DEBUG);

prefix.reg(log);
prefix.apply(log, {
  template: `${isProduction ? '' : '[%t] '}%l - %n -`,
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name || 'Tdrive';
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

export default log;
