import { db, auth } from './firebase-config';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc 
} from 'firebase/firestore';

// References to DOM elements
const el = {
    authView: document.getElementById('auth-view'),
    dashboardView: document.getElementById('dashboard-view'),
    loginForm: document.getElementById('login-form'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    authError: document.getElementById('auth-error'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    pageTitle: document.getElementById('current-page-title'),
    
    // Global Status
    dbStatus: document.getElementById('db-status'),
    globalLoader: document.getElementById('global-loader'),
    mainContentArea: document.getElementById('main-content-area'),
    
    // Toast
    toastContainer: document.getElementById('toast-container')
};

// Global State
let currentData = null; // Holds the portfolio/data document

// --- Authentication UI Flow ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        showDashboard();
        loadPortfolioData();
    } else {
        showAuth();
    }
});

el.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = el.emailInput.value;
    const password = el.passwordInput.value;
    
    el.loginBtn.disabled = true;
    el.loginBtn.innerHTML = '<div class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Signing In...';
    el.authError.classList.add('hidden');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged handles UI transition
    } catch (error) {
        let msg = "Invalid email or password.";
        if(error.code === 'auth/user-not-found') msg = "User not found.";
        if(error.code === 'auth/wrong-password') msg = "Incorrect password.";
        if(error.code === 'auth/too-many-requests') msg = "Too many failed attempts. Try later.";
        
        el.authError.textContent = msg;
        el.authError.classList.remove('hidden');
    } finally {
        el.loginBtn.disabled = false;
        el.loginBtn.innerHTML = '<span>Sign In</span><i data-lucide="log-in" style="width: 18px; height: 18px;"></i>';
        lucide.createIcons();
    }
});

el.logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

function showAuth() {
    el.authView.classList.remove('hidden');
    el.dashboardView.classList.add('hidden');
}

function showDashboard() {
    el.authView.classList.add('hidden');
    el.dashboardView.classList.remove('hidden');
    lucide.createIcons();
}

// --- Navigation Flow ---
el.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class
        el.navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const targetView = item.getAttribute('data-view');
        
        // Hide all sections
        el.viewSections.forEach(section => section.classList.add('hidden'));
        
        // Show target section
        document.getElementById(`view-${targetView}`).classList.remove('hidden');
        
        // Update title
        el.pageTitle.textContent = item.textContent.trim();
    });
});

// --- Data Fetching and Updating ---
async function loadPortfolioData() {
    el.globalLoader.classList.remove('hidden');
    el.viewSections.forEach(v => v.classList.add('hidden')); // hide views while loading
    updateConnectionStatus(false);
    
    try {
        const docRef = doc(db, 'portfolio', 'data');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            currentData = docSnap.data();
            console.log('Document data loaded');
            updateConnectionStatus(true);
            
            // Populate all views
            populateProfileForm();
            renderProjectsGrid();
            renderSkillsGrid();
            renderExperienceGrid();
            
            // Show the first view (Profile)
            el.globalLoader.classList.add('hidden');
            document.getElementById('view-profile').classList.remove('hidden');
            
        } else {
            console.warn('No portfolio document found!');
            showToast('No portfolio data document found. Check Firebase settings.', 'error');
            updateConnectionStatus(false);
        }
    } catch (e) {
        console.error("Error fetching document: ", e);
        showToast(`Security rules or connection error. (${e.code})`, 'error');
        updateConnectionStatus(false);
    }
}

async function savePortfolioData(notifyMessage = 'Changes saved successfully!') {
    updateConnectionStatus(false, "Saving...");
    try {
        const docRef = doc(db, 'portfolio', 'data');
        // Merge the currentData object back to Firestore
        // Also update a timestamp so the frontend live listener catches it
        currentData.lastAccessed = new Date().toISOString(); 
        
        await setDoc(docRef, currentData, { merge: true });
        
        updateConnectionStatus(true);
        showToast(notifyMessage, 'success');
        return true;
    } catch (error) {
        console.error("Error saving document: ", error);
        showToast(`Failed to save: ${error.message}`, 'error');
        updateConnectionStatus(true);
        return false;
    }
}

// --- Profile View Logic ---
const profileForm = document.getElementById('profile-form');

