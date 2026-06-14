/// <reference path="../pb_data/types.d.ts" />

// Initial Apres-ski schema. Mirrors the previous Firestore model.
// All collections use open (public) API rules to match the trust-based,
// no-auth model: an empty string "" rule = allow everyone; null = admin only.
//
// Conventions:
//  - Date-only values (startDate, endDate, meal/attendance date) stay `text`
//    in YYYY-MM-DD form to avoid timezone drift (same as Firestore strings).
//  - Firestore Timestamp fields -> `autodate` (onCreate / onUpdate).
//  - Single-record collections (trips, basecamp, weather) are plain
//    collections; the client pins a fixed record id ("current", "la-tzoumaz").
//  - Cross-record references (attendance.participantId, meals.responsibleIds)
//    stay denormalized text/json — same loose model as Firestore.

migrate(
  (app) => {
    const open = {
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
    };

    // ---- trips (single record, was doc `current`) ----------------------
    app.save(
      new Collection({
        type: "base",
        name: "trips",
        ...open,
        fields: [
          { type: "text", name: "name", required: true },
          { type: "text", name: "startDate" }, // YYYY-MM-DD
          { type: "text", name: "endDate" }, // YYYY-MM-DD
          { type: "text", name: "updatedBy" },
          { type: "autodate", name: "createdAt", onCreate: true },
          { type: "autodate", name: "updatedAt", onCreate: true, onUpdate: true },
        ],
      })
    );

    // ---- basecamp (single record, was doc `current`) -------------------
    app.save(
      new Collection({
        type: "base",
        name: "basecamp",
        ...open,
        fields: [
          { type: "text", name: "name" },
          { type: "text", name: "address" },
          { type: "json", name: "coordinates" }, // { lat, lng }
          { type: "text", name: "mapsUrl" },
          { type: "json", name: "wifi" }, // { network, password }
          { type: "text", name: "checkIn" },
          { type: "text", name: "checkOut" },
          { type: "number", name: "capacity", onlyInt: true },
          { type: "json", name: "emergencyContacts" }, // [{ name, phone, role }]
          { type: "text", name: "notes" },
          { type: "text", name: "tricountUrl" },
          { type: "text", name: "updatedBy" },
          { type: "autodate", name: "updatedAt", onCreate: true, onUpdate: true },
        ],
      })
    );

    // ---- participants --------------------------------------------------
    app.save(
      new Collection({
        type: "base",
        name: "participants",
        ...open,
        fields: [
          { type: "text", name: "name", required: true },
          { type: "text", name: "color" },
          { type: "text", name: "avatar" },
          { type: "text", name: "tripId" },
          { type: "autodate", name: "joinedAt", onCreate: true },
        ],
      })
    );

    // ---- attendance (was composite id {participantId}_{date}) ----------
    app.save(
      new Collection({
        type: "base",
        name: "attendance",
        ...open,
        fields: [
          { type: "text", name: "participantId", required: true },
          { type: "text", name: "participantName" },
          { type: "text", name: "participantColor" },
          { type: "text", name: "date", required: true }, // YYYY-MM-DD
          { type: "bool", name: "present" },
          { type: "text", name: "tripId" },
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_attendance_participant_date ON attendance (participantId, date)",
        ],
      })
    );

    // ---- meals (was id = YYYY-MM-DD) -----------------------------------
    app.save(
      new Collection({
        type: "base",
        name: "meals",
        ...open,
        fields: [
          { type: "text", name: "date", required: true }, // YYYY-MM-DD
          { type: "text", name: "tripId" },
          { type: "json", name: "responsibleIds" }, // string[]
          { type: "text", name: "description" },
          { type: "json", name: "shoppingList" }, // ShoppingItem[]
          { type: "text", name: "updatedBy" },
          { type: "autodate", name: "updatedAt", onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_meals_date ON meals (date)"],
      })
    );

    // ---- weather (single record, was `la-tzoumaz`) ---------------------
    app.save(
      new Collection({
        type: "base",
        name: "weather",
        ...open,
        fields: [
          { type: "number", name: "temperature" },
          { type: "number", name: "temperatureMin" },
          { type: "number", name: "temperatureMax" },
          { type: "number", name: "weatherCode", onlyInt: true },
          { type: "number", name: "snowDepth" },
          { type: "number", name: "freezingLevel" },
          { type: "autodate", name: "fetchedAt", onCreate: true, onUpdate: true },
        ],
      })
    );
  },
  (app) => {
    // revert
    for (const name of [
      "attendance",
      "meals",
      "weather",
      "participants",
      "basecamp",
      "trips",
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) {
        // already gone
      }
    }
  }
);
