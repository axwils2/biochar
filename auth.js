/**
 * BiocharAuth — Supabase auth helper
 *
 * SETUP: Replace the two constants below with your actual Supabase project values.
 * Find them in: Supabase Dashboard → Project Settings → API
 *
 * The anon key is safe to expose in browser code — Row Level Security
 * policies on the database enforce all data access rules.
 */

const SUPABASE_URL = "https://huxgtaudbdghuowamfxk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eGd0YXVkYmRnaHVvd2FtZnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjQwMjgsImV4cCI6MjA5NDEwMDAyOH0.6vVJjyJyHfaF8WGypraerRVpnsBahcOnm0UEAHChZ9I";

(function (window) {
  let _client = null;
  let _session = null;
  let _sessionResolved = false;

  function getClient() {
    if (!_client) {
      if (typeof window.supabase === "undefined") {
        console.warn("BiocharAuth: Supabase JS SDK not loaded.");
        return null;
      }
      _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _client;
  }

  // Initialise session from URL hash (magic link callback) or existing localStorage token.
  // Returns a Promise that resolves to the session or null.
  async function init() {
    const client = getClient();
    if (!client) return null;

    const { data } = await client.auth.getSession();
    _session = data.session;
    _sessionResolved = true;

    // Listen for auth state changes (sign-in / sign-out)
    client.auth.onAuthStateChange((_event, session) => {
      _session = session;
    });

    return _session;
  }

  // Returns the cached session (call after init() resolves).
  function getSession() {
    return _session;
  }

  // Returns the user object from the current session, or null.
  function getUser() {
    return _session ? _session.user : null;
  }

  // Signs out and redirects to login.html.
  async function signOut() {
    const client = getClient();
    if (client) await client.auth.signOut();
    window.location.href = "login.html";
  }

  // Call on pages that require authentication (projects.html, admin.html).
  // Redirects to login.html if no session is found.
  async function requireAuth() {
    const session = await init();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  }

  // Updates the header auth link on any page.
  // Looks for an element with id="authHeaderLink" and updates its text/href.
  async function updateHeaderLink() {
    const linkEl = document.getElementById("authHeaderLink");
    if (!linkEl) return;
    const session = await init();
    if (session) {
      linkEl.textContent = BiocharI18n
        ? BiocharI18n.t("common.my_projects")
        : "My Projects →";
      linkEl.href = "projects.html";
    } else {
      linkEl.textContent = BiocharI18n
        ? BiocharI18n.t("common.sign_in")
        : "Sign in →";
      linkEl.href = "login.html";
    }
    linkEl.classList.remove("hidden");
  }

  // Expose public API
  window.BiocharAuth = {
    getClient,
    init,
    getSession,
    getUser,
    signOut,
    requireAuth,
    updateHeaderLink,
  };
})(window);
