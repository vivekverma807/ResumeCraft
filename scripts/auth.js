// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
let logoutBtn = document.getElementById('logout');
let logoutMobileBtn = document.getElementById('logout-mobile');

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
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        } else {
            if (el.dataset.auth === 'logged-out') {
                el.style.display = '';
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
    }
    
    // Initialize dropdown if user is logged in
    if (user) {
        const dropdowns = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdowns, {
            coverTrigger: false
        });
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
            resumesTable.innerHTML = '';
            
            if (querySnapshot.empty) {
                resumesTable.innerHTML = `
                    <tr>
                        <td colspan="4" class="center-align">No resumes found. <a href="builder.html">Create your first resume</a></td>
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
                    <td>${new Date(resume.lastUpdated?.toDate()).toLocaleDateString()}</td>
                    <td>
                        <a href="builder.html?resumeId=${doc.id}" class="btn-small waves-effect waves-light blue">
                            <i class="mdi mdi-pencil"></i>
                        </a>
                        <a href="#!" class="btn-small waves-effect waves-light green download-resume" data-id="${doc.id}">
                            <i class="mdi mdi-download"></i>
                        </a>
                        <a href="#!" class="btn-small waves-effect waves-light red delete-resume" data-id="${doc.id}">
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
    
    // Similar implementation for education, skills, etc.
}

function downloadResume(resumeId) {
    // This would be implemented in pdf-export.js
    console.log('Downloading resume:', resumeId);
    M.toast({html: 'Preparing resume download...', classes: 'green'});
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
            db.collection('resumes').doc(resumeId).delete().then(() => {
                // Update resume count
                db.collection('users').doc(auth.currentUser.uid).update({
                    resumeCount: firebase.firestore.FieldValue.increment(-1)
                });
                
                // Reload dashboard
                loadDashboardData(auth.currentUser);
                
                Swal.fire(
                    'Deleted!',
                    'Your resume has been deleted.',
                    'success'
                );
            }).catch(error => {
                Swal.fire(
                    'Error!',
                    'There was a problem deleting your resume.',
                    'error'
                );
            });
        }
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = '../index.html';
        });
    });
}

if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = '../index.html';
        });
    });
}

// Initialize Materialize components
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    
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
});