function populateProfileForm() {
    if (!currentData || !currentData.profile) return;
    const p = currentData.profile;
    
    document.getElementById('profile-name').value = p.name || '';
    document.getElementById('profile-title').value = p.title || '';
    document.getElementById('profile-email').value = p.email || '';
    document.getElementById('profile-github').value = p.github || '';
    document.getElementById('profile-linkedin').value = p.linkedin || '';
    document.getElementById('profile-bio').value = p.bio || '';
}

document.getElementById('save-profile-btn').addEventListener('click', async () => {
    if(!profileForm.checkValidity()) {
        profileForm.reportValidity();
        return;
    }
    
    if(!currentData.profile) currentData.profile = {};
    
    currentData.profile.name = document.getElementById('profile-name').value;
    currentData.profile.title = document.getElementById('profile-title').value;
    currentData.profile.email = document.getElementById('profile-email').value;
    currentData.profile.github = document.getElementById('profile-github').value;
    currentData.profile.linkedin = document.getElementById('profile-linkedin').value;
    currentData.profile.bio = document.getElementById('profile-bio').value;
    
    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    await savePortfolioData('Profile updated successfully!');
    
    btn.textContent = 'Save Changes';
    btn.disabled = false;
});

// --- Projects View Logic ---
const projectsGrid = document.getElementById('projects-grid');

function renderProjectsGrid() {
    projectsGrid.innerHTML = '';
    if (!currentData || !currentData.projects) return;
    
    const projects = currentData.projects;
    
    if(projects.length === 0) {
        projectsGrid.innerHTML = `<p style="color: var(--text-muted);">No projects found. Add one to get started.</p>`;
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'glass-card item-card';
        card.innerHTML = `
            ${project.featured ? '<div class="featured-badge">Featured</div>' : ''}
            <div class="item-card-header">
                <div>
                    <h4 class="item-title">${escapeHTML(project.name)}</h4>
                    <span class="item-subtitle">${escapeHTML(project.technologies)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon edit-project" data-id="${project.id}" title="Edit"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon danger delete-project" data-id="${project.id}" title="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <div class="item-body">
                <p>${escapeHTML(project.description)}</p>
                <div class="item-meta">
                    ${project.github ? `<a href="${project.github}" target="_blank" class="tag"><i data-lucide="github" style="width: 12px; height: 12px;"></i> Code</a>` : ''}
                </div>
            </div>
        `;
        projectsGrid.appendChild(card);
    });
    
    lucide.createIcons();
    attachProjectListeners();
}

function attachProjectListeners() {
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openProjectModal(id);
        });
    });
    
    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if(confirm("Are you sure you want to delete this project?")) {
                currentData.projects = currentData.projects.filter(p => p.id != id);
                const success = await savePortfolioData('Project deleted!');
                if(success) renderProjectsGrid();
            }
        });
    });
}

// --- Modal Handling ---
const modals = {
    project: document.getElementById('project-modal'),
    skill: document.getElementById('skill-modal'),
    experience: document.getElementById('experience-modal')
};

// Generic Close function
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-close');
        closeModal(target);
    });
});

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// -- Project Modal Logic --
document.getElementById('add-project-btn').addEventListener('click', () => {
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('project-modal-title').textContent = 'Add Project';
    openModal('project-modal');
});

function openProjectModal(id) {
    const project = currentData.projects.find(p => p.id == id);
    if(!project) return;
    
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-name').value = project.name || '';
    document.getElementById('project-tech').value = project.technologies || '';
    document.getElementById('project-github').value = project.github || '';
    document.getElementById('project-demo').value = project.demo || '';
    document.getElementById('project-image').value = project.image || '';
    document.getElementById('project-desc').value = project.description || '';
    document.getElementById('project-featured').checked = project.featured || false;
    
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    openModal('project-modal');
}

document.getElementById('save-project-btn').addEventListener('click', async () => {
    const form = document.getElementById('project-form');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Disable btn
    const btn = document.getElementById('save-project-btn');
    btn.disabled = true;
    
    const idVal = document.getElementById('project-id').value;
    const isEditing = !!idVal;
    
    const newProject = {
        id: isEditing ? parseInt(idVal) : Date.now(),
        name: document.getElementById('project-name').value,
        technologies: document.getElementById('project-tech').value,
        github: document.getElementById('project-github').value,
        demo: document.getElementById('project-demo').value,
        image: document.getElementById('project-image').value,
        description: document.getElementById('project-desc').value,
        featured: document.getElementById('project-featured').checked
    };
    
    if(!currentData.projects) currentData.projects = [];
    
    if(isEditing) {
        const index = currentData.projects.findIndex(p => p.id == idVal);
        if(index > -1) currentData.projects[index] = newProject;
    } else {
        currentData.projects.push(newProject);
    }
    
    const success = await savePortfolioData(`Project ${isEditing ? 'updated' : 'added'}!`);
    if(success) {
        closeModal('project-modal');
        renderProjectsGrid();
    }
    btn.disabled = false;
});

