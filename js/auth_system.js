class AuthSystem {
    static USERS_KEY = 'demonSlayerUsers';
    static SESSION_KEY = 'demonSlayerSession';

    /**
     * Register a new user
     * @param {string} username 
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success: boolean, message: string }
     */
    static register(username, email, password) {
        if (!username || !email || !password) {
            return { success: false, message: 'Preencha todos os campos.' };
        }

        const users = this.getUsers();

        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Usuário já existe.' };
        }

        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email já cadastrado.' };
        }

        const newUser = {
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true, message: 'Conta criada com sucesso!' };
    }

    /**
     * Login a user
     * @param {string} identifier Username or Email
     * @param {string} password 
     * @returns {object} { success: boolean, message: string, user: object }
     */
    static login(identifier, password) {
        if (!identifier || !password) {
            return { success: false, message: 'Preencha todos os campos.' };
        }

        // Demo Backdoor
        if (identifier === 'demo' && password === 'demo') {
            const demoUser = { username: 'demo', name: 'Demo User', role: 'player' };
            this.setSession(demoUser);
            return { success: true, message: 'Login realizado com sucesso!', user: demoUser };
        }

        const users = this.getUsers();
        const user = users.find(u => (u.username === identifier || u.email === identifier) && u.password === password);

        if (user) {
            // Don't save password in session
            const { password, ...sessionUser } = user;
            this.setSession(sessionUser);
            return { success: true, message: 'Login realizado com sucesso!', user: sessionUser };
        }

        return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    /**
     * Create a guest session
     */
    static loginAsGuest() {
        const guestUser = {
            username: 'guest',
            name: 'Convidado',
            role: 'guest'
        };
        this.setSession(guestUser);
        return guestUser;
    }

    /**
     * Logout the current user
     */
    static logout() {
        localStorage.removeItem(this.SESSION_KEY);
        // Optional: clear active character?
        // localStorage.removeItem('demonSlayerChar'); 
    }

    /**
     * Get current session
     * @returns {object|null}
     */
    static getSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            console.error('Error parsing session', e);
            return null;
        }
    }

    /**
     * Set session
     * @param {object} userData 
     */
    static setSession(userData) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(userData));
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    static isAuthenticated() {
        return !!this.getSession();
    }

    /**
     * Enforce authentication (redirect if not logged in)
     * @param {string} redirectUrl URL to redirect to if not logged in
     */
    static requireAuth(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
        }
    }

    /**
     * Helper to get all users
     * @returns {Array}
     */
    static getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }
}

// Global export
window.AuthSystem = AuthSystem;
