export default {
  env_dev: true,
  sentry_dsn: false,
  front_root_url:
    (document.location.protocol || "http") + "//" + document.location.host,
  api_root_url:
    (document.location.protocol || "http") + "//" + document.location.host,
  socketio_url:
    (document.location.protocol || "http").replace("http", "ws") +
    "//" +
    document.location.host,
  websocket_url:
    (document.location.protocol || "http").replace("http", "ws") +
    "//" +
    document.location.host,
};
