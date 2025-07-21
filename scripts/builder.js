document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Datepicker.init(document.querySelectorAll('.datepicker'), {
        format: 'mmmm yyyy',
        autoClose: true
    });
    M.FormSelect.init(document.querySelectorAll('select'));
    M.Modal.init(document.querySelectorAll('.modal'));
    
    // Initialize chips
    M.Chips.init(document.querySelectorAll('.chips'), {
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
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add experience field
    document.getElementById('add-experience').addEventListener('click', function() {
        const experienceFields = document.getElementById('experience-fields');
        const newExperience = experienceFields.firstElementChild.cloneNode(true);
        resetInputs(newExperience);
        experienceFields.appendChild(newExperience);
        M.Datepicker.init(newExperience.querySelectorAll('.datepicker'), {
            format: 'mmmm yyyy',
            autoClose: true
        });
    });
    
    // Remove experience field
    document.getElementById('experience-fields').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn')) {
            if (document.querySelectorAll('.experience-item').length > 1) {
                e.target.closest('.experience-item').remove();
            } else {
                Swal.fire({
                    title: 'Cannot Remove',
                    text: 'You need at least one work experience',
                    icon: 'warning',
                    confirmButtonColor: '#4361ee'
                });
            }
        }
    });
    
    // Add education field
    document.getElementById('add-education').addEventListener('click', function() {
        const educationFields = document.getElementById('education-fields');
        const newEducation = educationFields.firstElementChild.cloneNode(true);
        resetInputs(newEducation);
        educationFields.appendChild(newEducation);
        M.Datepicker.init(newEducation.querySelectorAll('.datepicker'), {
            format: 'mmmm yyyy',
            autoClose: true
        });
    });
    
    // Remove education field
    document.getElementById('education-fields').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn')) {
            if (document.querySelectorAll('.education-item').length > 1) {
                e.target.closest('.education-item').remove();
            } else {
                Swal.fire({
                    title: 'Cannot Remove',
                    text: 'You need at least one education entry',
                    icon: 'warning',
                    confirmButtonColor: '#4361ee'
                });
            }
        }
    });
    
    // Add language field
    document.getElementById('add-language').addEventListener('click', function() {
        const languageFields = document.getElementById('language-fields');
        const newLanguage = languageFields.firstElementChild.cloneNode(true);
        resetInputs(newLanguage);
        languageFields.appendChild(newLanguage);
        M.FormSelect.init(newLanguage.querySelectorAll('select'));
    });
    
    // Remove language field
    document.getElementById('language-fields').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn')) {
            if (document.querySelectorAll('.language-item').length > 1) {
                e.target.closest('.language-item').remove();
            } else {
                Swal.fire({
                    title: 'Cannot Remove',
                    text: 'You need at least one language entry',
                    icon: 'warning',
                    confirmButtonColor: '#4361ee'
                });
            }
        }
    });
    
    // Add certification field
    document.getElementById('add-certification').addEventListener('click', function() {
        const certificationFields = document.getElementById('certification-fields');
        const newCertification = certificationFields.firstElementChild.cloneNode(true);
        resetInputs(newCertification);
        certificationFields.appendChild(newCertification);
        M.Datepicker.init(newCertification.querySelectorAll('.datepicker'), {
            format: 'mmmm yyyy',
            autoClose: true
        });
    });
    
    // Remove certification field
    document.getElementById('certification-fields').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn')) {
            if (document.querySelectorAll('.certification-item').length > 1) {
                e.target.closest('.certification-item').remove();
            } else {
                Swal.fire({
                    title: 'Cannot Remove',
                    text: 'You need at least one certification entry',
                    icon: 'warning',
                    confirmButtonColor: '#4361ee'
                });
            }
        }
    });
    
    // Preview button click
    document.getElementById('preview-btn').addEventListener('click', function() {
        generateResumePreview();
        const modal = M.Modal.getInstance(document.getElementById('preview-modal'));
        modal.open();
    });
    
    // Download PDF button
    document.getElementById('download-pdf').addEventListener('click', function() {
        generatePDF();
    });
    
    // Download DOC button
    document.getElementById('download-doc').addEventListener('click', function() {
        generateDOC();
    });
    
    // Save button
    document.getElementById('save-btn').addEventListener('click', saveResume);
    
    // Helper function to reset inputs in cloned elements
    function resetInputs(parent) {
        const inputs = parent.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
                M.FormSelect.init(input);
            }
        });
    }
    
    // Generate resume preview
    function generateResumePreview() {
        const preview = document.getElementById('resume-preview');
        preview.innerHTML = '';
        
        // Get all form data
        const formData = getFormData();
        
        // Create resume HTML
        let resumeHTML = `
            <div class="resume-template">
                <div class="resume-header">
                    <div>
                        <h1>${formData.full_name || 'Your Name'}</h1>
                        <h2>${formData.job_title || 'Professional Title'}</h2>
                    </div>
                    <div class="resume-contact">
                        <p>${formData.email || 'email@example.com'}</p>
                        <p>${formData.phone || '(123) 456-7890'}</p>
                        <p>${formData.address || 'City, State'}</p>
                        ${formData.linkedin ? `<p>LinkedIn: ${formData.linkedin}</p>` : ''}
                    </div>
                </div>
                
                ${formData.summary ? `
                    <div class="resume-section">
                        <h3>PROFESSIONAL SUMMARY</h3>
                        <p>${formData.summary}</p>
                    </div>
                ` : ''}
                
                ${formData.experience.length > 0 ? `
                    <div class="resume-section">
                        <h3>WORK EXPERIENCE</h3>
                        ${formData.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-header">
                                    <div>
                                        <strong>${exp.job_title}</strong>
                                        <span>${exp.company}</span>
                                    </div>
                                    <div class="experience-date">
                                        ${exp.start_date} - ${exp.end_date || 'Present'}
                                    </div>
                                </div>
                                <div class="experience-description">
                                    <ul>
                                        ${exp.description ? exp.description.split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('') : '<li>Job responsibilities and achievements</li>'}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${formData.education.length > 0 ? `
                    <div class="resume-section">
                        <h3>EDUCATION</h3>
                        ${formData.education.map(edu => `
                            <div class="education-item">
                                <div class="education-header">
                                    <div>
                                        <strong>${edu.degree}</strong>
                                        <span>${edu.institution}</span>
                                    </div>
                                    <div class="education-date">
                                        ${edu.graduation_date}${edu.gpa ? `, GPA: ${edu.gpa}` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${formData.skills.length > 0 ? `
                    <div class="resume-section">
                        <h3>SKILLS</h3>
                        <div class="skills-list">
                            ${formData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${formData.languages.length > 0 ? `
                    <div class="resume-section">
                        <h3>LANGUAGES</h3>
                        ${formData.languages.map(lang => `
                            <div class="language-item">
                                <span class="language-name">${lang.language}</span>
                                <span class="language-proficiency">${lang.proficiency}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${formData.certifications.length > 0 ? `
                    <div class="resume-section">
                        <h3>CERTIFICATIONS</h3>
                        ${formData.certifications.map(cert => `
                            <div>
                                <strong>${cert.certification_name}</strong> - ${cert.certification_date}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        preview.innerHTML = resumeHTML;
    }
    
    // Get all form data
    function getFormData() {
        const formData = {
            full_name: document.getElementById('full_name').value,
            job_title: document.getElementById('job_title').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value,
            experience: [],
            education: [],
            skills: [],
            languages: [],
            certifications: []
        };
        
        // Get experience data
        document.querySelectorAll('.experience-item').forEach(item => {
            formData.experience.push({
                job_title: item.querySelector('.job-title').value,
                company: item.querySelector('.company').value,
                start_date: item.querySelector('.start-date').value,
                end_date: item.querySelector('.end-date').value,
                description: item.querySelector('.description').value
            });
        });
        
        // Get education data
        document.querySelectorAll('.education-item').forEach(item => {
            formData.education.push({
                degree: item.querySelector('.degree').value,
                institution: item.querySelector('.institution').value,
                graduation_date: item.querySelector('.graduation-date').value,
                gpa: item.querySelector('.gpa').value
            });
        });
        
        // Get skills
        const chipInstance = M.Chips.getInstance(document.getElementById('skills-chips'));
        if (chipInstance) {
            formData.skills = chipInstance.chipsData.map(chip => chip.tag);
        }
        
        // Get languages
        document.querySelectorAll('.language-item').forEach(item => {
            formData.languages.push({
                language: item.querySelector('.language').value,
                proficiency: item.querySelector('.proficiency').value
            });
        });
        
        // Get certifications
        document.querySelectorAll('.certification-item').forEach(item => {
            formData.certifications.push({
                certification_name: item.querySelector('.certification-name').value,
                certification_date: item.querySelector('.certification-date').value
            });
        });
        
        return formData;
    }
    
    // Save resume to Firestore
    async function saveResume() {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = 'auth/login.html';
            return;
        }
        
        const formData = getFormData();
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('resumeId');
        
        const resumeDoc = {
            userId: user.uid,
            name: formData.full_name || 'Untitled Resume',
            data: formData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Saving...';
        
        try {
            if (resumeId) {
                // Update existing resume
                await firebase.firestore().collection('resumes').doc(resumeId).update(resumeDoc);
                Swal.fire('Success!', 'Resume updated successfully', 'success');
            } else {
                // Create new resume
                const docRef = await firebase.firestore().collection('resumes').add(resumeDoc);
                window.history.replaceState({}, document.title, `builder.html?resumeId=${docRef.id}`);
                
                // Update user's resume count
                await firebase.firestore().collection('users').doc(user.uid).update({
                    resumeCount: firebase.firestore.FieldValue.increment(1)
                });
                
                Swal.fire('Success!', 'Resume saved successfully', 'success');
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            Swal.fire('Error', 'Failed to save resume: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="mdi mdi-content-save"></i> Save';
        }
    }
    
    // Generate PDF
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        
        // Generate the preview first
        generateResumePreview();
        
        // Get the preview element
        const element = document.getElementById('resume-preview');
        
        Swal.fire({
            title: 'Generating PDF',
            html: 'Please wait while we prepare your resume...',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                
                html2canvas(element, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210; // A4 width in mm
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save('resume.pdf');
                    
                    Swal.fire({
                        title: 'Success!',
                        text: 'Your resume has been downloaded',
                        icon: 'success'
                    });
                }).catch(err => {
                    console.error('Error generating PDF:', err);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to generate PDF',
                        icon: 'error'
                    });
                });
            }
        });
    }
    
    // Generate DOC (simplified version)
    function generateDOC() {
        generateResumePreview();
        
        Swal.fire({
            title: 'Generating DOC...',
            html: 'Please wait while we prepare your resume',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                
                setTimeout(() => {
                    // Create a blob with the HTML content (simplified)
                    const content = document.getElementById('resume-preview').innerHTML;
                    const blob = new Blob([content], { type: 'application/msword' });
                    
                    // Create download link
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${document.getElementById('full_name').value || 'resume'}.doc`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    Swal.fire({
                        title: 'Success!',
                        text: 'Your resume has been downloaded as DOC',
                        icon: 'success',
                        confirmButtonColor: '#4361ee'
                    });
                }, 1500);
            }
        });
    }
});