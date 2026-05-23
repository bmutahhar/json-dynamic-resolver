export const incidentRoutingModel = {
  id: "fleet-incident-router-v1",
  name: "Fleet Incident Router",
  handles: {
    inputs: [
      {
        key: "incidentSummary",
        type: "text",
        required: true,
      },
      {
        key: "incidentType",
        type: "dropdown",
        required: true,
        options: [
          { label: "Network", value: "network" },
          { label: "Billing", value: "billing" },
          { label: "Security", value: "security" },
        ],
      },
      {
        key: "rollbackPlan",
        type: "textarea",
        required: false,
        visible: false,
        optionsIf: [
          {
            when: {
              equals: {
                key: "incidentType",
                value: "network",
              },
            },
            set: {
              visible: true,
              required: true,
            },
          },
        ],
      },
      {
        key: "accountIds",
        type: "text_array",
        required: false,
        visible: false,
        optionsIf: [
          {
            when: {
              equals: {
                key: "customerImpact",
                value: true,
              },
            },
            set: {
              visible: true,
              required: true,
              minRequired: 1,
            },
          },
        ],
      },
      {
        key: "pagerDutyService",
        type: "dropdown",
        required: false,
        visible: false,
        options: [
          { label: "Core Platform", value: "core-platform" },
          { label: "Payments", value: "payments" },
          { label: "Identity", value: "identity" },
        ],
        optionsIf: [
          {
            when: {
              equals: {
                key: "priority",
                value: "P1",
              },
            },
            set: {
              visible: true,
              required: true,
            },
          },
        ],
      },
    ],
  },
  additional_params: {
    responseWindow: {
      type: "dropdown",
      default: "4h",
      options: [
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "8h", value: "8h" },
        { label: "24h", value: "24h" },
      ],
      optionsIf: [
        {
          when: {
            equals: {
              key: "priority",
              value: "P1",
            },
          },
          set: {
            default: "1h",
            options: [{ label: "1h", value: "1h" }],
          },
        },
      ],
    },
    communicationsMode: {
      type: "dropdown",
      default: "email",
      options: [
        { label: "Email", value: "email" },
        { label: "Slack", value: "slack" },
        { label: "Bridge Call", value: "bridge" },
      ],
      optionsIf: [
        {
          when: {
            equals: {
              key: "incidentType",
              value: "security",
            },
          },
          set: {
            default: "bridge",
            options: [
              { label: "Bridge Call", value: "bridge" },
              { label: "Slack", value: "slack" },
            ],
          },
        },
      ],
    },
    autoEscalate: {
      type: "checkbox",
      default: false,
      optionsIf: [
        {
          when: {
            and: [
              {
                equals: {
                  key: "priority",
                  value: "P1",
                },
              },
              {
                has: "pagerDutyService",
              },
            ],
          },
          set: {
            default: true,
          },
        },
      ],
    },
  },
};

export const shipmentQuoteModel = {
  id: "shipment-quote-v2",
  name: "Shipment Quote Workflow",
  handles: {
    inputs: [
      {
        key: "destinationCountry",
        type: "text",
        required: true,
      },
      {
        key: "transportMode",
        type: "dropdown",
        required: true,
        options: [
          { label: "Ground", value: "ground" },
          { label: "Air", value: "air" },
          { label: "Sea", value: "sea" },
        ],
      },
      {
        key: "isHazmat",
        type: "checkbox",
        required: false,
      },
      {
        key: "hsCode",
        type: "text",
        required: false,
        visible: false,
        optionsIf: [
          {
            when: {
              equals: {
                key: "isHazmat",
                value: true,
              },
            },
            set: {
              visible: true,
              required: true,
            },
          },
        ],
      },
      {
        key: "insuranceProvider",
        type: "dropdown",
        required: false,
        visible: false,
        options: [
          { label: "Astra Coverage", value: "astra" },
          { label: "Meridian Mutual", value: "meridian" },
        ],
        optionsIf: [
          {
            when: {
              where: [{ key: "declaredValue", op: "gte", value: 10000 }],
            },
            set: {
              visible: true,
              required: true,
            },
          },
        ],
      },
    ],
  },
  additional_params: {
    deliverySpeed: {
      type: "dropdown",
      default: "standard",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Priority", value: "priority" },
        { label: "Express", value: "express" },
      ],
      optionsIf: [
        {
          when: {
            equals: {
              key: "transportMode",
              value: "air",
            },
          },
          set: {
            default: "priority",
            options: [
              { label: "Priority", value: "priority" },
              { label: "Express", value: "express" },
            ],
          },
        },
      ],
    },
    customsReview: {
      type: "dropdown",
      default: "auto",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Manual", value: "manual" },
      ],
      optionsIf: [
        {
          when: {
            equals: {
              key: "destinationCountry",
              value: "BR",
            },
          },
          set: {
            default: "manual",
          },
        },
      ],
    },
    carbonOffset: {
      type: "checkbox",
      default: false,
      visible: true,
      optionsIf: [
        {
          when: {
            equals: {
              key: "transportMode",
              value: "air",
            },
          },
          set: {
            default: true,
          },
        },
      ],
    },
  },
};
