import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { init, TestPlatform } from "../setup";
import { TestDbService } from "../utils.prepare.db";
import { v1 as uuidv1 } from "uuid";
import { CompanyLimitsEnum } from "../../../src/services/user/web/types";

describe("The /users API", () => {
  const url = "/internal/services/users/v1";
  let platform: TestPlatform;

  let testDbService: TestDbService;

  const nonExistentId = uuidv1();

  beforeEach(async ends => {
    platform = await init();
    ends();
  });
  afterEach(async ends => {
    await platform.tearDown();
    platform = null;
    ends();
  });

  beforeAll(async ends => {
    const platform = await init({
      services: [
        "database",
        "search",
        "message-queue",
        "websocket",
        "applications",
        "webserver",
        "user",
        "auth",
        "storage",
        "counter",
        "console",
        "workspaces",
        "statistics",
        "platform-services",
      ],
    });

    testDbService = await TestDbService.getInstance(platform);
    await testDbService.createCompany();
    const workspacePk = { id: uuidv1(), company_id: testDbService.company.id };
    await testDbService.createWorkspace(workspacePk);
    await testDbService.createUser([workspacePk], {
      workspaceRole: "moderator",
      companyRole: "admin",
      email: "admin@admin.admin",
      username: "adminuser",
      firstName: "admin",
    });
    await testDbService.createUser([workspacePk]);

    ends();
  });

  afterAll(async ends => {
    ends();
  });

  describe("The GET /users/:id route", () => {
    it("should 401 when not authenticated", async done => {
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/1`,
      });

      expect(response.statusCode).toBe(401);
      done();
    });

    it("should 404 when user does not exists", async done => {
      const jwtToken = await platform.auth.getJWTToken({ sub: testDbService.users[0].id });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/${nonExistentId}`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: "Not Found",
        message: `User ${nonExistentId} not found`,
        statusCode: 404,
      });
      done();
    });

    it("should 200 and big response for myself", async done => {
      const myId = testDbService.users[0].id;
      const jwtToken = await platform.auth.getJWTToken({ sub: myId });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/${myId}`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const resource = response.json()["resource"];

      expect(resource).toMatchObject({
        id: myId,
        provider: expect.any(String),
        provider_id: expect.any(String),
        email: expect.any(String),
        is_verified: expect.any(Boolean),
        picture: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
        created_at: expect.any(Number),
        deleted: expect.any(Boolean),
        status: expect.any(String),
        last_activity: expect.any(Number),

        //Below is only if this is myself

        preference: expect.objectContaining({
          locale: expect.any(String),
          timezone: expect.any(Number),
        }),
      });

      expect(resource["companies"]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: expect.stringMatching(/owner|admin|member|guest/),
            status: expect.stringMatching(/active|deactivated|invited/),
            company: {
              id: expect.any(String),
              name: expect.any(String),
              logo: expect.any(String),
            },
          }),
        ]),
      );

      done();
    });

    it("should 200 and short response for another user", async done => {
      const myId = testDbService.users[0].id;
      const anotherUserId = testDbService.users[1].id;

      const jwtToken = await platform.auth.getJWTToken({ sub: myId });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/${anotherUserId}`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const resource = response.json()["resource"];

      expect(resource).toMatchObject({
        id: anotherUserId,
        provider: expect.any(String),
        provider_id: expect.any(String),
        email: expect.any(String),
        is_verified: expect.any(Boolean),
        picture: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
        created_at: expect.any(Number),
        deleted: expect.any(Boolean),
        status: expect.any(String),
        last_activity: expect.any(Number),
      });

      expect(resource).not.toMatchObject({
        locale: expect.anything(),
        timezone: expect.anything(),
        companies: expect.anything(),
      });

      done();
    });
  });

  describe("The GET /users route", () => {
    it("should 401 when user is not authenticated", async done => {
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users`,
      });

      expect(response.statusCode).toBe(401);
      done();
    });

    it("should 200 with array of users", async done => {
      const myId = testDbService.users[0].id;
      const anotherUserId = testDbService.users[1].id;

      const jwtToken = await platform.auth.getJWTToken({ sub: myId });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
        query: {
          user_ids: `${myId},${anotherUserId}`,
          company_ids: "fd96c8a8-ae77-11eb-a1a1-0242ac120005",
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toMatchObject({ resources: expect.any(Array) });
      const resources = json.resources;

      done();
    });
  });

  describe("The GET /users/:user_id/companies route", () => {
    it("should 401 when not authenticated", async done => {
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/1/companies`,
      });

      expect(response.statusCode).toBe(401);
      done();
    });

    it("should 404 when user does not exists", async done => {
      const jwtToken = await platform.auth.getJWTToken({ sub: testDbService.users[0].id });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/${nonExistentId}/companies`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: "Not Found",
        message: `User ${nonExistentId} not found`,
        statusCode: 404,
      });
      done();
    });

    it("should 200 and on correct request", async done => {
      const myId = testDbService.users[0].id;
      const anotherUserId = testDbService.users[1].id;

      const jwtToken = await platform.auth.getJWTToken({ sub: myId });
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/users/${anotherUserId}/companies`,
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const resources = response.json()["resources"];
      expect(resources.length).toBeGreaterThan(0);

      for (const resource of resources) {
        expect(resource).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          logo: expect.any(String),
          role: expect.stringMatching(/owner|admin|member|guest/),
          status: expect.stringMatching(/active|deactivated|invited/),
        });

        if (resource.plan) {
          expect(resource.plan).toMatchObject({
            name: expect.any(String),
            limits: expect.objectContaining({
              [CompanyLimitsEnum.CHAT_MESSAGE_HISTORY_LIMIT]: expect.any(Number || undefined),
              [CompanyLimitsEnum.COMPANY_MEMBERS_LIMIT]: expect.any(Number || undefined),
            }),
          });
        }
        if (resources.stats) {
          expect(resource.plan).toMatchObject({
            created_at: expect.any(Number),
            total_members: expect.any(Number),
            total_guests: expect.any(Number),
          });
        }
      }
      done();
    });
  });

  describe("The GET /companies/:company_id route", () => {
    it("should 404 when company does not exists", async done => {
      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/companies/11111111-1111-1111-1111-111111111111`,
      });
      expect(response.statusCode).toBe(404);
      done();
    });

    it("should 200 when company exists", async done => {
      const companyId = testDbService.company.id;

      const response = await platform.app.inject({
        method: "GET",
        url: `${url}/companies/${companyId}`,
      });
      expect(response.statusCode).toBe(200);

      const json = response.json();

      expect(json.resource).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        logo: expect.any(String),
      });

      if (json.resource.plan) {
        expect(json.resource.plan).toMatchObject({
          name: expect.any(String),
          limits: expect.objectContaining({
            [CompanyLimitsEnum.CHAT_MESSAGE_HISTORY_LIMIT]: expect.any(Number || undefined),
            [CompanyLimitsEnum.COMPANY_MEMBERS_LIMIT]: expect.any(Number || undefined),
          }),
        });
      }

      expect(json.resource.stats).toMatchObject({
        created_at: expect.any(Number),
        total_members: expect.any(Number),
        total_guests: expect.any(Number),
        total_messages: expect.any(Number),
      });

      done();
    });
  });

  describe("User's device management", () => {
    const deviceToken = "testDeviceToken";

    describe("Register device (POST)", () => {
      it("should 400 when type is not FCM", async done => {
        const myId = testDbService.users[0].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: myId });
        const response = await platform.app.inject({
          method: "POST",
          url: `${url}/devices`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
          payload: {
            resource: {
              type: "another",
              value: "value",
              version: "version",
            },
          },
        });

        const resp = response.json();
        expect(response.statusCode).toBe(400);
        expect(resp).toMatchObject({
          statusCode: 400,
          error: "Bad Request",
          message: "Type should be FCM only",
        });
        done();
      });

      it("should 200 when ok", async done => {
        const firstId = testDbService.users[0].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: firstId });
        const response = await platform.app.inject({
          method: "POST",
          url: `${url}/devices`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
          payload: {
            resource: {
              type: "FCM",
              value: deviceToken,
              version: "1",
            },
          },
        });

        const resp = response.json();
        expect(response.statusCode).toBe(200);

        expect(resp.resource).toMatchObject({
          type: "FCM",
          value: deviceToken,
          version: "1",
        });

        const user = await testDbService.getUserFromDb({ id: firstId });
        expect(user.devices).toMatchObject([deviceToken]);
        const device = await testDbService.getDeviceFromDb(deviceToken);
        expect(device).toMatchObject({
          id: deviceToken,
          user_id: firstId,
          type: "FCM",
          version: "1",
        });

        done();
      });

      it("should 200 when register token to another person", async done => {
        const firstId = testDbService.users[0].id;
        const secondId = testDbService.users[1].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: secondId });
        const response = await platform.app.inject({
          method: "POST",
          url: `${url}/devices`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
          payload: {
            resource: {
              type: "FCM",
              value: deviceToken,
              version: "1",
            },
          },
        });

        const resp = response.json();
        expect(response.statusCode).toBe(200);

        expect(resp.resource).toMatchObject({
          type: "FCM",
          value: deviceToken,
          version: "1",
        });

        // second user should have now this token
        let user = await testDbService.getUserFromDb({ id: secondId });
        expect(user.devices).toMatchObject([deviceToken]);
        const device = await testDbService.getDeviceFromDb(deviceToken);
        expect(device).toMatchObject({
          id: deviceToken,
          user_id: secondId,
          type: "FCM",
          version: "1",
        });

        // and first — not

        user = await testDbService.getUserFromDb({ id: firstId });
        expect(user.devices).toMatchObject([]);

        done();
      });
    });
    describe("List registered devices (GET)", () => {
      it("should 200 when request devices", async done => {
        const myId = testDbService.users[1].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: myId });
        const response = await platform.app.inject({
          method: "GET",
          url: `${url}/devices`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        });

        const resp = response.json();
        expect(response.statusCode).toBe(200);
        expect(resp).toMatchObject({
          resources: [
            {
              type: "FCM",
              value: "testDeviceToken",
              version: "1",
            },
          ],
        });
        done();
      });
    });

    describe("De-register device (DELETE)", () => {
      it("should 200 when device not found for the user", async done => {
        const myId = testDbService.users[1].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: myId });
        const response = await platform.app.inject({
          method: "DELETE",
          url: `${url}/devices/somethingRandom`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        });
        expect(response.statusCode).toBe(204);

        const user = await testDbService.getUserFromDb({ id: myId });
        expect(user.devices).toMatchObject([deviceToken]);
        const device = await testDbService.getDeviceFromDb(deviceToken);
        expect(device).toMatchObject({
          id: deviceToken,
          user_id: myId,
          type: "FCM",
          version: "1",
        });

        done();
      });

      it("should 200 when device found and device should be removed", async done => {
        const myId = testDbService.users[1].id;

        const jwtToken = await platform.auth.getJWTToken({ sub: myId });
        const response = await platform.app.inject({
          method: "DELETE",
          url: `${url}/devices/${deviceToken}`,
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        });
        expect(response.statusCode).toBe(204);

        const user = await testDbService.getUserFromDb({ id: myId });
        expect(user.devices).toMatchObject([]);
        const device = await testDbService.getDeviceFromDb(deviceToken);
        expect(device).toBeFalsy();

        done();
      });
    });
  });
});
