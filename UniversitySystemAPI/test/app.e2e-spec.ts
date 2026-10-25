import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module.js";
it("boots the full circular module graph and serves course requests", async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = module.createNestApplication();
  await app.init();
  try {
    await request(app.getHttpServer())
      .get("/course")
      .expect(200)
      .expect({ message: "All courses fetched", data: [] });
  } finally {
    await app.close();
  }
});
