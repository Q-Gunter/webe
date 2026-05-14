/**
 * Q-Gunter Frontend Logic
 * Neural Pentesting Interface - SPA Version (with Demo Fallback)
 */

const API_BASE_URL = "http://127.0.0.1:8000/frontend";
const SECURITY_TOKEN = "116bd1150f1b57dba0e6b7c04567b40b78cca6f6";  

// --- DOM ELEMENTS ---
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const contactSection = document.getElementById('contact-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userNav = document.getElementById('user-nav');
const mainNav = document.getElementById('main-nav');
const userEmailDisplay = document.getElementById('user-email-display');
const apiKeyDisplay = document.getElementById('api-key-display');
const toggleKeyBtn = document.getElementById('toggle-key-btn');
const navLogo = document.getElementById('nav-logo');
const publicNav = document.getElementById('public-nav');
const btnNavLogin = document.getElementById('btn-nav-login');
const btnNavContact = document.getElementById('btn-nav-contact');

// --- STATE MANAGEMENT ---
let currentUser = {
    email: localStorage.getItem('qgunter_email'),
    apiKey: localStorage.getItem('qgunter_api_key')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser.apiKey) {
        showDashboard();
    } else {
        showAuth();
    }
});

// --- SPA ROUTING LOGIC ---

function hideAllSections() {
    authSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    contactSection.classList.add('hidden');
}

function updateNavActive(activeId) {
    const navButtons = {
        'nav-terminal': document.getElementById('nav-terminal'),
        'nav-contact': document.getElementById('nav-contact')
    };
    
    Object.keys(navButtons).forEach(id => {
        if (id === activeId) {
            navButtons[id].classList.add('text-q-gold', 'opacity-100');
            navButtons[id].classList.remove('opacity-50');
        } else {
            navButtons[id].classList.remove('text-q-gold', 'opacity-100');
            navButtons[id].classList.add('opacity-50');
        }
    });
}

// function showDashboard() {
//     hideAllSections();
//     dashboardSection.classList.remove('hidden');
//     userNav.classList.remove('hidden');
//     mainNav.classList.remove('hidden');
    
//     userEmailDisplay.textContent = currentUser.email || "demo_agent@qgunter.io";
//     apiKeyDisplay.value = currentUser.apiKey || "qgunter_demo_key_1234567890";
//     updateNavActive('nav-terminal');
// }

