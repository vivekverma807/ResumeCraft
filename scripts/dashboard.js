document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {
        coverTrigger: false
    });
    
    // Load user data
    loadUserData();
    
    // Load recent resumes
    loadRecentResumes();
    
    // Load recent activity
    loadRecentActivity();
    
    // Setup logout button
    document.getElementById('logout')?.addEventListener('click', logout);
    document.getElementById('logout-mobile')?.addEventListener('click', logout);
});

function loadUserData() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'auth/login.html';
        return;
    }
    
    // Update user info
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-greeting').textContent = user.displayName || user.email.split('@')[0];
    
    // Get user stats
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('resume-count').textContent = userData.resumeCount || 0;
            document.getElementById('download-count').textContent = userData.downloadCount || 0;
            document.getElementById('applications-count').textContent = userData.applicationsCount || 0;
            document.getElementById('favorites-count').textContent = userData.favoritesCount || 0;
        }
    });
}

function loadRecentResumes() {
    const user = auth.currentUser;
    if (!user) return;
    
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
                    <td>${formatDate(resume.lastUpdated?.toDate())}</td>
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
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('activity')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get()
        .then(querySnapshot => {
            const activityFeed = document.getElementById('activity-feed');
            activityFeed.innerHTML = '';
            
            if (querySnapshot.empty) {
                activityFeed.innerHTML = `
                    <li class="collection-item">
                        <span class="title">No recent activity</span>
                    </li>
                `;
                return;
            }
            
            querySnapshot.forEach(doc => {
                const activity = doc.data();
                const item = document.createElement('li');
                item.className = 'collection-item avatar';
                
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
                    <i class="mdi ${icon} circle blue"></i>
                    <span class="title">${text}</span>
                    <p>${formatDate(activity.timestamp?.toDate())}</p>
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
                
                M.toast({html: 'Preparing resume download...', classes: 'green'});
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
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            M.toast({html: 'Error signing out: ' + error.message, classes: 'red'});
        });
}