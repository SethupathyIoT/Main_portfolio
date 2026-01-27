// Enhanced Dynamic Portfolio Data Loader with Firebase Integration
class PortfolioDataLoader {
    constructor() {
        this.portfolioData = null;
        this.firestore = null;
        this.isFirebaseEnabled = true;
        this.loadingIndicator = null;
        this.init();
    }

    async init() {
        this.showLoadingIndicator();
        try {
            // Try Firebase first, then fallback to JSON
            await this.initializeFirebase();
            await this.loadPortfolioData();
            this.updatePortfolioContent();
            this.setupRealtimeUpdates();
        } catch (error) {
            console.warn('Could not load dynamic data, using static content:', error);
            // Fallback to static content if both Firebase and JSON loading fail
        } finally {
            this.hideLoadingIndicator();
        }
    }

    async initializeFirebase() {
        try {
            // Firebase configuration (same as admin panel)
            const firebaseConfig = {
                apiKey: "AIzaSyDkiH7_yAyoCu-r8xSLFMb7S1i1f6itVqk",
                authDomain: "portfolio-315f0.firebaseapp.com",
                projectId: "portfolio-315f0",
                storageBucket: "portfolio-315f0.firebasestorage.app",
                messagingSenderId: "334064031361",
                appId: "1:334064031361:web:77d157f77a1c1962695f80"
            };

            // Check if Firebase is available
            if (typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.firestore = firebase.firestore();
                console.log('✅ Firebase initialized for portfolio');
            } else {
                console.log('Firebase SDK not available, using JSON fallback');
                this.isFirebaseEnabled = false;
            }
        } catch (error) {
            console.warn('Firebase initialization failed:', error);
            this.isFirebaseEnabled = false;
        }
    }

