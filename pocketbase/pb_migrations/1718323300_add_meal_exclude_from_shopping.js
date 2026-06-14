/// <reference path="../pb_data/types.d.ts" />

// Adds `excludeFromShopping` (bool) to meals — toggles whether a day's items
// are excluded from the consolidated shopping list.

migrate(
  (app) => {
    const meals = app.findCollectionByNameOrId("meals");
    meals.fields.add(
      new BoolField({
        name: "excludeFromShopping",
      }),
    );
    app.save(meals);
  },
  (app) => {
    const meals = app.findCollectionByNameOrId("meals");
    const field = meals.fields.getByName("excludeFromShopping");
    if (field) {
      meals.fields.removeById(field.id);
      app.save(meals);
    }
  },
);
