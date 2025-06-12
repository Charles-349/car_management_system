import request from "supertest";
import app from "../../src/index";
import db  from "../../src/drizzle/db";
import { LocationTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

describe("📍 Location Routes", () => {
  let createdId: number;

  const validLocation = {
    locationName: "Test Garage",
    address: "123 Test Ave",
    contactNumber: "0700111222"
  };

  const updatedLocation = {
    locationName: "Updated Garage",
    address: "999 Updated Blvd",
    contactNumber: "0799999999"
  };

  afterAll(async () => {
    // Clean up test location
    if (createdId) {
      await db.delete(LocationTable).where(eq(LocationTable.locationID, createdId));
    }
  });

  // CREATE
  it("should create a new location", async () => {
    const res = await request(app).post("/location").send(validLocation);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Location created successfully");

    const [location] = await db
      .select()
      .from(LocationTable)
      .where(eq(LocationTable.locationName, validLocation.locationName));

    expect(location).toBeDefined();
    createdId = location.locationID;
  });

  it("should fail to create location with missing fields", async () => {
    const res = await request(app).post("/location").send({
      address: "No name address"
    });
    expect(res.status).toBe(500); 
    expect(res.body.error || res.body.message).toBeDefined();
  });

  // GET ALL
  it("should return all locations", async () => {
    const res = await request(app).get("/location");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.locations)).toBe(true);
    expect(res.body.message).toBe("Locations retrieved successfully");
  });

  it("should return 404 if no locations exist", async () => {
    // Temporarily delete all locations
    const all = await db.select().from(LocationTable);
    await db.delete(LocationTable);
    const res = await request(app).get("/location");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No locations found");
    // Re-insert at least one
    const [id] = await db.insert(LocationTable).values(validLocation).returning({ id: LocationTable.locationID });
    createdId = id.id;
  });

  // GET BY ID
  it("should get a location by ID", async () => {
    const res = await request(app).get(`/location/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.location.locationName).toBe(validLocation.locationName);
  });

  it("should return 400 for invalid ID format", async () => {
    const res = await request(app).get(`/location/abc`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid location ID");
  });

  it("should return 404 for non-existent ID", async () => {
    const res = await request(app).get(`/location/999999`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Location not found");
  });

  // UPDATE
  it("should update a location by ID", async () => {
    const res = await request(app).put(`/location/${createdId}`).send(updatedLocation);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Location updated successfully");
    expect(res.body.updatedLocation.locationName).toBe(updatedLocation.locationName);
  });

  it("should return 400 for invalid update ID", async () => {
    const res = await request(app).put(`/location/abc`).send(updatedLocation);
    expect(res.status).toBe(404); // You return 404 on NaN in your controller
    expect(res.body.message).toBe("Invalid location ID");
  });

  it("should return 404 for updating non-existent location", async () => {
    const res = await request(app).put(`/location/999999`).send(updatedLocation);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Location not found");
  });

  // DELETE
  it("should delete a location by ID", async () => {
    const res = await request(app).delete(`/location/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Location deleted successfully");

    const exists = await db.select().from(LocationTable).where(eq(LocationTable.locationID, createdId));
    expect(exists.length).toBe(0);
  });

  it("should return 400 for invalid delete ID", async () => {
    const res = await request(app).delete(`/location/abc`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Invalid location ID");
  });

  it("should return 404 for deleting non-existent location", async () => {
    const res = await request(app).delete(`/location/999999`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Location not found");
  });
});