    async loadPortfolioData() {
        try {
            console.log('Attempting to load portfolio data...');
            
            // Try Firebase first
            if (this.isFirebaseEnabled && this.firestore) {
                try {
                    const doc = await this.firestore.collection('portfolio').doc('data').get();
                    if (doc.exists) {
                        this.portfolioData = doc.data();
                        console.log('✅ Portfolio data loaded from Firebase:', {
                            projects: this.portfolioData.projects?.length || 0,
                            skills: this.portfolioData.skills?.length || 0,
                            experience: this.portfolioData.experience?.length || 0,
                            profile: this.portfolioData.profile ? 'Available' : 'Missing'
                        });
                        return;
                    }
                } catch (firebaseError) {
                    console.warn('Firebase load failed, trying JSON fallback:', firebaseError);
                }
            }

            // Fallback to JSON
            const response = await fetch('./data/portfolio-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.portfolioData = await response.json();
            console.log('📄 Portfolio data loaded from JSON:', {
                projects: this.portfolioData.projects?.length || 0,
                skills: this.portfolioData.skills?.length || 0,
                experience: this.portfolioData.experience?.length || 0,
                profile: this.portfolioData.profile ? 'Available' : 'Missing'
            });
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            throw error;
        }
    }

    setupRealtimeUpdates() {
        if (!this.isFirebaseEnabled || !this.firestore) return;

        // Listen for real-time updates from Firebase
        this.firestore.collection('portfolio').doc('data').onSnapshot((doc) => {
            if (doc.exists) {
                const newData = doc.data();
                if (JSON.stringify(newData) !== JSON.stringify(this.portfolioData)) {
                    console.log('🔄 Real-time update received from Firebase');
                    this.portfolioData = newData;
                    this.updatePortfolioContent();
                    this.showUpdateNotification();
                }
            }
        }, (error) => {
            console.warn('Real-time updates disabled:', error);
        });
    }

    showLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'portfolio-loading';
        this.loadingIndicator.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading portfolio data...</p>
            </div>
        `;
        document.body.appendChild(this.loadingIndicator);
    }

    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
            this.loadingIndicator = null;
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-sync-alt"></i>
                <span>Portfolio updated in real-time!</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updatePortfolioContent() {
        if (!this.portfolioData) return;

        // Update different sections based on current page
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.updateHomePage();
                break;
            case 'projects':
                this.updateProjectsPage();
                break;
            case 'single-product':
                this.updateSingleProjectPage();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('projects.html')) return 'projects';
        if (path.includes('single-product.html')) return 'single-product';
        return 'index';
    }

    updateHomePage() {
        // Update profile information
        this.updateProfile();
        
        // Update skills section
        this.updateSkills();
        
        // Update experience section
        this.updateExperience();
        
        // Update featured projects in home page
        this.updateFeaturedProjects();
    }

    updateProfile() {
        const profile = this.portfolioData.profile;
        if (!profile) {
            console.log('No profile data found, using static content');
            return;
        }

        // Update name
        const nameElements = document.querySelectorAll('.profile-name, h1.vlt-large-heading');
        nameElements.forEach(el => {
            if (el.innerHTML.includes('Sethupathy')) {
                el.innerHTML = el.innerHTML.replace('Sethupathy', profile.name);
            }
        });

        // Update title
        const titleElements = document.querySelectorAll('.vlt-display-1');
        titleElements.forEach(el => {
            if (el.textContent.includes('IoT Developer')) {
                el.textContent = profile.title;
            }
        });

        // Update bio
        const bioElements = document.querySelectorAll('p');
        bioElements.forEach(el => {
            if (el.textContent.includes('IoT Developer and Embedded Systems Engineer')) {
                el.textContent = profile.bio;
            }
        });

        // Update email links
        if (profile.email) {
            const emailLinks = document.querySelectorAll('a[href*="mailto"]');
            emailLinks.forEach(link => {
                link.href = `mailto:${profile.email}`;
            });
        }

        // Update social links
        if (profile.linkedin) {
            const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');
            linkedinLinks.forEach(link => {
                link.href = profile.linkedin;
            });
        }

        if (profile.github) {
            const githubLinks = document.querySelectorAll('a[href*="github"]');
            githubLinks.forEach(link => {
                link.href = profile.github;
            });
        }
    }

    updateSkills() {
        const skills = this.portfolioData.skills;
        if (!skills || skills.length === 0) {
            console.log('No skills data found, using static content');
            return;
        }

        // Find all skill boxes in the Skills section
        const skillsSection = document.querySelector('[data-anchor="Skills"]');
        if (!skillsSection) {
            console.log('Skills section not found');
            return;
        }

        const skillBoxes = skillsSection.querySelectorAll('.vlt-skill-box');
        
        skills.forEach((skill, index) => {
            if (index < skillBoxes.length) {
                this.updateSkillBox(skillBoxes[index], skill);
            }
        });
    }

    updateSkillBox(box, skill) {
        // Update icon
        const icon = box.querySelector('i');
        if (icon) {
            icon.className = `${skill.icon} has-accent-color`;
        }

        // Update title
        const title = box.querySelector('h5');
        if (title) {
            title.textContent = skill.category;
        }

        // Update description
        const description = box.querySelector('.skill-description');
        if (description) {
            description.textContent = skill.description;
        }

        // Update tags
        const tagsContainer = box.querySelector('.vlt-skill-tags');
        if (tagsContainer && skill.tags) {
            tagsContainer.innerHTML = skill.tags.map(tag => 
                `<span class="vlt-skill-tag">${tag}</span>`
            ).join('');
        }

        // Update category class and color
        const categoryClass = this.getCategoryClass(skill.category);
        box.className = `vlt-skill-box ${categoryClass}`;
    }

    getCategoryClass(category) {
        const categoryMap = {
            'Embedded Development': 'core-cat',
            'Microcontrollers & SoCs': 'mcu-cat',
            'Communication Protocols': 'comm-cat',
            'IoT Protocols & Standards': 'iot-cat',
            'Wireless Technologies': 'wireless-cat',
            'Sensors & Actuators': 'sensor-cat',
            'Programming Languages': 'prog-cat',
            'Development Tools': 'tools-cat',
            'IoT Platforms & Services': 'platform-cat'
        };
        return categoryMap[category] || 'core-cat';
    }

    updateExperience() {
        const experiences = this.portfolioData.experience;
        if (!experiences || experiences.length === 0) return;

        // Find experience section
        const experienceSection = document.querySelector('[data-anchor="Experience"]');
        if (!experienceSection) return;

        // Update experience items - they are all in one slide
        const timelineItems = experienceSection.querySelectorAll('.vlt-timeline-item');
        
        experiences.forEach((exp, index) => {
            if (index < timelineItems.length) {
                this.updateExperienceItem(timelineItems[index], exp);
            }
        });
    }

    updateExperienceItem(item, experience) {
        // Update icon
        const iconContainer = item.querySelector('.vlt-experience-icon');
        if (iconContainer) {
            const icon = iconContainer.querySelector('i');
            const companyName = iconContainer.querySelector('.company-name');
            const companySubtitle = iconContainer.querySelector('.company-subtitle');
            
            if (icon) icon.className = experience.icon;
            if (companyName) companyName.textContent = experience.company;
            if (companySubtitle) companySubtitle.textContent = experience.subtitle;
        }

        // Update date
        const dateElement = item.querySelector('.vlt-timeline-item__date');
        if (dateElement) {
            dateElement.textContent = experience.period;
        }

        // Update title
        const titleElement = item.querySelector('.vlt-timeline-item__title');
        if (titleElement) {
            titleElement.textContent = experience.position;
        }

        // Update description
        const descElement = item.querySelector('.vlt-timeline-item__text');
        if (descElement) {
            descElement.textContent = experience.description;
        }
    }

    updateFeaturedProjects() {
        const projects = this.portfolioData.projects;
        if (!projects || projects.length === 0) return;

        // Find projects section
        const projectsSection = document.querySelector('[data-anchor="Projects"]');
        if (!projectsSection) return;

        // Find project slides
        const projectSlides = projectsSection.querySelectorAll('.swiper-slide');
        
        // Get featured projects or all projects if none are marked as featured
        const featuredProjects = projects.filter(p => p.featured) || projects.slice(0, 2);
        
        featuredProjects.forEach((project, index) => {
            if (index < projectSlides.length) {
                this.updateProjectSlide(projectSlides[index], project);
            }
        });
    }

    updateProjectSlide(slide, project) {
        // Update project title
        const title = slide.querySelector('.vlt-project-title');
        if (title) {
            title.innerHTML = `${project.name}<span class="has-accent-color">.</span>`;
        }

        // Update project description
        const description = slide.querySelector('.vlt-project-excerpt p');
        if (description) {
            description.textContent = project.description;
        }

        // Update project link
        const link = slide.querySelector('.vlt-btn');
        if (link && project.github) {
            link.href = project.github;
        }
    }

    updateProjectsPage() {
        const projects = this.portfolioData.projects;
        if (!projects || projects.length === 0) return;

        // Find projects grid container
        const projectsGrid = document.querySelector('.vlt-projects-grid');
        if (!projectsGrid) return;

        // Clear existing project cards (keep only the first one as template)
        const existingCards = projectsGrid.querySelectorAll('.cb-project-card');
        const templateCard = existingCards[0];
        if (!templateCard) return;

        // Clear all cards
        projectsGrid.innerHTML = '';

        // Generate project cards from JSON data
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });

        console.log('Updated projects page with', projects.length, 'projects');
    }

    createProjectCard(project, index) {
        const categories = this.getProjectCategories(project.technologies);
        const categoryClass = categories.join(' ');
        
        const cardHTML = `
            <div class="col-lg-4 col-md-6 mb-4 cb-project-card ${categoryClass}">
                <div class="vlt-skill-box">
                    <i class="lnir-code-alt has-accent-color"></i>
                    <h5 class="has-accent-color">${project.name}</h5>
                    <p>${project.description}</p>
                    <div class="vlt-skill-tags">
                        ${project.technologies.split(', ').map(tech => 
                            `<span class="vlt-skill-tag">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="vlt-gap-20"></div>
                    <a href="single-product.html?id=${project.id}" class="vlt-btn vlt-btn--secondary vlt-btn--sm">View Case Study</a>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        return tempDiv.firstElementChild;
    }

    getProjectCategories(technologies) {
        const categories = [];
        const techLower = technologies.toLowerCase();
        
        if (techLower.includes('esp32') || techLower.includes('iot') || techLower.includes('mqtt')) {
            categories.push('cat-iot');
        }
        if (techLower.includes('embedded') || techLower.includes('microcontroller')) {
            categories.push('cat-embedded');
        }
        if (techLower.includes('robot') || techLower.includes('servo') || techLower.includes('motor')) {
            categories.push('cat-robotics');
        }
        if (techLower.includes('automation') || techLower.includes('relay') || techLower.includes('home')) {
            categories.push('cat-automation');
        }
        
        return categories.length > 0 ? categories : ['cat-iot'];
    }

    updateSingleProjectPage() {
        // Get project ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) return;

        const project = this.portfolioData.projects.find(p => p.id == projectId);
        if (!project) return;

        // Update page title
        document.title = `${project.name} - Sethupathy Portfolio`;

        // Update project title
        const titleElement = document.querySelector('.vlt-page-title h1');
        if (titleElement) {
            titleElement.innerHTML = `${project.name}<span class="has-accent-color">.</span>`;
        }

        // Update project description
        const descElements = document.querySelectorAll('.vlt-project-description p');
        if (descElements.length > 0) {
            descElements[0].textContent = project.description;
        }

        // Update technologies
        const techContainer = document.querySelector('.vlt-project-technologies');
        if (techContainer) {
            const technologies = project.technologies.split(', ');
            techContainer.innerHTML = technologies.map(tech => 
                `<span class="vlt-skill-tag">${tech}</span>`
            ).join('');
        }

        // Update GitHub link
        const githubLink = document.querySelector('a[href*="github"]');
        if (githubLink && project.github) {
            githubLink.href = project.github;
        }

        // Update demo link if available
        const demoLink = document.querySelector('.vlt-demo-link');
        if (demoLink && project.demo) {
            demoLink.href = project.demo;
            demoLink.style.display = 'inline-block';
        } else if (demoLink) {
            demoLink.style.display = 'none';
        }

        // Update project image
        const projectImage = document.querySelector('.vlt-project-image img');
        if (projectImage && project.image) {
            projectImage.src = project.image;
            projectImage.alt = project.name;
        }

        console.log('Updated single project page for:', project.name);
    }

    // Utility method to safely update text content
    updateTextContent(selector, newText) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = newText;
        }
    }

    // Utility method to safely update HTML content
    updateHTMLContent(selector, newHTML) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = newHTML;
        }
    }
}

// Initialize the portfolio data loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioDataLoader();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PortfolioDataLoader();
    });
} else {
    new PortfolioDataLoader();
}