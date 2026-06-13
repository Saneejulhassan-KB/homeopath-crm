/* eslint-disable */
// This file is auto-generated. Do not edit manually.
// Generated route tree for HomeoPath CRM

import type { createRouter } from "@tanstack/react-router";

import { Route as rootImport } from "./routes/__root";
import { Route as aiAssistantImport } from "./routes/ai-assistant";
import { Route as appointmentsImport } from "./routes/appointments";
import { Route as billingImport } from "./routes/billing";
import { Route as indexImport } from "./routes/index";
import { Route as loginImport } from "./routes/login";
import { Route as patientsImport } from "./routes/patients";
import { Route as patientsPatientIdImport } from "./routes/patients.$patientId";
import { Route as patientsIndexImport } from "./routes/patients.index";
import { Route as pharmacyImport } from "./routes/pharmacy";
import { Route as settingsImport } from "./routes/settings";
import { Route as userManagementImport } from "./routes/user-management";
import { Route as userManagementUserIdImport } from "./routes/user-management.$userId";
import { Route as userManagementIndexImport } from "./routes/user-management.index";
import { Route as userManagementRolesRoleIdImport } from "./routes/user-management.roles.$roleId";
import { Route as waitingPatientsImport } from "./routes/waiting-patients";

const rootRoute = rootImport;
const indexRoute = indexImport;
const patientsRoute = patientsImport;
const patientsIndexRoute = patientsIndexImport;
const patientsPatientIdRoute = patientsPatientIdImport;
const appointmentsRoute = appointmentsImport;
const aiAssistantRoute = aiAssistantImport;
const billingRoute = billingImport;
const loginRoute = loginImport;
const settingsRoute = settingsImport;
const userManagementRoute = userManagementImport;
const userManagementIndexRoute = userManagementIndexImport;
const userManagementUserIdRoute = userManagementUserIdImport;
const userManagementRolesRoleIdRoute = userManagementRolesRoleIdImport;
const pharmacyRoute = pharmacyImport;
const waitingPatientsRoute = waitingPatientsImport;

export const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  patientsRoute.addChildren([patientsIndexRoute, patientsPatientIdRoute]),
  appointmentsRoute,
  aiAssistantRoute,
  billingRoute,
  settingsRoute,
  userManagementRoute.addChildren([
    userManagementIndexRoute,
    userManagementUserIdRoute,
    userManagementRolesRoleIdRoute,
  ]),
  pharmacyRoute,
  waitingPatientsRoute,
]);

export type Router = ReturnType<typeof createRouter<typeof routeTree>>;

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof indexImport;
      parentRoute: typeof rootImport;
    };
    "/patients": {
      id: "/patients";
      path: "/patients";
      fullPath: "/patients";
      preLoaderRoute: typeof patientsImport;
      parentRoute: typeof rootImport;
    };
    "/patients/": {
      id: "/patients/";
      path: "/";
      fullPath: "/patients/";
      preLoaderRoute: typeof patientsIndexImport;
      parentRoute: typeof patientsImport;
    };
    "/patients/$patientId": {
      id: "/patients/$patientId";
      path: "$patientId";
      fullPath: "/patients/$patientId";
      preLoaderRoute: typeof patientsPatientIdImport;
      parentRoute: typeof patientsImport;
    };
    "/appointments": {
      id: "/appointments";
      path: "/appointments";
      fullPath: "/appointments";
      preLoaderRoute: typeof appointmentsImport;
      parentRoute: typeof rootImport;
    };
    "/ai-assistant": {
      id: "/ai-assistant";
      path: "/ai-assistant";
      fullPath: "/ai-assistant";
      preLoaderRoute: typeof aiAssistantImport;
      parentRoute: typeof rootImport;
    };
    "/billing": {
      id: "/billing";
      path: "/billing";
      fullPath: "/billing";
      preLoaderRoute: typeof billingImport;
      parentRoute: typeof rootImport;
    };
    "/settings": {
      id: "/settings";
      path: "/settings";
      fullPath: "/settings";
      preLoaderRoute: typeof settingsImport;
      parentRoute: typeof rootImport;
    };
    "/user-management": {
      id: "/user-management";
      path: "/user-management";
      fullPath: "/user-management";
      preLoaderRoute: typeof userManagementImport;
      parentRoute: typeof rootImport;
    };
    "/user-management/": {
      id: "/user-management/";
      path: "/";
      fullPath: "/user-management/";
      preLoaderRoute: typeof userManagementIndexImport;
      parentRoute: typeof userManagementImport;
    };
    "/user-management/$userId": {
      id: "/user-management/$userId";
      path: "$userId";
      fullPath: "/user-management/$userId";
      preLoaderRoute: typeof userManagementUserIdImport;
      parentRoute: typeof userManagementImport;
    };
    "/user-management/roles/$roleId": {
      id: "/user-management/roles/$roleId";
      path: "roles/$roleId";
      fullPath: "/user-management/roles/$roleId";
      preLoaderRoute: typeof userManagementRolesRoleIdImport;
      parentRoute: typeof userManagementImport;
    };
    "/pharmacy": {
      id: "/pharmacy";
      path: "/pharmacy";
      fullPath: "/pharmacy";
      preLoaderRoute: typeof pharmacyImport;
      parentRoute: typeof rootImport;
    };
    "/waiting-patients": {
      id: "/waiting-patients";
      path: "/waiting-patients";
      fullPath: "/waiting-patients";
      preLoaderRoute: typeof waitingPatientsImport;
      parentRoute: typeof rootImport;
    };
    "/login": {
      id: "/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof loginImport;
      parentRoute: typeof rootImport;
    };
  }
}
