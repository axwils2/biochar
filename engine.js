/**
 * BiocharEngine (v2 - LocalStorage)
 * A simple JS module to load, save, and manage project data
 * in the browser's localStorage.
 */
(function(window) {

    // Internal cache to hold data in memory
    let _cachedData = null;
    const DATA_KEY = "biocharProjectData";

    /**
     * Loads project data.
     * 1. Tries to get from in-memory cache.
     * 2. If cache is empty, tries to get from localStorage.
     * 3. If localStorage is empty, returns a new, blank object.
     * @returns {object} The project data object.
     */
    function loadProjectData() {
        if (_cachedData) {
            // console.log("Loaded from cache");
            return _cachedData;
        }

        try {
            const storedData = localStorage.getItem(DATA_KEY);
            if (storedData) {
                // console.log("Loaded from localStorage");
                _cachedData = JSON.parse(storedData);
                return _cachedData;
            }
        } catch (e) {
            console.error("Error parsing project data from localStorage:", e);
        }

        // console.log("No data found, creating new object");
        _cachedData = {}; // Start fresh
        return _cachedData;
    }

    /**
     * Saves the provided data object to both localStorage and the in-memory cache.
     * @param {object} dataToSave - The complete project data object to save.
     */
    function saveProjectData(dataToSave) {
        if (!dataToSave) {
            console.error("Save failed: No data object provided.");
            return;
        }

        try {
            const dataString = JSON.stringify(dataToSave);
            localStorage.setItem(DATA_KEY, dataString);
            _cachedData = dataToSave; // Update cache
            // console.log("Project data saved.");
        } catch (e) {
            console.error("Error saving project data to localStorage:", e);
        }
    }

    /**
     * [NEW FUNCTION]
     * Clears all project data from both localStorage and the in-memory cache.
     */
    function clearProjectData() {
        try {
            localStorage.removeItem(DATA_KEY);
            localStorage.removeItem("currentProjectId"); // Also clear the current project ID
            _cachedData = {}; // Clear in-memory cache
            console.log("Project data cleared.");
        } catch (e) {
            console.error("Error clearing project data:", e);
        }
    }


    // ── Cloud sync (Supabase) ────────────────────────────────
    // These methods are no-ops when no Supabase session exists,
    // so calling them unconditionally from tool pages is safe.

    /**
     * Upserts the current in-memory project data to Supabase.
     * @param {string} projectKey - The project_key slug (from tool1.projectId).
     */
    async function saveToCloud(projectKey) {
        if (!projectKey) return;
        const auth = window.BiocharAuth;
        if (!auth) return;
        // Always await init() so we don't miss a valid session due to timing
        const session = auth.getSession() || await auth.init();
        if (!session) return;

        const client = auth.getClient();
        if (!client) return;

        const data = loadProjectData();
        const { error } = await client.from('projects').upsert(
            {
                user_id:     session.user.id,
                project_key: projectKey,
                data:        data,
                updated_at:  new Date().toISOString(),
            },
            { onConflict: 'user_id,project_key' }
        );
        if (error) console.error('BiocharEngine.saveToCloud error:', error.message);
    }

    /**
     * Fetches a project from Supabase and writes it into localStorage.
     * @param {string} projectKey - The project_key to load.
     */
    async function loadFromCloud(projectKey) {
        const auth = window.BiocharAuth;
        if (!auth) return;
        const client = auth.getClient();
        if (!client) return;

        const { data, error } = await client
            .from('projects')
            .select('data')
            .eq('project_key', projectKey)
            .single();

        if (error) {
            console.error('BiocharEngine.loadFromCloud error:', error.message);
            return;
        }
        if (data && data.data) {
            _cachedData = null; // clear cache before writing
            saveProjectData(data.data);
        }
    }

    /**
     * No-op stub kept for backwards compatibility; Supabase client is
     * initialised in auth.js. Call this to ensure auth.js has run first.
     */
    function initSupabase() {
        // auth.js initialises the client; nothing to do here.
    }

    // Expose the public API on the window object
    window.BiocharEngine = {
        loadProjectData:  loadProjectData,
        saveProjectData:  saveProjectData,
        clearProjectData: clearProjectData,
        saveToCloud:      saveToCloud,
        loadFromCloud:    loadFromCloud,
        initSupabase:     initSupabase,
    };

})(window);