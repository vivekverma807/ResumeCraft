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
        <div class="resume-template-${data.template}">
            <div class="resume-header">
                <h1>${data.personal.name}</h1>
                <h2>${data.personal.title}</h2>
                <div class="contact-info">
                    ${data.personal.email ? `<p>${data.personal.email}</p>` : ''}
                    ${data.personal.phone ? `<p>${data.personal.phone}</p>` : ''}
                    ${data.personal.linkedin ? `<p>${data.personal.linkedin}</p>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
                <div class="section">
                    <h3>SUMMARY</h3>
                    <p>${data.summary}</p>
                </div>
            ` : ''}
            
            ${data.experience.length > 0 ? `
                <div class="section">
                    <h3>EXPERIENCE</h3>
                    ${data.experience.map(exp => `
                        <div class="experience">
                            <div class="experience-header">
                                <strong>${exp.jobTitle}</strong>
                                <span>${exp.company}</span>
                                <span class="date">${exp.startDate} - ${exp.endDate || 'Present'}</span>
                            </div>
                            <ul>
                                ${exp.description.split('\n').map(line => `<li>${line}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${data.education.length > 0 ? `
                <div class="section">
                    <h3>EDUCATION</h3>
                    ${data.education.map(edu => `
                        <div class="education">
                            <div class="education-header">
                                <strong>${edu.degree}</strong>
                                <span>${edu.institution}</span>
                                <span class="date">${edu.graduationDate}</span>
                            </div>
                            ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${data.skills.length > 0 ? `
                <div class="section">
                    <h3>SKILLS</h3>
                    <div class="skills">
                        ${data.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}