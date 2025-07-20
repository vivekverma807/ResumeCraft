document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Tabs.init(document.querySelectorAll('.tabs'));
    M.Datepicker.init(document.querySelectorAll('.datepicker'), {
        format: 'mmmm yyyy',
        autoClose: true
    });
    M.FormSelect.init(document.querySelectorAll('select'));
    M.Modal.init(document.querySelectorAll('.modal'));
    M.Chips.init(document.querySelectorAll('.chips'), {
        placeholder: 'Add a skill',
        secondaryPlaceholder: '+Skill',
        autocompleteOptions: {
            data: {
                'JavaScript': null,
                'Python': null,
                'Java': null,
                'C++': null,
                'PHP': null,
                'HTML': null,
                'CSS': null,
                'React': null,
                'Angular': null,
                'Vue.js': null,
                'Node.js': null,
                'Express': null,
                'Django': null,
                'Flask': null,
                'Ruby on Rails': null,
                'MySQL': null,
                'PostgreSQL': null,
                'MongoDB': null,
                'AWS': null,
                'Azure': null,
                'Google Cloud': null,
                'Docker': null,
                'Kubernetes': null,
                'Git': null,
                'CI/CD': null,
                'REST API': null,
                'GraphQL': null,
                'Machine Learning': null,
                'Data Analysis': null,
                'Project Management': null,
                'Agile': null,
                'Scrum': null
            },
            limit: 20,
            minLength: 1
        }
    });
    
    // Check URL for template parameter
    const urlParams = new URLSearchParams(window.location.search);
    const template = urlParams.get('template');
    if (template) {
        M.toast({html: `Using ${template} template`, classes: 'blue'});
    }
    
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
        if (e.target.classList.contains('remove-experience')) {
            if (document.querySelectorAll('.experience-item').length > 1) {
                e.target.closest('.experience-item').remove();
            } else {
                M.toast({html: 'You need at least one work experience', classes: 'orange'});
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
        if (e.target.classList.contains('remove-education')) {
            if (document.querySelectorAll('.education-item').length > 1) {
                e.target.closest('.education-item').remove();
            } else {
                M.toast({html: 'You need at least one education entry', classes: 'orange'});
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
        if (e.target.classList.contains('remove-language')) {
            if (document.querySelectorAll('.language-item').length > 1) {
                e.target.closest('.language-item').remove();
            } else {
                M.toast({html: 'You need at least one language entry', classes: 'orange'});
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
        if (e.target.classList.contains('remove-certification')) {
            if (document.querySelectorAll('.certification-item').length > 1) {
                e.target.closest('.certification-item').remove();
            } else {
                M.toast({html: 'You need at least one certification entry', classes: 'orange'});
            }
        }
    });
    
    // Preview button click
    document.querySelector('.preview-btn').addEventListener('click', function() {
        generateResumePreview();
        const modal = M.Modal.getInstance(document.getElementById('preview-modal'));
        modal.open();
    });
    
    // Generate PDF button
    document.querySelector('.generate-pdf').addEventListener('click', function() {
        generatePDF();
    });
    
    // Generate DOC button
    document.querySelector('.generate-doc').addEventListener('click', function() {
        generateDOC();
    });
    
    // Floating generate button
    document.querySelector('.generate-resume').addEventListener('click', function() {
        Swal.fire({
            title: 'Generate Resume',
            text: 'Would you like to preview your resume or download it directly?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Preview',
            cancelButtonText: 'Download PDF',
            confirmButtonColor: '#2196F3',
            cancelButtonColor: '#4CAF50'
        }).then((result) => {
            if (result.isConfirmed) {
                generateResumePreview();
                const modal = M.Modal.getInstance(document.getElementById('preview-modal'));
                modal.open();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                generatePDF();
            }
        });
    });
    
    // Save button
    document.getElementById('save-resume')?.addEventListener('click', saveResume);
    document.getElementById('save-resume-mobile')?.addEventListener('click', saveResume);
    
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
            
            <div class="resume-section resume-summary">
                <h3>PROFESSIONAL SUMMARY</h3>
                <p>${formData.summary || 'Experienced professional with a proven track record of success in...'}</p>
            </div>
        `;
        
        // Add experience
        if (formData.experience.length > 0) {
            resumeHTML += `<div class="resume-section"><h3>WORK EXPERIENCE</h3>`;
            
            formData.experience.forEach(exp => {
                resumeHTML += `
                    <div class="experience-item">
                        <div class="experience-header">
                            <div>
                                <span class="experience-title">${exp.job_title || 'Job Title'}</span>
                                <span class="experience-company">, ${exp.company || 'Company'}</span>
                            </div>
                            <div class="experience-date">
                                ${exp.start_date || 'Start Date'} - ${exp.end_date || 'Present'}
                            </div>
                        </div>
                        <div class="experience-description">
                            <ul>
                                ${exp.description ? exp.description.split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('') : '<li>Job responsibilities and achievements</li>'}
                            </ul>
                        </div>
                    </div>
                `;
            });
            
            resumeHTML += `</div>`;
        }
        
        // Add education
        if (formData.education.length > 0) {
            resumeHTML += `<div class="resume-section"><h3>EDUCATION</h3>`;
            
            formData.education.forEach(edu => {
                resumeHTML += `
                    <div class="education-item">
                        <div class="education-header">
                            <div>
                                <span class="education-degree">${edu.degree || 'Degree'}</span>
                                <span class="education-institution">, ${edu.institution || 'Institution'}</span>
                            </div>
                            <div class="education-date">
                                ${edu.graduation_date || 'Graduation Date'}${edu.gpa ? `, GPA: ${edu.gpa}` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resumeHTML += `</div>`;
        }
        
        // Add skills
        if (formData.skills.length > 0) {
            resumeHTML += `
                <div class="resume-section">
                    <h3>SKILLS</h3>
                    <div class="skills-list">
                        ${formData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add languages
        if (formData.languages.length > 0) {
            resumeHTML += `<div class="resume-section"><h3>LANGUAGES</h3>`;
            
            formData.languages.forEach(lang => {
                resumeHTML += `
                    <div class="language-item">
                        <span class="language-name">${lang.language || 'Language'}</span>
                        <span class="language-proficiency">${lang.proficiency || 'Proficiency'}</span>
                    </div>
                `;
            });
            
            resumeHTML += `</div>`;
        }
        
        // Add certifications
        if (formData.certifications.length > 0) {
            resumeHTML += `<div class="resume-section"><h3>CERTIFICATIONS</h3>`;
            
            formData.certifications.forEach(cert => {
                resumeHTML += `
                    <div>
                        <strong>${cert.certification_name || 'Certification Name'}</strong> - ${cert.certification_date || 'Date Obtained'}
                    </div>
                `;
            });
            
            resumeHTML += `</div>`;
        }
        
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
    function saveResume() {
        if (!auth.currentUser) {
            window.location.href = 'auth/login.html?redirect=builder.html';
            return;
        }
        
        const formData = getFormData();
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('resumeId');
        const template = urlParams.get('template') || 'classic';
        
        const resumeDoc = {
            userId: auth.currentUser.uid,
            name: formData.full_name || 'Untitled Resume',
            template: template,
            data: formData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (resumeId) {
            // Update existing resume
            db.collection('resumes').doc(resumeId).update(resumeDoc)
                .then(() => {
                    M.toast({html: 'Resume updated successfully!', classes: 'green'});
                })
                .catch(error => {
                    M.toast({html: 'Error updating resume: ' + error.message, classes: 'red'});
                });
        } else {
            // Create new resume
            db.collection('resumes').add(resumeDoc)
                .then((docRef) => {
                    // Update URL with new resume ID
                    window.history.replaceState({}, document.title, `builder.html?resumeId=${docRef.id}`);
                    
                    // Update user's resume count
                    db.collection('users').doc(auth.currentUser.uid).update({
                        resumeCount: firebase.firestore.FieldValue.increment(1)
                    });
                    
                    M.toast({html: 'Resume saved successfully!', classes: 'green'});
                })
                .catch(error => {
                    M.toast({html: 'Error saving resume: ' + error.message, classes: 'red'});
                });
        }
    }
    
    // Generate PDF
    function generatePDF() {
        generateResumePreview();
        
        Swal.fire({
            title: 'Generating PDF...',
            html: 'Please wait while we prepare your resume',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                
                // Use html2canvas and jsPDF to generate PDF
                const preview = document.getElementById('resume-preview');
                
                html2canvas(preview, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210; // A4 width in mm
                    const pageHeight = 295; // A4 height in mm
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    // Save the PDF
                    pdf.save(`${document.getElementById('full_name').value || 'resume'}.pdf`);
                    
                    Swal.fire({
                        title: 'Success!',
                        text: 'Your resume has been downloaded as PDF',
                        icon: 'success',
                        confirmButtonColor: '#2196F3'
                    });
                }).catch(err => {
                    console.error('Error generating PDF:', err);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to generate PDF. Please try again.',
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
                        confirmButtonColor: '#2196F3'
                    });
                }, 1500);
            }
        });
    }
});