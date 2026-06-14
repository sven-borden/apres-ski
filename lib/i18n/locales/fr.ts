export interface Translations {
  nav: {
    hub: string;
    lineup: string;
    feasts: string;
    shopping: string;
    crew: string;
    basecamp: string;
    main_navigation: string;
  };
  common: {
    save: string;
    saving: string;
    cancel: string;
    close: string;
    edit: string;
    add: string;
    remove: string;
    copy: string;
    copied: string;
    tap_to_reveal: string;
    preview: string;
    view_all: string;
    loading: string;
    switch_to_en: string;
    switch_to_fr: string;
  };
  status: {
    unassigned: string;
    claimed: string;
    confirmed: string;
  };
  offline: {
    banner: string;
  };
  user_setup: {
    title: string;
    your_name: string;
    placeholder_name: string;
    pick_color: string;
    join: string;
  };
  hub: {
    chalet: string;
    weather: string;
    weather_unavailable: string;
    snow_depth: string;
    freezing_level: string;
    schedule: string;
    attendance: string;
    meal_plan: string;
    assigned: string;
    unassigned: string;
    shopped: string;
    no_trip: string;
    set_up_trip: string;
    today: string;
    dinner_by: string;
    no_dinner: string;
    i_cook_tonight: string;
    claiming: string;
    more_info: string;
    check_in: string;
    max: string;
    meal_nudge: (n: number) => string;
    meal_nudge_one: string;
    meal_nudge_cta: string;
  };
  weather: {
    conditions: {
      clear_sky: string;
      mostly_clear: string;
      partly_cloudy: string;
      overcast: string;
      foggy: string;
      icy_fog: string;
      light_drizzle: string;
      drizzle: string;
      heavy_drizzle: string;
      freezing_drizzle: string;
      heavy_freezing_drizzle: string;
      light_rain: string;
      rain: string;
      heavy_rain: string;
      freezing_rain: string;
      heavy_freezing_rain: string;
      light_snow: string;
      snow: string;
      heavy_snow: string;
      snow_grains: string;
      light_showers: string;
      showers: string;
      heavy_showers: string;
      light_snow_showers: string;
      heavy_snow_showers: string;
      thunderstorm: string;
      thunderstorm_hail: string;
      thunderstorm_heavy_hail: string;
      unknown: string;
    };
    snow_vibe: {
      powder_paradise: string;
      deep_and_dreamy: string;
      solid_base: string;
      decent_cover: string;
      thin_cover: string;
      no_snow: string;
    };
  };
  countdown: {
    in_days: (n: number) => string;
    day_of: (cur: number, total: number) => string;
    hope_fun: string;
  };
  days: {
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
  };
  trip: {
    title: string;
    edit_trip: string;
    set_up_trip: string;
    trip_name: string;
    placeholder_name: string;
    start_date: string;
    end_date: string;
    no_trip: string;
  };
  basecamp: {
    title: string;
    edit_basecamp: string;
    set_up_basecamp: string;
    chalet_name: string;
    placeholder_chalet: string;
    address: string;
    placeholder_address: string;
    coordinates: string;
    coordinates_hint: string;
    maps_url: string;
    wifi_network: string;
    placeholder_network: string;
    wifi_password: string;
    placeholder_password: string;
    check_in: string;
    check_out: string;
    capacity: string;
    capacity_hint: string;
    capacity_beds: (n: number) => string;
    emergency_contacts: string;
    placeholder_contact_name: string;
    placeholder_phone: string;
    placeholder_role: string;
    add_contact: string;
    remove_contact: string;
    notes: string;
    placeholder_notes: string;
    not_configured: string;
    no_chalet: string;
    no_emergency_contacts: string;
    wifi: string;
    schedule: string;
    password: string;
    no_location: string;
    chalet_location: string;
    open_in_maps: string;
    placeholder_coordinates_example: string;
    placeholder_check_in_time: string;
    placeholder_check_out_time: string;
    tricount_url: string;
    placeholder_tricount_url: string;
    open_tricount: string;
  };
  crew: {
    title: string;
    add_member: string;
    edit_member: string;
    name: string;
    placeholder_name: string;
    pick_color: string;
    color: string;
    no_trip: string;
    set_up_in_basecamp: string;
    no_members: string;
    adding: string;
    capacity: (n: number) => string;
  };
  feasts: {
    title: string;
    no_trip: string;
    dinner: string;
    edit_dinner: string;
    whos_cooking: string;
    whats_for_dinner: string;
    placeholder_meal: string;
    no_one_assigned: string;
    shopping_list: string;
    placeholder_item: string;
    quantity_placeholder: string;
    unit_kg: string;
    unit_g: string;
    unit_l: string;
    unit_dl: string;
    unit_cl: string;
    unit_pcs: string;
    unit_bottles: string;
    unit_packs: string;
    mark_purchased: (item: string) => string;
    mark_unpurchased: (item: string) => string;
    estimate_quantities: string;
    estimating: string;
    estimate_error: string;
    estimate_rate_limited: string;
    reset_quantities: string;
    resetting: string;
    reset_error: string;
    headcount: (count: number) => string;
    general: string;
    general_subtitle: string;
    exclude_from_shopping: string;
  };
  lineup: {
    present: string;
    absent: string;
    toggle_attendance: (name: string, date: string, status: string) => string;
  };
  errors: {
    save_failed: string;
    claim_failed: string;
    add_failed: string;
    toggle_failed: string;
    delete_failed: string;
  };
  validation: {
    required_field: string;
    invalid_coordinates: string;
    latitude_range: string;
    longitude_range: string;
    invalid_date_range: string;
    at_least_one_chef: string;
  };
  shopping: {
    title: string;
    no_trip: string;
    no_items: string;
    items_remaining: (n: number) => string;
    all_done: string;
    purchased: string;
    smart_merge: string;
    merging: string;
    merge_error: string;
    from_meal: (date: string) => string;
    show_details: string;
    hide_details: string;
    category_other: string;
  };
  confirm: {
    remove_contact_title: string;
    remove_contact_message: string;
    mark_absent_title: string;
    mark_absent_message: (name: string) => string;
    trip_dates_title: string;
    trip_dates_message: (count: number) => string;
    remove_shopping_item_title: string;
    remove_shopping_item_message: (item: string) => string;
    confirm_remove: string;
    confirm_save: string;
    reset_quantities_title: string;
    reset_quantities_message: string;
    confirm_reset: string;
  };
}