async function showDashboard() {
    hideAllSections();
    dashboardSection.classList.remove('hidden');
    userNav.classList.remove('hidden');
    mainNav.classList.remove('hidden');
    updateNavActive('nav-terminal');
    if (publicNav) publicNav.classList.add('hidden');

    // Ponemos valores temporales de carga
    userEmailDisplay.textContent = currentUser.email || "loading...";
    apiKeyDisplay.value = "Retrieving_Key...";

    // Si no hay sesión guardada en localStorage, volvemos al login
    if (!currentUser.email || !currentUser.apiKey) {
        showAuth();
        return;
    }

    try {
        // Hacemos el GET a la API para obtener la API Key real de la DB
        const response = await fetch(`${API_BASE_URL}/auth/perfil?email=${encodeURIComponent(currentUser.email)}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'token': SECURITY_TOKEN // Enviamos el token de seguridad
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Actualizamos el DOM con la información real de la DB
            userEmailDisplay.textContent = data.email;
            apiKeyDisplay.value = data.api_key;
            
            // Actualizamos la sesión local por si acaso ha cambiado la API Key
            saveSession(data.email, data.api_key);
        } else {
            console.error("No se pudo obtener el perfil del agente.");
            apiKeyDisplay.value = "ERROR_RETRIEVING_KEY";
        }
    } catch (error) {
        console.error("Error al conectar con la API para traer la API Key:", error);
        apiKeyDisplay.value = "CONNECTION_ERROR";
    }
}

function showContact() {
    hideAllSections();
    contactSection.classList.remove('hidden');
    updateNavActive('nav-contact');
}

function showAuth() {
    hideAllSections();
    userNav.classList.add('hidden');
    mainNav.classList.add('hidden');
    authSection.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');

    hideAllSections();
    // Mostramos la ventana de Login
    authSection.classList.remove('hidden');
    // Nos aseguramos de que el menú público esté visible
    if (publicNav) publicNav.classList.remove('hidden');
    
    // Ocultamos la barra de usuario logueado
    if (userNav) userNav.classList.add('hidden');
    if (mainNav) mainNav.classList.add('hidden');
}

// --- NAVIGATION EVENTS ---

document.getElementById('nav-terminal').addEventListener('click', (e) => {
    e.preventDefault();
    showDashboard();
});

document.getElementById('nav-contact').addEventListener('click', (e) => {
    e.preventDefault();
    showContact();
});

navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser.apiKey) {
        showDashboard();
    } else {
        showAuth();
    }
});


// --- NAVEGACIÓN PÚBLICA (LOGIN VS CONTACTO) ---

if (btnNavLogin && btnNavContact) { // Verificamos que existen para evitar errores
    btnNavLogin.addEventListener('click', () => {
        // Estilos: Encendemos Login, Apagamos Contacto
        btnNavLogin.classList.add('text-q-gold', 'border-b-2', 'border-q-gold');
        btnNavLogin.classList.remove('opacity-50');
        
        btnNavContact.classList.remove('text-q-gold', 'border-b-2', 'border-q-gold');
        btnNavContact.classList.add('opacity-50');

        // Visibilidad de ventanas
        authSection.classList.remove('hidden');
        contactSection.classList.add('hidden');
    });

    btnNavContact.addEventListener('click', () => {
        // Estilos: Encendemos Contacto, Apagamos Login
        btnNavContact.classList.add('text-q-gold', 'border-b-2', 'border-q-gold');
        btnNavContact.classList.remove('opacity-50');
        
        btnNavLogin.classList.remove('text-q-gold', 'border-b-2', 'border-q-gold');
        btnNavLogin.classList.add('opacity-50');

        // Visibilidad de ventanas
        contactSection.classList.remove('hidden');
        authSection.classList.add('hidden');
    });
}



// --- AUTHENTICATION LOGIC ---

// Toggle Forms
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Register
// Evento de Registro Actualizado
document.getElementById('register-btn').addEventListener('click', async () => {
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const company = document.getElementById('reg-company').value || "Q-Gunter Agency";
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const reason = document.getElementById('reg-reason').value; // <-- Capturamos el nuevo campo

    // Validación básica de campos vacíos
    if (!firstName || !lastName || !email || !password || !reason) {
        return alert("Todos los campos obligatorios deben estar completos.");
    }

    // Construimos el Payload exacto para el Backend
    const registerPayload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        client: 0, // Se envía explícitamente como 0
        company: company,
        reason: reason
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerPayload)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`¡Registro exitoso! Bienvenido Agente ${firstName}`);
            // Guardamos la sesión con el email y el API Key devuelto por el backend
            saveSession(email, data.api_key);
            showDashboard();
        } else {
            alert(`Error en el registro: ${data.detail}`);
        }
    } catch (error) {
        console.error("Error al conectar con el C2 Backend:", error);
        alert("No se pudo conectar con el servidor central.");
    }
});

// Login

document.getElementById('login-btn').addEventListener('click', async () => {

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Missing credentials");

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, { // Ruta corregida
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'token': SECURITY_TOKEN // <--- LA CABECERA MÁGICA DE SEGURIDAD
            },
            body: JSON.stringify({ 
                identificador: email, // <--- Cambiado de 'email' a 'identificador'
                contrasena: password  // <--- Cambiado de 'password' a 'contrasena'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Guardamos la sesión con el token/API Key que nos devuelve la API
            saveSession(email, data.token_pqc); 
            showDashboard();
        } else {
            // Ahora el mensaje será el genérico "Credenciales inválidas" que pusimos en Python
            alert(`Acceso Denegado: ${data.detail}`);
        }
    } catch (error) {
        console.error("Error conectando con la API de Q-Gunter:", error);
        alert("No se pudo establecer conexión con el servidor central.");
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('qgunter_email');
    localStorage.removeItem('qgunter_api_key');
    currentUser = { email: null, apiKey: null };
    showAuth();
});

// --- UX IMPROVEMENTS ---

function saveSession(email, apiKey) {
    localStorage.setItem('qgunter_email', email);
    localStorage.setItem('qgunter_api_key', apiKey);
    currentUser = { email, apiKey };
}

// Toggle API Key Visibility
toggleKeyBtn.addEventListener('click', () => {
    if (apiKeyDisplay.type === 'password') {
        apiKeyDisplay.type = 'text';
        toggleKeyBtn.textContent = 'HIDE';
    } else {
        apiKeyDisplay.type = 'password';
        toggleKeyBtn.textContent = 'SHOW';
    }
});

// Copy API Key
document.getElementById('copy-key-btn').addEventListener('click', () => {
    const key = apiKeyDisplay.value;
    navigator.clipboard.writeText(key).then(() => {
        const originalText = document.getElementById('copy-key-btn').textContent;
        document.getElementById('copy-key-btn').textContent = "COPIED_SUCCESSFULLY";
        setTimeout(() => {
            document.getElementById('copy-key-btn').textContent = originalText;
        }, 2000);
    });
});





// --- ENVÍO DEL FORMULARIO DE CONTACTO ---

const contactBtn = document.getElementById('contact-btn');

if (contactBtn) {
    contactBtn.addEventListener('click', async () => {
        // 1. Recoger los valores del HTML
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        // 2. Validación para que no envíen campos vacíos
        if (!name || !email || !message) {
            return alert("ERROR: Todos los campos son obligatorios para establecer la comunicación.");
        }

        // 3. Efecto visual de carga en el botón
        const originalText = contactBtn.textContent;
        contactBtn.textContent = "TRANSMITTING...";
        contactBtn.disabled = true;

        try {
            // 4. Llamada al endpoint (Asegúrate de que API_BASE_URL incluye '/frontend')
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    agent_name: name,
                    return_email: email,
                    encrypted_message: message
                })
            });

            if (response.ok) {
                // 5. Efecto de éxito (Color verde y texto de confirmación)
                contactBtn.textContent = "MESSAGE_TRANSMITTED";
                contactBtn.classList.replace('text-q-gold', 'text-green-500');
                contactBtn.classList.replace('border-q-gold', 'border-green-500');

                // 6. Limpiar los campos para que queden vacíos
                document.getElementById('contact-name').value = '';
                document.getElementById('contact-email').value = '';
                document.getElementById('contact-message').value = '';

                // 7. Volver al botón normal a los 3 segundos
                setTimeout(() => {
                    contactBtn.textContent = originalText;
                    contactBtn.classList.replace('text-green-500', 'text-q-gold');
                    contactBtn.classList.replace('border-green-500', 'border-q-gold');
                    contactBtn.disabled = false;
                }, 3000);
                
            } else {
                const data = await response.json();
                alert(`Error en la transmisión: ${data.detail || 'Fallo desconocido'}`);
                contactBtn.textContent = originalText;
                contactBtn.disabled = false;
            }
            
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            alert("Fallo crítico: No se ha podido contactar con el C2.");
            contactBtn.textContent = originalText;
            contactBtn.disabled = false;
        }
    });
}
