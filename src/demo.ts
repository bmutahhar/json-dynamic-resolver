import { incidentRoutingModel, shipmentQuoteModel } from "./fixtures.js";
import { resolveModelConfig } from "./resolver.js";

const incidentState = {
  incidentType: "network",
  priority: "P1",
  customerImpact: true,
  pagerDutyService: "core-platform",
};

const resolvedIncident = resolveModelConfig(incidentRoutingModel, incidentState);

const shipmentState = {
  destinationCountry: "BR",
  transportMode: "air",
  isHazmat: true,
  declaredValue: 25000,
};

const resolvedShipment = resolveModelConfig(shipmentQuoteModel, shipmentState);

console.log("Incident Routing (P1 network incident):");
console.log(JSON.stringify(resolvedIncident, null, 2));
console.log("\nShipment Quote (air + hazmat + high declared value):");
console.log(JSON.stringify(resolvedShipment, null, 2));
