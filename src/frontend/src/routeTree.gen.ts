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
import { Route as prescriptionsImport } from "./routes/prescriptions";
import { Route as proImport } from "./routes/pro";
import { Route as proCaseRepositoryImport } from "./routes/pro.case-repository";
import { Route as proCaseTemplatesImport } from "./routes/pro.case-templates";
import { Route as proIndexImport } from "./routes/pro.index";
import { Route as proMateriaMedicaImport } from "./routes/pro.materia-medica";
import { Route as proPatientTimelineImport } from "./routes/pro.patient-timeline";
import { Route as proRemedyComparisonImport } from "./routes/pro.remedy-comparison";
import { Route as proRemedyFinderImport } from "./routes/pro.remedy-finder";
import { Route as proVoiceRecorderImport } from "./routes/pro.voice-recorder";
import { Route as reportsImport } from "./routes/reports";
import { Route as settingsImport } from "./routes/settings";

const rootRoute = rootImport;
const indexRoute = indexImport;
const patientsRoute = patientsImport;
const patientsIndexRoute = patientsIndexImport;
const patientsPatientIdRoute = patientsPatientIdImport;
const appointmentsRoute = appointmentsImport;
const prescriptionsRoute = prescriptionsImport;
const aiAssistantRoute = aiAssistantImport;
const billingRoute = billingImport;
const reportsRoute = reportsImport;
const loginRoute = loginImport;
const settingsRoute = settingsImport;
const proRoute = proImport;
const proIndexRoute = proIndexImport;
const proCaseRepositoryRoute = proCaseRepositoryImport;
const proCaseTemplatesRoute = proCaseTemplatesImport;
const proMateriaMedicaRoute = proMateriaMedicaImport;
const proPatientTimelineRoute = proPatientTimelineImport;
const proRemedyComparisonRoute = proRemedyComparisonImport;
const proRemedyFinderRoute = proRemedyFinderImport;
const proVoiceRecorderRoute = proVoiceRecorderImport;

export const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  patientsRoute.addChildren([patientsIndexRoute, patientsPatientIdRoute]),
  appointmentsRoute,
  prescriptionsRoute,
  aiAssistantRoute,
  billingRoute,
  reportsRoute,
  settingsRoute,
  proRoute.addChildren([
    proIndexRoute,
    proCaseRepositoryRoute,
    proCaseTemplatesRoute,
    proMateriaMedicaRoute,
    proPatientTimelineRoute,
    proRemedyComparisonRoute,
    proRemedyFinderRoute,
    proVoiceRecorderRoute,
  ]),
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
    "/prescriptions": {
      id: "/prescriptions";
      path: "/prescriptions";
      fullPath: "/prescriptions";
      preLoaderRoute: typeof prescriptionsImport;
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
    "/reports": {
      id: "/reports";
      path: "/reports";
      fullPath: "/reports";
      preLoaderRoute: typeof reportsImport;
      parentRoute: typeof rootImport;
    };
    "/settings": {
      id: "/settings";
      path: "/settings";
      fullPath: "/settings";
      preLoaderRoute: typeof settingsImport;
      parentRoute: typeof rootImport;
    };
    "/login": {
      id: "/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof loginImport;
      parentRoute: typeof rootImport;
    };
    "/pro": {
      id: "/pro";
      path: "/pro";
      fullPath: "/pro";
      preLoaderRoute: typeof proImport;
      parentRoute: typeof rootImport;
    };
    "/pro/": {
      id: "/pro/";
      path: "/";
      fullPath: "/pro/";
      preLoaderRoute: typeof proIndexImport;
      parentRoute: typeof proImport;
    };
    "/pro/case-repository": {
      id: "/pro/case-repository";
      path: "case-repository";
      fullPath: "/pro/case-repository";
      preLoaderRoute: typeof proCaseRepositoryImport;
      parentRoute: typeof proImport;
    };
    "/pro/case-templates": {
      id: "/pro/case-templates";
      path: "case-templates";
      fullPath: "/pro/case-templates";
      preLoaderRoute: typeof proCaseTemplatesImport;
      parentRoute: typeof proImport;
    };
    "/pro/materia-medica": {
      id: "/pro/materia-medica";
      path: "materia-medica";
      fullPath: "/pro/materia-medica";
      preLoaderRoute: typeof proMateriaMedicaImport;
      parentRoute: typeof proImport;
    };
    "/pro/patient-timeline": {
      id: "/pro/patient-timeline";
      path: "patient-timeline";
      fullPath: "/pro/patient-timeline";
      preLoaderRoute: typeof proPatientTimelineImport;
      parentRoute: typeof proImport;
    };
    "/pro/remedy-comparison": {
      id: "/pro/remedy-comparison";
      path: "remedy-comparison";
      fullPath: "/pro/remedy-comparison";
      preLoaderRoute: typeof proRemedyComparisonImport;
      parentRoute: typeof proImport;
    };
    "/pro/remedy-finder": {
      id: "/pro/remedy-finder";
      path: "remedy-finder";
      fullPath: "/pro/remedy-finder";
      preLoaderRoute: typeof proRemedyFinderImport;
      parentRoute: typeof proImport;
    };
    "/pro/voice-recorder": {
      id: "/pro/voice-recorder";
      path: "voice-recorder";
      fullPath: "/pro/voice-recorder";
      preLoaderRoute: typeof proVoiceRecorderImport;
      parentRoute: typeof proImport;
    };
  }
}