const fr: Translations = {
  nav: {
    hub: "Hub",
    lineup: "Planning",
    feasts: "Repas",
    shopping: "Courses",
    crew: "Crew",
    basecamp: "Chalet",
    main_navigation: "Navigation principale",
  },
  common: {
    save: "Enregistrer",
    saving: "Enregistrement\u2026",
    cancel: "Annuler",
    close: "Fermer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Retirer",
    copy: "Copier",
    copied: "Copié !",
    tap_to_reveal: "Appuyer pour afficher",
    preview: "Aperçu",
    view_all: "Tout voir",
    loading: "Chargement\u2026",
    switch_to_en: "Passer en anglais",
    switch_to_fr: "Passer en français",
  },
  status: {
    unassigned: "Non attribué",
    claimed: "Réservé",
    confirmed: "Confirmé",
  },
  offline: {
    banner: "Vous êtes hors ligne — les modifications seront synchronisées à la reconnexion",
  },
  user_setup: {
    title: "Rejoindre le séjour",
    your_name: "Votre nom",
    placeholder_name: "Entrez votre nom",
    pick_color: "Choisissez une couleur",
    join: "Rejoindre",
  },
  hub: {
    chalet: "Chalet",
    weather: "Météo",
    weather_unavailable: "Météo indisponible",
    snow_depth: "Neige",
    freezing_level: "Isotherme 0°",
    schedule: "Planning",
    attendance: "La Troupe",
    meal_plan: "Repas",
    assigned: "Attribués",
    unassigned: "Non attribués",
    shopped: "Courses",
    no_trip: "Aucun séjour configuré. Créez-en un pour commencer !",
    set_up_trip: "Configurer le séjour",
    today: "Aujourd'hui",
    dinner_by: "Souper par",
    no_dinner: "Pas de souper prévu",
    i_cook_tonight: "Je cuisine ce soir",
    claiming: "Réservation\u2026",
    more_info: "Plus d'infos",
    check_in: "Arrivée",
    max: "max",
    meal_nudge: (n: number) => `${n} soupers cherchent un chef`,
    meal_nudge_one: "1 souper cherche un chef",
    meal_nudge_cta: "Choisir un soir",
  },
  weather: {
    conditions: {
      clear_sky: "Ciel dégagé",
      mostly_clear: "Plutôt dégagé",
      partly_cloudy: "Partiellement nuageux",
      overcast: "Couvert",
      foggy: "Brouillard",
      icy_fog: "Brouillard givrant",
      light_drizzle: "Bruine légère",
      drizzle: "Bruine",
      heavy_drizzle: "Forte bruine",
      freezing_drizzle: "Bruine verglaçante",
      heavy_freezing_drizzle: "Forte bruine verglaçante",
      light_rain: "Pluie légère",
      rain: "Pluie",
      heavy_rain: "Forte pluie",
      freezing_rain: "Pluie verglaçante",
      heavy_freezing_rain: "Forte pluie verglaçante",
      light_snow: "Neige légère",
      snow: "Neige",
      heavy_snow: "Forte neige",
      snow_grains: "Grains de neige",
      light_showers: "Averses légères",
      showers: "Averses",
      heavy_showers: "Fortes averses",
      light_snow_showers: "Averses de neige légères",
      heavy_snow_showers: "Fortes averses de neige",
      thunderstorm: "Orage",
      thunderstorm_hail: "Orage avec grêle",
      thunderstorm_heavy_hail: "Orage avec forte grêle",
      unknown: "Inconnu",
    },
    snow_vibe: {
      powder_paradise: "Paradis de la poudreuse !",
      deep_and_dreamy: "Profonde et rêveuse",
      solid_base: "Base solide",
      decent_cover: "Couverture correcte",
      thin_cover: "Couverture fine",
      no_snow: "Pas encore de neige",
    },
  },
  countdown: {
    in_days: (n: number) => (n === 1 ? "DANS 1 JOUR" : `DANS ${n} JOURS`),
    day_of: (cur: number, total: number) => `JOUR ${cur} / ${total}`,
    hope_fun: "J'espère que c'était bien !",
  },
  days: {
    sun: "Dim",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Jeu",
    fri: "Ven",
    sat: "Sam",
  },
  trip: {
    title: "Séjour",
    edit_trip: "Modifier le séjour",
    set_up_trip: "Configurer le séjour",
    trip_name: "Nom du séjour",
    placeholder_name: "Semaine de ski 2026",
    start_date: "Date de début",
    end_date: "Date de fin",
    no_trip: "Aucun séjour configuré",
  },
  basecamp: {
    title: "Chalet",
    edit_basecamp: "Modifier le chalet",
    set_up_basecamp: "Configurer le chalet",
    chalet_name: "Nom du chalet",
    placeholder_chalet: "ex. Chalet Les Étoiles",
    address: "Adresse",
    placeholder_address: "123 Route de montagne, Verbier",
    coordinates: "Coordonnées",
    coordinates_hint: "lat, lng (ex. 46.096, 7.228)",
    maps_url: "URL Maps",
    wifi_network: "Réseau WiFi",
    placeholder_network: "Nom du réseau",
    wifi_password: "Mot de passe WiFi",
    placeholder_password: "Mot de passe",
    check_in: "Arrivée",
    check_out: "Départ",
    capacity: "Capacité",
    capacity_hint: "nombre de lits",
    capacity_beds: (n: number) => (n === 1 ? "1 lit" : `${n} lits`),
    emergency_contacts: "Contacts d'urgence",
    placeholder_contact_name: "Nom",
    placeholder_phone: "Téléphone",
    placeholder_role: "Rôle (ex. Propriétaire, Gardien)",
    add_contact: "+ Ajouter un contact",
    remove_contact: "Retirer le contact",
    notes: "Notes",
    placeholder_notes: "Infos parking, règles de la maison, etc.",
    not_configured: "Non configuré",
    no_chalet: "Aucune info chalet",
    no_emergency_contacts: "Aucun contact d'urgence",
    wifi: "WiFi",
    schedule: "Horaires",
    password: "Mot de passe",
    no_location: "Aucun emplacement défini",
    chalet_location: "Emplacement du chalet",
    open_in_maps: "Ouvrir dans Maps",
    placeholder_coordinates_example: "46.096, 7.228",
    placeholder_check_in_time: "16:00",
    placeholder_check_out_time: "10:00",
    tricount_url: "Lien Tricount",
    placeholder_tricount_url: "https://tricount.com/...",
    open_tricount: "Ouvrir Tricount",
  },
  crew: {
    title: "Crew",
    add_member: "Ajouter un membre",
    edit_member: "Modifier le membre",
    name: "Nom",
    placeholder_name: "Entrez son nom",
    pick_color: "Choisissez une couleur",
    color: "Couleur",
    no_trip: "Aucun séjour configuré",
    set_up_in_basecamp: "Configurer dans Chalet",
    no_members: "Personne n'a encore rejoint — partagez le lien pour inviter",
    adding: "Ajout\u2026",
    capacity: (n: number) => `Capacité (${n})`,
  },
  feasts: {
    title: "Repas",
    no_trip: "Aucun séjour configuré — allez dans Chalet pour en créer un",
    dinner: "Souper",
    edit_dinner: "Modifier le souper",
    whos_cooking: "Qui cuisine ?",
    whats_for_dinner: "Qu'est-ce qu'on mange ?",
    placeholder_meal: "Décrivez le repas\u2026",
    no_one_assigned: "Personne n'est encore assigné",
    shopping_list: "Liste de courses",
    placeholder_item: "Ajouter un article\u2026",
    quantity_placeholder: "Qté",
    unit_kg: "kg",
    unit_g: "g",
    unit_l: "L",
    unit_dl: "dL",
    unit_cl: "cl",
    unit_pcs: "pcs",
    unit_bottles: "bouteilles",
    unit_packs: "paquets",
    mark_purchased: (item: string) => `Marquer ${item} comme acheté`,
    mark_unpurchased: (item: string) => `Démarquer ${item}`,
    estimate_quantities: "Estimer les quantités",
    estimating: "Estimation\u2026",
    estimate_error: "Échec de l\u2019estimation — veuillez réessayer",
    estimate_rate_limited: "Trop de requêtes — veuillez patienter avant de réessayer",
    reset_quantities: "Réinitialiser",
    resetting: "Réinitialisation\u2026",
    reset_error: "Échec de la réinitialisation — veuillez réessayer",
    headcount: (count: number) => `${count} ${count === 1 ? "mangeur" : "mangeurs"} au chalet`,
    general: "Général",
    general_subtitle: "Articles pour tout le séjour",
    exclude_from_shopping: "J'achète moi",
  },
  lineup: {
    present: "Présent",
    absent: "Absent",
    toggle_attendance: (name: string, date: string, status: string) =>
      `Basculer la présence de ${name} le ${date}, actuellement ${status}`,
  },
  errors: {
    save_failed: "Échec de l\u2019enregistrement — veuillez réessayer",
    claim_failed: "Échec de la réservation — veuillez réessayer",
    add_failed: "Échec de l\u2019ajout — veuillez réessayer",
    toggle_failed: "Échec de la mise à jour — veuillez réessayer",
    delete_failed: "Échec de la suppression — veuillez réessayer",
  },
  validation: {
    required_field: "Ce champ est requis",
    invalid_coordinates: "Format invalide. Utilisez : latitude, longitude",
    latitude_range: "La latitude doit être entre -90 et 90",
    longitude_range: "La longitude doit être entre -180 et 180",
    invalid_date_range: "La date de fin doit être après la date de début",
    at_least_one_chef: "Au moins un chef doit être sélectionné",
  },
  shopping: {
    title: "Courses",
    no_trip: "Aucun séjour configuré — allez dans Chalet pour en créer un",
    no_items: "Aucun article dans les listes de courses",
    items_remaining: (n: number) => n === 1 ? "1 article restant" : `${n} articles restants`,
    all_done: "Toutes les courses sont faites !",
    purchased: "Achetés",
    smart_merge: "Fusion intelligente",
    merging: "Fusion en cours\u2026",
    merge_error: "Échec de la fusion — veuillez réessayer",
    from_meal: (date: string) => `Repas du ${date}`,
    show_details: "Voir les détails",
    hide_details: "Masquer les détails",
    category_other: "Autre",
  },
  confirm: {
    remove_contact_title: "Retirer le contact",
    remove_contact_message: "\u00cates-vous s\u00fbr de vouloir retirer ce contact d\u2019urgence ?",
    mark_absent_title: "Marquer comme absent",
    mark_absent_message: (name: string) => `\u00cates-vous s\u00fbr de vouloir marquer ${name} comme absent(e) ?`,
    trip_dates_title: "Dates de repas affect\u00e9es",
    trip_dates_message: (count: number) =>
      count === 1
        ? "1 jour avec des repas attribu\u00e9s sera en dehors des nouvelles dates. Les repas concern\u00e9s ne seront plus visibles."
        : `${count} jours avec des repas attribu\u00e9s seront en dehors des nouvelles dates. Les repas concern\u00e9s ne seront plus visibles.`,
    remove_shopping_item_title: "Retirer l\u2019article",
    remove_shopping_item_message: (item: string) => `\u00cates-vous s\u00fbr de vouloir retirer \u00ab\u202f${item}\u202f\u00bb de la liste ?`,
    confirm_remove: "Retirer",
    confirm_save: "Enregistrer quand m\u00eame",
    reset_quantities_title: "Réinitialiser les quantités",
    reset_quantities_message: "Cela supprimera toutes les quantités estimées de la liste de courses. Êtes-vous sûr ?",
    confirm_reset: "Réinitialiser",
  },
};

export default fr;