// --- Skills View Logic ---
const skillsGrid = document.getElementById('skills-grid');

function renderSkillsGrid() {
    skillsGrid.innerHTML = '';
    if (!currentData || !currentData.skills) return;
    
    const skills = currentData.skills;
    
    if(skills.length === 0) {
        skillsGrid.innerHTML = `<p style="color: var(--text-muted);">No skills found. Add one to get started.</p>`;
        return;
    }
    
    skills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'glass-card item-card';
        card.style.borderLeft = `4px solid ${skill.color || 'var(--border-glass)'}`;
        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <h4 class="item-title" style="color: ${skill.color || 'white'}"><i class="${skill.icon}" style="margin-right:0.5rem"></i>${escapeHTML(skill.category)}</h4>
                </div>
                <div class="item-actions">
                    <button class="btn-icon edit-skill" data-id="${skill.id}" title="Edit"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon danger delete-skill" data-id="${skill.id}" title="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <div class="item-body">
                <p>${escapeHTML(skill.description)}</p>
                <div class="item-meta">
                    ${(skill.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
                </div>
            </div>
        `;
        skillsGrid.appendChild(card);
    });
    
    lucide.createIcons();
    attachSkillListeners();
}

function attachSkillListeners() {
    document.querySelectorAll('.edit-skill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openSkillModal(id);
        });
    });
    
    document.querySelectorAll('.delete-skill').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if(confirm("Are you sure you want to delete this skill category?")) {
                currentData.skills = currentData.skills.filter(s => s.id != id);
                const success = await savePortfolioData('Skill category deleted!');
                if(success) renderSkillsGrid();
            }
        });
    });
}

// -- Skill Modal Logic --
document.getElementById('add-skill-btn').addEventListener('click', () => {
    document.getElementById('skill-form').reset();
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-modal-title').textContent = 'Add Skill Category';
    openModal('skill-modal');
});

function openSkillModal(id) {
    const skill = currentData.skills.find(s => s.id == id);
    if(!skill) return;
    
    document.getElementById('skill-id').value = skill.id;
    document.getElementById('skill-category').value = skill.category || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-color').value = skill.color || '';
    document.getElementById('skill-tags').value = (skill.tags || []).join(', ');
    document.getElementById('skill-desc').value = skill.description || '';
    
    document.getElementById('skill-modal-title').textContent = 'Edit Skill Category';
    openModal('skill-modal');
}

document.getElementById('save-skill-btn').addEventListener('click', async () => {
    const form = document.getElementById('skill-form');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const btn = document.getElementById('save-skill-btn');
    btn.disabled = true;
    
    const idVal = document.getElementById('skill-id').value;
    const isEditing = !!idVal;
    
    const tagsRaw = document.getElementById('skill-tags').value;
    const tagsArray = tagsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const newSkill = {
        id: isEditing ? parseInt(idVal) : Date.now(),
        category: document.getElementById('skill-category').value,
        icon: document.getElementById('skill-icon').value,
        color: document.getElementById('skill-color').value,
        tags: tagsArray,
        description: document.getElementById('skill-desc').value
    };
    
    if(!currentData.skills) currentData.skills = [];
    
    if(isEditing) {
        const index = currentData.skills.findIndex(s => s.id == idVal);
        if(index > -1) currentData.skills[index] = newSkill;
    } else {
        currentData.skills.push(newSkill);
    }
    
    const success = await savePortfolioData(`Skill category ${isEditing ? 'updated' : 'added'}!`);
    if(success) {
        closeModal('skill-modal');
        renderSkillsGrid();
    }
    btn.disabled = false;
});

// --- Experience View Logic ---
const experienceGrid = document.getElementById('experience-grid');

function renderExperienceGrid() {
    experienceGrid.innerHTML = '';
    if (!currentData || !currentData.experience) return;
    
    const experiences = currentData.experience;
    
    if(experiences.length === 0) {
        experienceGrid.innerHTML = `<p style="color: var(--text-muted);">No experiences found. Add one to get started.</p>`;
        return;
    }
    
    experiences.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'glass-card item-card';
        card.style.borderLeft = `4px solid ${exp.color || 'var(--border-glass)'}`;
        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <h4 class="item-title">${escapeHTML(exp.position)}</h4>
                    <span class="item-subtitle">${escapeHTML(exp.company)} - ${escapeHTML(exp.period)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon edit-exp" data-id="${exp.id}" title="Edit"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon danger delete-exp" data-id="${exp.id}" title="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <div class="item-body">
                <p>${escapeHTML(exp.description)}</p>
            </div>
        `;
        experienceGrid.appendChild(card);
    });
    
    lucide.createIcons();
    attachExperienceListeners();
}

