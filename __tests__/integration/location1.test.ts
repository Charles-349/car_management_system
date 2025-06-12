// location.test.ts
import request from "supertest";
import app from "../../src/index"; 
import db from "../../src/drizzle/db";
import { LocationTable } from "../../src/drizzle/schema";

beforeEach(async () => {
  await db.delete(LocationTable); // Reset the location table before each test
});

describe("Location Integration Tests", () => {
  describe("POST /location", () => {
    it("should create a location", async () => {
      const res = await request(app).post("/location").send({
        locationName: "Nairobi",
        address: "123 Nairobi St",
        contactNumber: "0712345678",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Location created successfully");
    });

    it("should return 500 if service throws error", async () => {
      const original = db.insert;
      db.insert = () => { throw new Error("DB error") };

      const res = await request(app).post("/location").send({
        locationName: "Fail",
        address: "Nowhere",
        contactNumber: "0000000000",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("DB error");

      db.insert = original; // Restore
    });
  });

  describe("GET /location", () => {
    it("should retrieve all locations", async () => {
      await db.insert(LocationTable).values({ locationName: "Mombasa", address: "Beach Rd" });

      const res = await request(app).get("/location");

      expect(res.status).toBe(200);
      expect(res.body.locations.length).toBeGreaterThan(0);
    });

    it("should return 404 if no locations exist", async () => {
      const res = await request(app).get("/location");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No locations found");
    });

    it("should handle internal server error", async () => {
      const original = db.query.LocationTable.findMany;
      // @ts-ignore
      db.query.LocationTable.findMany = () => { throw new Error("Failure") };

      const res = await request(app).get("/location");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");

      db.query.LocationTable.findMany = original;
    });
  });

  describe("GET /location/:id", () => {
    it("should get a location by ID", async () => {
      const [loc] = await db.insert(LocationTable)
        .values({ locationName: "Kisumu", address: "Kisumu Rd" })
        .returning();

      const res = await request(app).get(`/location/${loc.locationID}`);
      expect(res.status).toBe(200);
      expect(res.body.location.locationName).toBe("Kisumu");
    });

    it("should return 400 for invalid ID", async () => {
      const res = await request(app).get("/location/abc");
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid location ID");
    });

    it("should return 404 if not found", async () => {
      const res = await request(app).get("/location/99999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Location not found");
    });

    it("should handle internal server error", async () => {
      const original = db.query.LocationTable.findFirst;
      // @ts-ignore
      db.query.LocationTable.findFirst = () => { throw new Error("Failure") };

      const res = await request(app).get("/location/1");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");

      db.query.LocationTable.findFirst = original;
    });
  });

  describe("PUT /location/:id", () => {
    it("should update a location", async () => {
      const [loc] = await db.insert(LocationTable)
        .values({ locationName: "Eldoret", address: "Uasin Gishu" })
        .returning();

      const res = await request(app)
        .put(`/location/${loc.locationID}`)
        .send({ locationName: "Eldoret Town", address: "Updated Address" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Location updated successfully");
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).put("/location/abc").send({});
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid location ID");
    });

    it("should return 404 if location not found", async () => {
      const res = await request(app).put("/location/9999").send({
        locationName: "Ghost Town", address: "Nowhere"
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Location not found");
    });

    it("should handle internal error", async () => {
      const [loc] = await db.insert(LocationTable)
        .values({ locationName: "Temp", address: "Test" })
        .returning();

      const spy = jest.spyOn(db, "update").mockImplementation(() => {
        throw new Error("Crash");
      });

      const res = await request(app).put(`/location/${loc.locationID}`).send({
        locationName: "Crash",
        address: "Error"
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");

      spy.mockRestore();
    });
  });

  describe("DELETE /location/:id", () => {
    it("should delete a location", async () => {
      const [loc] = await db.insert(LocationTable)
        .values({ locationName: "DeleteMe", address: "Bye" })
        .returning();

      const res = await request(app).delete(`/location/${loc.locationID}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Location deleted successfully");
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).delete("/location/abc");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invalid location ID");
    });

    it("should return 404 if location not found", async () => {
      const res = await request(app).delete("/location/9999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Location not found");
    });

    it("should handle internal error", async () => {
      const [loc] = await db.insert(LocationTable)
        .values({ locationName: "ToDelete", address: "Boom" })
        .returning();

      const spy = jest.spyOn(db, "delete").mockImplementation(() => {
        throw new Error("Fail");
      });

      const res = await request(app).delete(`/location/${loc.locationID}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error");

      spy.mockRestore();
    });
  });
});
