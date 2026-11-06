import { createClient } from "@supabase/supabase-js";

const localHosts = new Set(["127.0.0.1", "localhost", "host.docker.internal", "kong", "supabase_kong"]);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_USER_PASSWORD;

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  throw new Error("Demo profiles are disabled in production and Vercel environments.");
}
if (process.env.SUPABASE_ENV !== "local" || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_ENV=local and local Supabase credentials before seeding.");
}
if (!localHosts.has(new URL(supabaseUrl).hostname)) {
  throw new Error("Demo seeding only accepts a local Supabase hostname.");
}
if (!password || password.length < 12) {
  throw new Error("Set DEMO_USER_PASSWORD to a unique password with at least 12 characters.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const demoProfiles = [
  {
    email: "demo.maya@example.invalid",
    display_name: "Demo Maya",
    age: 29,
    gender: "Woman",
    country: "Portugal",
    city: "Lisbon",
    locale: "en",
    marital_status: "Single",
    occupation: "Architect",
    education: "Masters",
    interests: ["Architecture", "Cooking", "Hiking"],
    bio: "Local test profile. Loves old buildings, slow breakfasts, and a good walking route.",
    looking_for: "Someone kind, curious, and happy to explore a new neighborhood.",
    preferred_min_age: 25,
    preferred_max_age: 38,
    preferred_gender: "Man",
  },
  {
    email: "demo.luca@example.invalid",
    display_name: "Demo Luca",
    age: 32,
    gender: "Man",
    country: "Italy",
    city: "Milan",
    locale: "it",
    marital_status: "Single",
    occupation: "Teacher",
    education: "Masters",
    interests: ["Reading", "Cycling", "Food"],
    bio: "Local test profile. Usually planning a weekend ride or looking for a new book.",
    looking_for: "A thoughtful conversation and someone who enjoys trying new things.",
    preferred_min_age: 26,
    preferred_max_age: 39,
    preferred_gender: "Woman",
  },
  {
    email: "demo.noor@example.invalid",
    display_name: "Demo Noor",
    age: 27,
    gender: "Woman",
    country: "Jordan",
    city: "Amman",
    locale: "ar",
    marital_status: "Single",
    occupation: "Designer",
    education: "Bachelors",
    interests: ["Art", "Music", "Coffee"],
    bio: "Local test profile. Draws in little notebooks and always saves room for dessert.",
    looking_for: "Someone considerate who values family, humor, and honest communication.",
    preferred_min_age: 25,
    preferred_max_age: 36,
    preferred_gender: "Man",
  },
  {
    email: "demo.alex@example.invalid",
    display_name: "Demo Alex",
    age: 34,
    gender: "Non-binary",
    country: "Canada",
    city: "Toronto",
    locale: "en",
    marital_status: "Single",
    occupation: "Researcher",
    education: "PhD",
    interests: ["Gardening", "Cinema", "Travel"],
    bio: "Local test profile. Interested in how cities work and what people grow on balconies.",
    looking_for: "A warm connection built on patience, curiosity, and shared laughter.",
    preferred_min_age: 28,
    preferred_max_age: 42,
  },
];

const { data: userPage, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

let created = 0;
for (const demo of demoProfiles) {
  let user = userPage.users.find((candidate) => candidate.email === demo.email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demo.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: demo.display_name, age: demo.age },
    });
    if (error) throw error;
    user = data.user;
    created += 1;
  }

  const profile = Object.fromEntries(Object.entries(demo).filter(([key]) => key !== "email"));
  const { error } = await supabase.from("profiles").update({
    ...profile,
    is_active: true,
    is_verified: true,
  }).eq("id", user.id);
  if (error) throw error;
  console.log(`Seeded local test profile: ${demo.display_name} (${demo.email})`);
}

console.log(`Complete. Created ${created} new local test accounts; no passwords were printed.`);