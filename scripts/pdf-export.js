function generatePDF(resumeData) {
    return new Promise((resolve) => {
        // Create a hidden div with resume content
        const pdfElement = document.createElement('div');
        pdfElement.id = 'pdf-export';
        pdfElement.style.position = 'absolute';
        pdfElement.style.left = '-9999px';
        pdfElement.innerHTML = generateResumeHTML(resumeData);
        
        document.body.appendChild(pdfElement);
        
        html2canvas(pdfElement).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 0, 0);
            document.body.removeChild(pdfElement);
            resolve(pdf);
        });
    });
}

function generateResumeHTML(data) {
    // Generate HTML based on resume data and template
    return `
        <div class="resume-template-${data.template || 'classic'}">
            <div class="resume-header">
                <div>
                    <h1>${data.personal?.name || 'Your Name'}</h1>
                    <h2>${data.personal?.title || 'Professional Title'}</h2>
                </div>
                <div class="resume-contact">
                    <p>${data.personal?.email || 'email@example.com'}</p>
                    <p>${data.personal?.phone || '(123) 456-7890'}</p>
                    <p>${data.personal?.address || 'City, State'}</p>
                    ${data.personal?.linkedin ? `<p>LinkedIn: ${data.personal.linkedin}</p>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
                <div class="resume-section">
                    <h3>SUMMARY</h3>
                    <p>${data.summary}</p>
                </div>
            ` : ''}
            
            ${data.experience?.length > 0 ? `
                <div class="resume-section">
                    <h3>EXPERIENCE</h3>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="experience-header">
                                <div>
                                    <strong>${exp.job_title || 'Job Title'}</strong>
                                    <span>${exp.company || 'Company'}</span>
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
                    `).join('')}
                </div>
            ` : ''}
            
            ${data.education?.length > 0 ? `
                <div class="resume-section">
                    <h3>EDUCATION</h3>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="education-header">
                                <div>
                                    <strong>${edu.degree || 'Degree'}</strong>
                                    <span>${edu.institution || 'Institution'}</span>
                                </div>
                                <div class="education-date">
                                    ${edu.graduation_date || 'Graduation Date'}${edu.gpa ? `, GPA: ${edu.gpa}` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${data.skills?.length > 0 ? `
                <div class="resume-section">
                    <h3>SKILLS</h3>
                    <div class="skills-list">
                        ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${data.languages?.length > 0 ? `
                <div class="resume-section">
                    <h3>LANGUAGES</h3>
                    ${data.languages.map(lang => `
                        <div class="language-item">
                            <span class="language-name">${lang.language || 'Language'}</span>
                            <span class="language-proficiency">${lang.proficiency || 'Proficiency'}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${data.certifications?.length > 0 ? `
                <div class="resume-section">
                    <h3>CERTIFICATIONS</h3>
                    ${data.certifications.map(cert => `
                        <div>
                            <strong>${cert.certification_name || 'Certification Name'}</strong> - ${cert.certification_date || 'Date Obtained'}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Export functions for use in other files
export { generatePDF, generateResumeHTML };