// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZ-WsH_1vdf0GcL5d57SZWBjOdWXZ1brg",
    authDomain: "resumecraft-b08a2.firebaseapp.com",
    projectId: "resumecraft-b08a2",
    storageBucket: "resumecraft-b08a2.appspot.com",
    messagingSenderId: "36659463133",
    appId: "1:36659463133:web:9bda78c59423d7fd95ec34",
    measurementId: "G-MX7R8V0GLT"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Auth State Listener
auth.onAuthStateChanged(user => {
    updateAuthUI(user);
    
    if (user) {
        checkUserProfile(user);
        
        // Load user data if on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            loadDashboardData(user);
        }
        
        // Load resume if on builder page with resumeId
        if (window.location.pathname.includes('builder.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const resumeId = urlParams.get('resumeId');
            
            if (resumeId) {
                loadResumeData(user.uid, resumeId);
            }
        }
    } else {
        // Redirect to login if on protected pages
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('builder.html')) {
            window.location.href = 'auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }
});

function updateAuthUI(user) {
    // Update elements with data-auth attribute
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(el => {
        if (user) {
            if (el.dataset.auth === 'logged-in') {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        } else {
            if (el.dataset.auth === 'logged-out') {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    });
    
    // Update user info if elements exist
    if (user) {
        if (document.getElementById('user-name')) {
            document.getElementById('user-name').textContent = user.displayName || user.email;
        }
        if (document.getElementById('user-email')) {
            document.getElementById('user-email').textContent = user.email;
        }
        if (document.getElementById('user-greeting')) {
            document.getElementById('user-greeting').textContent = user.displayName || user.email.split('@')[0];
        }
        if (document.getElementById('username')) {
            document.getElementById('username').textContent = user.displayName || user.email.split('@')[0];
        }
    }
}

function checkUserProfile(user) {
    db.collection('users').doc(user.uid).get().then(doc => {
        if (!doc.exists) {
            // Create new user profile
            db.collection('users').doc(user.uid).set({
                name: user.displayName || '',
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                resumeCount: 0,
                plan: 'free'
            });
        } else {
            // Update last login time
            db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    });
}

function loadDashboardData(user) {
    // Load user stats
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            
            if (document.getElementById('resume-count')) {
                document.getElementById('resume-count').textContent = userData.resumeCount || 0;
                document.getElementById('resume-count-main').textContent = userData.resumeCount || 0;
            }
            if (document.getElementById('download-count')) {
                document.getElementById('download-count').textContent = userData.downloadCount || 0;
                document.getElementById('download-count-main').textContent = userData.downloadCount || 0;
            }
            if (document.getElementById('applications-count')) {
                document.getElementById('applications-count').textContent = userData.applicationsCount || 0;
            }
            if (document.getElementById('favorites-count')) {
                document.getElementById('favorites-count').textContent = userData.favoritesCount || 0;
            }
        }
    });
    
    // Load recent resumes
    db.collection('resumes')
        .where('userId', '==', user.uid)
        .orderBy('lastUpdated', 'desc')
        .limit(5)
        .get()
        .then(querySnapshot => {
            const resumesTable = document.getElementById('resumes-table');
            if (!resumesTable) return;
            
            resumesTable.innerHTML = '';
            
            if (querySnapshot.empty) {
                resumesTable.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-table">No resumes found. <a href="builder.html">Create your first resume</a></td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach(doc => {
                const resume = doc.data();
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${resume.name || 'Untitled Resume'}</td>
                    <td>${resume.template || 'Classic'}</td>
                    <td>${formatDate(resume.lastUpdated?.toDate())}</td>
                    <td class="actions">
                        <a href="builder.html?resumeId=${doc.id}" class="btn btn-icon">
                            <i class="mdi mdi-pencil"></i>
                        </a>
                        <a href="#!" class="btn btn-icon download-resume" data-id="${doc.id}">
                            <i class="mdi mdi-download"></i>
                        </a>
                        <a href="#!" class="btn btn-icon delete-resume" data-id="${doc.id}">
                            <i class="mdi mdi-delete"></i>
                        </a>
                    </td>
                `;
                
                resumesTable.appendChild(row);
            });
            
            // Add event listeners for actions
            document.querySelectorAll('.download-resume').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const resumeId = this.dataset.id;
                    downloadResume(resumeId);
                });
            });
            
            document.querySelectorAll('.delete-resume').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const resumeId = this.dataset.id;
                    deleteResume(resumeId);
                });
            });
        });
}

function formatDate(date) {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function loadResumeData(userId, resumeId) {
    db.collection('resumes').doc(resumeId).get().then(doc => {
        if (doc.exists && doc.data().userId === userId) {
            const resumeData = doc.data();
            populateForm(resumeData);
        }
    });
}

function populateForm(resumeData) {
    // Personal Info
    if (resumeData.personal) {
        document.getElementById('full_name').value = resumeData.personal.name || '';
        document.getElementById('job_title').value = resumeData.personal.title || '';
        document.getElementById('email').value = resumeData.personal.email || '';
        document.getElementById('phone').value = resumeData.personal.phone || '';
        document.getElementById('address').value = resumeData.personal.address || '';
        document.getElementById('linkedin').value = resumeData.personal.linkedin || '';
        document.getElementById('summary').value = resumeData.personal.summary || '';
    }
    
    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
        const expContainer = document.getElementById('experience-fields');
        expContainer.innerHTML = '';
        
        resumeData.experience.forEach((exp, index) => {
            const expItem = document.querySelector('.experience-item').cloneNode(true);
            
            if (index === 0) {
                expItem.querySelector('.remove-experience').style.display = 'none';
            }
            
            expItem.querySelector('.job-title').value = exp.jobTitle || '';
            expItem.querySelector('.company').value = exp.company || '';
            expItem.querySelector('.start-date').value = exp.startDate || '';
            expItem.querySelector('.end-date').value = exp.endDate || '';
            expItem.querySelector('.description').value = exp.description || '';
            
            expContainer.appendChild(expItem);
        });
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
        const eduContainer = document.getElementById('education-fields');
        eduContainer.innerHTML = '';
        
        resumeData.education.forEach((edu, index) => {
            const eduItem = document.querySelector('.education-item').cloneNode(true);
            
            if (index === 0) {
                eduItem.querySelector('.remove-education').style.display = 'none';
            }
            
            eduItem.querySelector('.degree').value = edu.degree || '';
            eduItem.querySelector('.institution').value = edu.institution || '';
            eduItem.querySelector('.graduation-date').value = edu.graduationDate || '';
            eduItem.querySelector('.gpa').value = edu.gpa || '';
            
            eduContainer.appendChild(eduItem);
        });
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
        const chipInstance = M.Chips.getInstance(document.getElementById('skills-chips'));
        if (chipInstance) {
            resumeData.skills.forEach(skill => {
                chipInstance.addChip({ tag: skill });
            });
        }
    }
    
    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
        const langContainer = document.getElementById('language-fields');
        langContainer.innerHTML = '';
        
        resumeData.languages.forEach((lang, index) => {
            const langItem = document.querySelector('.language-item').cloneNode(true);
            
            if (index === 0) {
                langItem.querySelector('.remove-language').style.display = 'none';
            }
            
            langItem.querySelector('.language').value = lang.language || '';
            langItem.querySelector('.proficiency').value = lang.proficiency || '';
            
            langContainer.appendChild(langItem);
        });
    }
    
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
        const certContainer = document.getElementById('certification-fields');
        certContainer.innerHTML = '';
        
        resumeData.certifications.forEach((cert, index) => {
            const certItem = document.querySelector('.certification-item').cloneNode(true);
            
            if (index === 0) {
                certItem.querySelector('.remove-certification').style.display = 'none';
            }
            
            certItem.querySelector('.certification-name').value = cert.certificationName || '';
            certItem.querySelector('.certification-date').value = cert.certificationDate || '';
            
            certContainer.appendChild(certItem);
        });
    }
}

function downloadResume(resumeId) {
    Swal.fire({
        title: 'Preparing Download',
        html: 'Your resume is being prepared for download',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        // In a real implementation, this would generate and download the resume
        console.log('Downloading resume:', resumeId);
        
        // Record download activity
        const user = auth.currentUser;
        if (user) {
            db.collection('resumes').doc(resumeId).get().then(doc => {
                if (doc.exists) {
                    const resume = doc.data();
                    
                    db.collection('activity').add({
                        userId: user.uid,
                        type: 'resume_downloaded',
                        resumeName: resume.name,
                        format: 'PDF',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Update download count
                    db.collection('users').doc(user.uid).update({
                        downloadCount: firebase.firestore.FieldValue.increment(1)
                    });
                }
            });
        }
    });
}

function deleteResume(resumeId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const user = auth.currentUser;
            if (!user) return;
            
            db.collection('resumes').doc(resumeId).delete()
                .then(() => {
                    // Update resume count
                    db.collection('users').doc(user.uid).update({
                        resumeCount: firebase.firestore.FieldValue.increment(-1)
                    });
                    
                    // Record activity
                    db.collection('activity').add({
                        userId: user.uid,
                        type: 'resume_deleted',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Reload dashboard
                    loadDashboardData(user);
                    
                    Swal.fire(
                        'Deleted!',
                        'Your resume has been deleted.',
                        'success'
                    );
                })
                .catch(error => {
                    Swal.fire(
                        'Error!',
                        'There was a problem deleting your resume.',
                        'error'
                    );
                    console.error('Error deleting resume:', error);
                });
        }
    });
}

// Logout functionality
document.getElementById('logout')?.addEventListener('click', function(e) {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    });
});

// Initialize Materialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidenav
    const sidenavs = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavs);
    
    // Initialize tabs if they exist
    const tabs = document.querySelectorAll('.tabs');
    if (tabs.length > 0) {
        M.Tabs.init(tabs);
    }
    
    // Initialize datepickers if they exist
    const datepickers = document.querySelectorAll('.datepicker');
    if (datepickers.length > 0) {
        M.Datepicker.init(datepickers, {
            format: 'mmmm yyyy',
            autoClose: true
        });
    }
    
    // Initialize selects if they exist
    const selects = document.querySelectorAll('select');
    if (selects.length > 0) {
        M.FormSelect.init(selects);
    }
    
    // Initialize modals if they exist
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        M.Modal.init(modals);
    }
    
    // Initialize carousel if it exists
    const carousels = document.querySelectorAll('.carousel');
    if (carousels.length > 0) {
        M.Carousel.init(carousels, {
            fullWidth: true,
            indicators: true
        });
    }
    
    // Initialize chips if they exist
    const chips = document.querySelectorAll('.chips');
    if (chips.length > 0) {
        M.Chips.init(chips, {
            placeholder: 'Add a skill',
            secondaryPlaceholder: '+Skill',
            autocompleteOptions: {
                data: {
                    'JavaScript': null,
                    'Python': null,
                    'Java': null,
                    'C++': null,
                    'HTML': null,
                    'CSS': null,
                    'React': null,
                    'Angular': null,
                    'Node.js': null
                },
                limit: 20,
                minLength: 1
            }
        });
    }
    
    // Initialize dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    if (dropdowns.length > 0) {
        M.Dropdown.init(dropdowns, {
            coverTrigger: false
        });
    }
});