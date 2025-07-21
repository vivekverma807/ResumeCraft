document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    
    // Load user data
    loadUserData();
    
    // Load recent resumes
    loadRecentResumes();
    
    // Setup logout button
    document.getElementById('logout')?.addEventListener('click', logout);
});

async function loadUserData() {
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
    
    try {
        // Get user stats
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('resume-count').textContent = userData.resumeCount || 0;
            document.getElementById('download-count').textContent = userData.downloadCount || 0;
            document.getElementById('resume-count-main').textContent = userData.resumeCount || 0;
            document.getElementById('download-count-main').textContent = userData.downloadCount || 0;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadRecentResumes() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const querySnapshot = await firebase.firestore().collection('resumes')
            .where('userId', '==', user.uid)
            .orderBy('lastUpdated', 'desc')
            .limit(5)
            .get();
            
        const resumesTable = document.getElementById('resumes-table');
        if (!resumesTable) return;
        
        resumesTable.innerHTML = '';
        
        if (querySnapshot.empty) {
            resumesTable.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-table">No resumes found. <a href="builder.html">Create your first resume</a></td>
                </tr>
            `;
            return;
        }
        
        querySnapshot.forEach(doc => {
            const resume = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${resume.name || 'Untitled Resume'}</td>
                <td>${formatDate(resume.lastUpdated?.toDate())}</td>
                <td class="action-buttons">
                    <a href="builder.html?resumeId=${doc.id}" class="btn btn-icon">
                        <i class="mdi mdi-pencil"></i>
                    </a>
                    <a href="#" class="btn btn-icon download-resume" data-id="${doc.id}">
                        <i class="mdi mdi-download"></i>
                    </a>
                    <a href="#" class="btn btn-icon delete-resume" data-id="${doc.id}">
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
    } catch (error) {
        console.error('Error loading resumes:', error);
        M.toast({html: 'Error loading resumes', classes: 'red'});
    }
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

async function downloadResume(resumeId) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const resumeDoc = await firebase.firestore().collection('resumes').doc(resumeId).get();
        if (resumeDoc.exists) {
            // Record download activity
            await firebase.firestore().collection('users').doc(user.uid).update({
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
    } catch (error) {
        console.error("Error downloading resume:", error);
    }
}

async function deleteResume(resumeId) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await firebase.firestore().collection('resumes').doc(resumeId).delete();
                
                // Update resume count
                await firebase.firestore().collection('users').doc(user.uid).update({
                    resumeCount: firebase.firestore.FieldValue.increment(-1)
                });
                
                // Reload resumes
                loadRecentResumes();
                
                Swal.fire(
                    'Deleted!',
                    'Your resume has been deleted.',
                    'success'
                );
            } catch (error) {
                Swal.fire(
                    'Error!',
                    'There was a problem deleting your resume.',
                    'error'
                );
                console.error('Error deleting resume:', error);
            }
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