function attachExperienceListeners() {
    document.querySelectorAll('.edit-exp').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openExperienceModal(id);
        });
    });
    
    document.querySelectorAll('.delete-exp').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if(confirm("Are you sure you want to delete this experience entry?")) {
                currentData.experience = currentData.experience.filter(ex => ex.id != id);
                const success = await savePortfolioData('Experience deleted!');
                if(success) renderExperienceGrid();
            }
        });
    });
}

// -- Experience Modal Logic --
document.getElementById('add-exp-btn').addEventListener('click', () => {
    document.getElementById('exp-form').reset();
    document.getElementById('exp-id').value = '';
    document.getElementById('experience-modal-title').textContent = 'Add Experience';
    openModal('experience-modal');
});

function openExperienceModal(id) {
    const exp = currentData.experience.find(ex => ex.id == id);
    if(!exp) return;
    
    document.getElementById('exp-id').value = exp.id;
    document.getElementById('exp-company').value = exp.company || '';
    document.getElementById('exp-subtitle').value = exp.subtitle || '';
    document.getElementById('exp-position').value = exp.position || '';
    document.getElementById('exp-period').value = exp.period || '';
    document.getElementById('exp-icon').value = exp.icon || '';
    document.getElementById('exp-color').value = exp.color || '';
    document.getElementById('exp-desc').value = exp.description || '';
    
    document.getElementById('experience-modal-title').textContent = 'Edit Experience';
    openModal('experience-modal');
}

document.getElementById('save-exp-btn').addEventListener('click', async () => {
    const form = document.getElementById('exp-form');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const btn = document.getElementById('save-exp-btn');
    btn.disabled = true;
    
    const idVal = document.getElementById('exp-id').value;
    const isEditing = !!idVal;
    
    const newExp = {
        id: isEditing ? parseInt(idVal) : Date.now(),
        company: document.getElementById('exp-company').value,
        subtitle: document.getElementById('exp-subtitle').value,
        position: document.getElementById('exp-position').value,
        period: document.getElementById('exp-period').value,
        icon: document.getElementById('exp-icon').value,
        color: document.getElementById('exp-color').value,
        description: document.getElementById('exp-desc').value
    };
    
    if(!currentData.experience) currentData.experience = [];
    
    if(isEditing) {
        const index = currentData.experience.findIndex(ex => ex.id == idVal);
        if(index > -1) currentData.experience[index] = newExp;
    } else {
        currentData.experience.push(newExp);
    }
    
    const success = await savePortfolioData(`Experience ${isEditing ? 'updated' : 'added'}!`);
    if(success) {
        closeModal('experience-modal');
        renderExperienceGrid();
    }
    btn.disabled = false;
});

// --- Utility Functions ---
function updateConnectionStatus(isConnected, textOverride = null) {
    if (isConnected) {
        el.dbStatus.className = 'status-badge connected';
        el.dbStatus.querySelector('span').textContent = textOverride || 'Connected';
    } else {
        el.dbStatus.className = 'status-badge disconnected';
        el.dbStatus.querySelector('span').textContent = textOverride || 'Disconnected';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if(type === 'success') icon = 'check-circle';
    if(type === 'error') icon = 'alert-triangle';
    
    toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
    el.toastContainer.appendChild(toast);
    
    lucide.createIcons();
    
    // Trigger reflow and show
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHTML(str) {
    if(!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
