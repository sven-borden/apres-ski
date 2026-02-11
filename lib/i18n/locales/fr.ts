export interface Translations {
  nav: {
    hub: string;
    lineup: string;
    feasts: string;
    crew: string;
    basecamp: string;
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
    access_codes: string;
    placeholder_label: string;
    placeholder_code: string;
    add_code: string;
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
    no_access_codes: string;
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
  };
}

const fr: Translations = {
  nav: {
    hub: "Hub",
    lineup: "Planning",
    feasts: "Repas",
    crew: "Crew",
    basecamp: "Chalet",
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
    dinner_by: "Dîner par",
    no_dinner: "Pas de dîner prévu",
    i_cook_tonight: "Je cuisine ce soir",
    claiming: "Réservation\u2026",
    more_info: "Plus d'infos",
    check_in: "Arrivée",
    max: "max",
    meal_nudge: (n: number) => `${n} dîners cherchent un chef`,
    meal_nudge_one: "1 dîner cherche un chef",
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
    access_codes: "Codes d'accès",
    placeholder_label: "Libellé",
    placeholder_code: "Code",
    add_code: "+ Ajouter un code",
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
    no_access_codes: "Aucun code d'accès",
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
    dinner: "Dîner",
    edit_dinner: "Modifier le dîner",
    whos_cooking: "Qui cuisine ?",
    whats_for_dinner: "Qu'est-ce qu'on mange ?",
    placeholder_meal: "Décrivez le repas\u2026",
    no_one_assigned: "Personne n'est encore assigné",
    shopping_list: "Liste de courses",
    placeholder_item: "Ajouter un article\u2026",
  },
};

export default fr;
