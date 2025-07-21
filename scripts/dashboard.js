document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    
    // Load user data
    loadUserData();
    
    // Load recent resumes
    loadRecentResumes();
    
    // Load recent activity
    loadRecentActivity();
    
    // Setup logout button
    document.getElementById('logout')?.addEventListener('click', logout);
});

function loadUserData() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'auth/login.html';
        return;
    }
    
    // Update user info
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-greeting').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('username').textContent = user.displayName || user.email.split('@')[0];
    
    // Get user stats
    firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('resume-count').textContent = userData.resumeCount || 0;
            document.getElementById('download-count').textContent = userData.downloadCount || 0;
            document.getElementById('applications-count').textContent = userData.applicationsCount || 0;
            document.getElementById('favorites-count').textContent = userData.favoritesCount || 0;
            
            document.getElementById('resume-count-main').textContent = userData.resumeCount || 0;
            document.getElementById('download-count-main').textContent = userData.downloadCount || 0;
        }
    });
}

function loadRecentResumes() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    firebase.firestore().collection('resumes')
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
            
            // Add event listeners for download and delete buttons
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
        })
        .catch(error => {
            console.error('Error loading resumes:', error);
            M.toast({html: 'Error loading resumes', classes: 'red'});
        });
}

function loadRecentActivity() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    firebase.firestore().collection('activity')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get()
        .then(querySnapshot => {
            const activityFeed = document.getElementById('activity-feed');
            if (!activityFeed) return;
            
            activityFeed.innerHTML = '';
            
            if (querySnapshot.empty) {
                activityFeed.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-content">
                            <p>No recent activity</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            querySnapshot.forEach(doc => {
                const activity = doc.data();
                const item = document.createElement('div');
                item.className = 'activity-item';
                
                let icon = '';
                let text = '';
                
                switch(activity.type) {
                    case 'resume_created':
                        icon = 'mdi-file-document';
                        text = `Created resume "${activity.resumeName}"`;
                        break;
                    case 'resume_updated':
                        icon = 'mdi-file-document-edit';
                        text = `Updated resume "${activity.resumeName}"`;
                        break;
                    case 'resume_downloaded':
                        icon = 'mdi-download';
                        text = `Downloaded resume "${activity.resumeName}" as ${activity.format}`;
                        break;
                    default:
                        icon = 'mdi-information-outline';
                        text = activity.message || 'Activity recorded';
                }
                
                item.innerHTML = `
                    <div class="activity-icon">
                        <i class="mdi ${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p><strong>${text}</strong></p>
                        <p class="activity-meta">${formatDate(activity.timestamp?.toDate())}</p>
                    </div>
                `;
                
                activityFeed.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading activity:', error);
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

function downloadResume(resumeId) {
    console.log('Downloading resume:', resumeId);
    
    // Record download activity
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.firestore().collection('resumes').doc(resumeId).get().then(doc => {
            if (doc.exists) {
                const resume = doc.data();
                
                firebase.firestore().collection('activity').add({
                    userId: user.uid,
                    type: 'resume_downloaded',
                    resumeName: resume.name,
                    format: 'PDF',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update download count
                firebase.firestore().collection('users').doc(user.uid).update({
                    downloadCount: firebase.firestore.FieldValue.increment(1)
                });
                
                Swal.fire({
                    title: 'Preparing Download',
                    text: 'Your resume is being prepared for download',
                    icon: 'info',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        });
    }
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
            const user = firebase.auth().currentUser;
            if (!user) return;
            
            firebase.firestore().collection('resumes').doc(resumeId).delete()
                .then(() => {
                    // Update resume count
                    firebase.firestore().collection('users').doc(user.uid).update({
                        resumeCount: firebase.firestore.FieldValue.increment(-1)
                    });
                    
                    // Record activity
                    firebase.firestore().collection('activity').add({
                        userId: user.uid,
                        type: 'resume_deleted',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Reload resumes
                    loadRecentResumes();
                    
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

function logout() {
    firebase.auth().signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            Swal.fire({
                title: 'Error',
                text: 'Error signing out: ' + error.message,
                icon: 'error',
                confirmButtonColor: '#4361ee'
            });
        });
}