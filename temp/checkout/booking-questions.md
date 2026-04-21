Marcos Flórez  [11:49]
Endpoint: GET /booking-questions/by-activity-option/:activityOptionId

Devuelve BookingQuestionProjection[] (
) con:

target: BOOKING | PASSENGER | EXTRA → dónde renderizar la pregunta.
required: REQUIRED | NOT_REQUIRED → si es obligatoria.
dataType, options, label, groupAge → cómo renderizar el input y a qué pasajeros aplica.
Ejemplo de respuesta:

```json
[
  {
    "id": "7b2e0c8a-1a5d-4c3a-9f0b-2f4a1e6d8c01",
    "activityId": "3a1d9c4e-2b7f-4a81-9e13-6c0f5a2d9b12",
    "dataType": "INPUT_TEXT",
    "label": "Full name as on passport",
    "required": "REQUIRED",
    "status": "ACTIVE",
    "target": "PASSENGER",
    "groupAge": ["ADULT", "CHILD"],
    "helpText": "Exactly as it appears on the travel document.",
    "placeholder": "e.g. Jane Marie Doe",
    "defaultValue": null,
    "minValue": null,
    "maxValue": null,
    "options": [],
    "activityOptions": [
      { "id": "c41b5e72-9d3a-4c6f-8e1a-0b2c7d4f9a10", "name": "Standard tour" }
    ],
    "createdAt": "2026-01-14T10:22:31.000Z",
    "updatedAt": "2026-03-02T08:15:09.000Z"
  },
  {
    "id": "8c3f1d9b-2a6e-4b12-90cd-3e5b7a1f9d22",
    "activityId": "3a1d9c4e-2b7f-4a81-9e13-6c0f5a2d9b12",
    "dataType": "OPTION",
    "label": "T-shirt size",
    "required": "NOT_REQUIRED",
    "status": "ACTIVE",
    "target": "PASSENGER",
    "groupAge": ["ADULT"],
    "helpText": null,
    "placeholder": null,
    "defaultValue": "M",
    "minValue": null,
    "maxValue": null,
    "options": [
      { "id": "opt-s", "label": "Small",  "value": "S" },
      { "id": "opt-m", "label": "Medium", "value": "M" },
      { "id": "opt-l", "label": "Large",  "value": "L" }
    ],
    "activityOptions": [
      { "id": "c41b5e72-9d3a-4c6f-8e1a-0b2c7d4f9a10", "name": "Standard tour" }
    ],
    "createdAt": "2026-01-14T10:25:00.000Z",
    "updatedAt": "2026-01-14T10:25:00.000Z"
  },
  {
    "id": "9d4a2e0c-3b7f-4c23-81de-4f6c8b2a0e33",
    "activityId": "3a1d9c4e-2b7f-4a81-9e13-6c0f5a2d9b12",
    "dataType": "INPUT_NUMBER",
    "label": "Number of backpacks",
    "required": "NOT_REQUIRED",
    "status": "ACTIVE",
    "target": "BOOKING",
    "groupAge": null,
    "helpText": "Max 2 per booking.",
    "placeholder": "0",
    "defaultValue": "0",
    "minValue": 0,
    "maxValue": 2,
    "options": [],
    "activityOptions": [
      { "id": "c41b5e72-9d3a-4c6f-8e1a-0b2c7d4f9a10", "name": "Standard tour" }
    ],
    "createdAt": "2026-02-10T09:00:00.000Z",
    "updatedAt": "2026-02-10T09:00:00.000Z"
  },
  {
    "id": "a0e5b3f1-4c80-4d34-92ef-5a7d9c3b1f44",
    "dataType": "CHECK_TERMS",
    "activityId": "3a1d9c4e-2b7f-4a81-9e13-6c0f5a2d9b12",
    "label": "I accept the cancellation policy",
    "required": "REQUIRED",
    "status": "ACTIVE",
    "target": "BOOKING",
    "groupAge": null,
    "helpText": null,
    "placeholder": null,
    "defaultValue": null,
    "minValue": null,
    "maxValue": null,
    "options": [],
    "activityOptions": [
      { "id": "c41b5e72-9d3a-4c6f-8e1a-0b2c7d4f9a10", "name": "Standard tour" }
    ],
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
]

Notas:
- `dataType`: `CHECKBOX`, `BOOLEAN`, `INPUT_TEXT`, `TEXT_AREA`, `INPUT_NUMBER`, `DATE`, `DATE_AND_TIME`, `PHONE`, `EMAIL`, `BIRTHDAY`, `COUNTRY`, `LANGUAGE`, `AGE`, `GENDER`, `PASSPORT`, `PASSPORT_EXPIRED`, `OPTION`, `MULTI_OPTION`, `CHECK_TERMS`, `RADIO_BUTTON`.
- `target`: `BOOKING` | `PASSENGER` | `EXTRA`.
- `required`: `REQUIRED` | `NOT_REQUIRED`.
- `groupAge` solo suele venir con `target=PASSENGER` (filtra a qué pasajeros aplica).- `options` solo está poblado para `OPTION`, `MULTI_OPTION`, `RADIO_BUTTON`.
```
