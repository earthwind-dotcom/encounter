import { defineRailway, github, project, service } from "railway/iac";
// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "web";
export default defineRailway(() => {
  const web = service("web", {
    source: github("earthwind-dotcom/encounter", { branch: "main", checkSuites: false }),
    build: { buildCommand: "npm run build", buildEnvironment: "V3", builder: "RAILPACK" },
    start: "npm start",
    healthcheck: "/api/health",
    healthcheckTimeout: 60,
    replicas: { "sfo": 1 },
  });

  return project("encounter", {
    variables: { managed: false },
    resources: [web],
  });
});
