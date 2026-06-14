/// <reference path="../pb_data/types.d.ts" />

// Upsert the admin superuser from env on every boot (idempotent). Lets us
// provision the dashboard account reproducibly without exec'ing into the
// container. No-op when the env vars are unset.
onBootstrap((e) => {
  e.next();

  const email = $os.getenv("PB_SUPERUSER_EMAIL");
  const password = $os.getenv("PB_SUPERUSER_PASSWORD");
  if (!email || !password) {
    console.log("[superuser] PB_SUPERUSER_EMAIL/PASSWORD unset — skipping");
    return;
  }

  let record;
  try {
    record = e.app.findAuthRecordByEmail("_superusers", email);
  } catch {
    record = new Record(e.app.findCollectionByNameOrId("_superusers"));
    record.set("email", email);
  }
  record.setPassword(password);
  e.app.save(record);
  console.log("[superuser] upserted", email);
});
