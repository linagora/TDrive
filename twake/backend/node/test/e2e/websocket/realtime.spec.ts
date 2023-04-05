import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { init, TestPlatform } from "../setup";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import io from "socket.io-client";

describe("The Realtime API", () => {
  let platform: TestPlatform;
  let socket: SocketIOClient.Socket;

  beforeEach(async ends => {
    platform = await init({
      services: [
        "webserver",
        "database",
        "search",
        "storage",
        "message-queue",
        "applications",
        "user",
        "auth",
        "websocket",
        "realtime",
        "channels" /* FIXME: platform is not started if a business service is not in dependencies */,
        "counter",
        "statistics",
        "platform-services",
      ],
    });

    socket = io.connect("http://localhost:3000", { path: "/socket" });

    ends();
  });

  afterEach(async ends => {
    await platform.tearDown();
    platform = null;
    socket && socket.close();
    socket = null;

    ends();
  });

  describe("Joining rooms", () => {
    it("should fail when token is not defined", async done => {
      const token = await platform.auth.getJWTToken();
      const name = "/ping";

      socket.on("connect", () => {
        socket
          .emit("authenticate", { token })
          .on("authenticated", () => {
            socket.emit("realtime:join", { name });
            socket.on("realtime:join:error", (event: any) => {
              expect(event.name).toEqual(name);
              done();
            });
            socket.on("realtime:join:success", () => done(new Error("Should not occur")));
          })
          .on("unauthorized", () => {
            done(new Error("Should not occur"));
          });
      });
    });

    it("should fail when token is not valid", async done => {
      const token = await platform.auth.getJWTToken();
      const name = "/ping";
      const roomToken = "invalid token";

      socket.on("connect", () => {
        socket
          .emit("authenticate", { token })
          .on("authenticated", () => {
            socket.emit("realtime:join", { name, token: roomToken });
            socket.on("realtime:join:error", (event: any) => {
              expect(event.name).toEqual(name);
              done();
            });
            socket.on("realtime:join:success", () => done(new Error("Should not occur")));
          })
          .on("unauthorized", () => {
            done(new Error("Should not occur"));
          });
      });
    });

    it("should receive a realtime:join:success when token is valid and room has been joined", async done => {
      const token = await platform.auth.getJWTToken();
      const name = "test";
      const roomToken = "tdrive";

      socket.on("connect", () => {
        socket
          .emit("authenticate", { token })
          .on("authenticated", () => {
            socket.emit("realtime:join", { name, token: roomToken });
            socket.on("realtime:join:error", () => done(new Error("Should not occur")));
            socket.on("realtime:join:success", (event: any) => {
              expect(event.name).toEqual(name);
              done();
            });
          })
          .on("unauthorized", () => {
            done(new Error("Should not occur"));
          });
      });
    });
  });

  describe("Leaving rooms", () => {
    it("should not fail when room has not been joined first", async done => {
      const token = await platform.auth.getJWTToken();
      const name = "roomtest";

      socket.on("connect", () => {
        socket
          .emit("authenticate", { token })
          .on("authenticated", () => {
            socket.emit("realtime:leave", { name });
            socket.on("realtime:leave:error", () => done(new Error("should not fail")));
            socket.on("realtime:leave:success", (event: any) => {
              expect(event.name).toEqual(name);
              done();
            });
          })
          .on("unauthorized", () => {
            done(new Error("Should not occur"));
          });
      });
    });

    it("should send success when room has been joined first", async done => {
      const token = await platform.auth.getJWTToken();
      const roomToken = "tdrive";
      const name = "roomtest";

      socket.on("connect", () => {
        socket
          .emit("authenticate", { token })
          .on("authenticated", () => {
            socket.emit("realtime:join", { name, token: roomToken });
            socket.emit("realtime:leave", { name });
            socket.on("realtime:leave:error", () => done(new Error("should not fail")));
            socket.on("realtime:leave:success", (event: any) => {
              expect(event.name).toEqual(name);
              done();
            });
          })
          .on("unauthorized", () => {
            done(new Error("Should not occur"));
          });
      });
    });
  });
});
