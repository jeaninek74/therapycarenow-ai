import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const therapycarenowWeb = service("therapycarenow-web", {
    build: { buildCommand: "pnpm install && pnpm build", builder: "NIXPACKS" },
    start: "node dist/index.js",
    healthcheck: "/",
    healthcheckTimeout: 300,
    replicas: { "us-west2": 1 },
    domains: ["www.therapycarenow.com"],
  });
  const therapycarenowAi = service("therapycarenow-ai", {
    source: github("jeaninek74/therapycarenow-ai", { branch: "main", upstreamUrl: "https://github.com/jeaninek74/therapycarenow-ai" }),
    build: { buildCommand: "pnpm install && pnpm build", builder: "NIXPACKS" },
    start: "node dist/index.js",
    healthcheck: "/",
    healthcheckTimeout: 300,
    replicas: { "us-west2": 1 },
  });

  return project("TherapyCareNow", {
    variables: { managed: false },
    resources: [therapycarenowWeb, therapycarenowAi],
  });
});
