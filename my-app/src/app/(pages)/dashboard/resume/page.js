'use client';
import { useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './page.css';

const GenerateResume = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const resumeRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    heading: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
    about: '',
    summary: '',
    education: [{
      university: '',
      degree: '',
      duration: '',
      gpa: ''
    }],
    projects: [{
      name: '',
      description: '',
      technologies: '',
      githubUrl: '',
      details: []
    }],
    technologies: {
      languages: '',
      frameworks: ''
    }
  });

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design with a focus on readability' },
    { id: 'professional', name: 'Professional', description: 'Traditional layout perfect for corporate positions' },
    { id: 'creative', name: 'Creative', description: 'Unique design for creative industry professionals' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant design with essential information' },
    { id: 'technical', name: 'Technical', description: 'Focused on technical skills and project details' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { 
        name: '', 
        description: '', 
        technologies: '',
        githubUrl: '',
        details: []
      }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        university: '',
        degree: '',
        duration: '',
        gpa: ''
      }]
    }));
  };

  const steps = [
    { number: 1, label: 'Choose Template' },
    { number: 2, label: 'Personal Info' },
    { number: 3, label: 'Education' },
    { number: 4, label: 'Projects' },
    { number: 5, label: 'Skills' }
  ];

  const generatePDF = async () => {
    const element = resumeRef.current;
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: [10, 10],
      filename: `${formData.fullName.trim() || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Generate PDF blob
      const pdf = await html2pdf().set(opt).from(element).output('blob');
      
      // Create a File object from the blob
      const file = new File([pdf], opt.filename, { type: 'application/pdf' });
      
      // Save to profile if requested
      const shouldSave = window.confirm('Would you like to save this resume to your profile?');
      if (shouldSave) {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/profile/resume', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to save resume to profile');
        }
        
        toast.success('Resume saved to your profile successfully!');
      }
      
      // Download the PDF
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = opt.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating/saving resume:', error);
      toast.error(error.message || 'Failed to generate resume');
    }
  };

  return (
    <div className="resume-generator">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <div className="editor-section">
        <button onClick={() => window.location.href = '/dashboard'} className="back-button">
          ← Back to Dashboard
        </button>
        <h2>Professional Resume Builder</h2>
        
        <div className="form-steps">
          {steps.map((step) => (
            <div key={step.number} className={`step ${currentStep >= step.number ? 'active' : ''}`}>
              <div className="step-circle">{step.number}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="form-section">
            <h3>Choose Your Template</h3>
            <div className="template-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-preview">
                    <img src={`/templates/${template.id}.png`} alt={template.name} />
                  </div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                placeholder="Professional Heading (e.g., Full Stack Developer)"
                className="input-field"
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="input-field"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="input-field"
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="input-field"
              />
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Website"
                className="input-field"
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                placeholder="GitHub Username"
                className="input-field"
              />
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="LinkedIn Username"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Write a brief introduction about yourself..."
                className="textarea-field"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section">
            <h3>Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="education-entry">
                <input
                  type="text"
                  value={edu.university}
                  onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                  placeholder="University Name"
                  className="input-field"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Degree and Specialization"
                  className="input-field"
                />
                <div className="form-row">
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) => handleEducationChange(index, 'duration', e.target.value)}
                    placeholder="Duration (e.g., July 2023 - May 2027)"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    placeholder="CGPA"
                    className="input-field"
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="add-education-button">
              + Add Education
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-section">
            <h3>Projects</h3>
            {formData.projects.map((project, index) => (
              <div key={index} className="project-entry">
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                  placeholder="Project Name"
                  className="input-field"
                />
                <textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  placeholder="Project Description"
                  className="textarea-field"
                  rows="2"
                />
                <input
                  type="text"
                  value={project.technologies}
                  onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                  placeholder="Technologies Used (comma-separated)"
                  className="input-field"
                />
                <input
                  type="text"
                  value={project.githubUrl}
                  onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)}
                  placeholder="GitHub Repository URL"
                  className="input-field"
                />
              </div>
            ))}
            <button type="button" onClick={addProject} className="add-button">
              + Add Project
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-section">
            <h3>Technologies</h3>
            <div className="tech-inputs">
              <textarea
                name="languages"
                value={formData.technologies.languages}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'technologies',
                    value: { ...formData.technologies, languages: e.target.value }
                  }
                })}
                placeholder="Languages (e.g., C, Java, PHP, SQL, JavaScript...)"
                className="textarea-field"
                rows="2"
              />
              <textarea
                name="frameworks"
                value={formData.technologies.frameworks}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'technologies',
                    value: { ...formData.technologies, frameworks: e.target.value }
                  }
                })}
                placeholder="Frameworks & Libraries (e.g., React.js, Next.js, Node.js...)"
                className="textarea-field"
                rows="2"
              />
            </div>
          </div>
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="add-button"
              style={{ marginRight: '1rem', background: '#64748b' }}
            >
              Previous
            </button>
          )}
          {currentStep < 5 && (
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="add-button"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="preview-section">
        <div className="preview-header">
          <h2>Preview</h2>
          <button className="generate-button" onClick={generatePDF}>
            Download PDF
          </button>
        </div>
        <div className="resume-preview">
          <div ref={resumeRef}>
            {selectedTemplate === 'modern' && <ModernTemplate formData={formData} />}
            {selectedTemplate === 'professional' && <ProfessionalTemplate formData={formData} />}
            {selectedTemplate === 'creative' && <CreativeTemplate formData={formData} />}
            {selectedTemplate === 'minimal' && <MinimalTemplate formData={formData} />}
            {selectedTemplate === 'technical' && <TechnicalTemplate formData={formData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernTemplate = ({ formData }) => (
  <div className="preview-content modern-template">
    <h1>{formData.fullName}</h1>
    {formData.heading && <div className="heading-text">{formData.heading}</div>}
    <div className="contact-line">
      {formData.location && <span>{formData.location}</span>}
      {formData.location && formData.email && " • "}
      {formData.email && <span>{formData.email}</span>}
      {formData.email && formData.phone && " • "}
      {formData.phone && <span>{formData.phone}</span>}
    </div>
    {(formData.github || formData.linkedin) && (
      <div className="contact-line">
        {formData.github && <span>github.com/{formData.github}</span>}
        {formData.github && formData.linkedin && " • "}
        {formData.linkedin && <span>linkedin.com/in/{formData.linkedin}</span>}
      </div>
    )}

    {formData.about && (
      <>
        <div className="divider-line"></div>
        <div className="about-section">
          <p>{formData.about}</p>
        </div>
      </>
    )}

    {formData.education.length > 0 && formData.education[0].university && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">EDUCATION</div>
          {formData.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <span className="education-school">{edu.university}</span>
                <span className="education-date">{edu.duration}</span>
              </div>
              <div className="education-degree">{edu.degree}</div>
              {edu.gpa && <div className="education-details">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      </>
    )}

    {formData.projects.length > 0 && formData.projects[0].name && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">PROJECTS</div>
          {formData.projects.map((project, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <span className="experience-title">{project.name}</span>
              </div>
              <ul className="bullet-list">
                <li>{project.description}</li>
                {project.technologies && (
                  <li>Built using: {project.technologies}</li>
                )}
                {project.githubUrl && (
                  <li>Source code: {project.githubUrl}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </>
    )}

    {(formData.technologies.languages || formData.technologies.frameworks) && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">TECHNICAL SKILLS</div>
          <ul className="skills-list">
            {formData.technologies.languages && (
              <li><strong>Languages:</strong> {formData.technologies.languages}</li>
            )}
            {formData.technologies.frameworks && (
              <li><strong>Frameworks & Tools:</strong> {formData.technologies.frameworks}</li>
            )}
          </ul>
        </div>
      </>
    )}
  </div>
);

const ProfessionalTemplate = ({ formData }) => (
  <div className="preview-content professional-template">
    <h1>{formData.fullName}</h1>
    {formData.heading && <div className="heading-text">{formData.heading}</div>}
    <div className="contact-line">
      {formData.location && formData.location}
      {formData.location && formData.email && " • "}
      {formData.email && formData.email}
      {formData.email && formData.phone && " • "}
      {formData.phone && formData.phone}
    </div>
    {(formData.github || formData.linkedin) && (
      <div className="contact-line">
        {formData.github && <span>github.com/{formData.github}</span>}
        {formData.github && formData.linkedin && " • "}
        {formData.linkedin && <span>linkedin.com/in/{formData.linkedin}</span>}
      </div>
    )}

    {formData.about && (
      <>
        <div className="divider-line"></div>
        <div className="about-section">
          <p>{formData.about}</p>
        </div>
      </>
    )}

    {formData.education.length > 0 && formData.education[0].university && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">EDUCATION</div>
          {formData.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <span className="education-school">{edu.university}</span>
                <span className="education-date">{edu.duration}</span>
              </div>
              <div className="education-degree">{edu.degree}</div>
              {edu.gpa && <div className="education-details">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      </>
    )}

    {formData.projects.length > 0 && formData.projects[0].name && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">PROJECTS</div>
          {formData.projects.map((project, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <span className="experience-title">{project.name}</span>
              </div>
              <ul className="bullet-list">
                <li>{project.description}</li>
                {project.technologies && (
                  <li>Built using: {project.technologies}</li>
                )}
                {project.githubUrl && (
                  <li>Source code: {project.githubUrl}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </>
    )}

    {(formData.technologies.languages || formData.technologies.frameworks) && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">TECHNICAL SKILLS</div>
          <ul className="skills-list">
            {formData.technologies.languages && (
              <li><strong>Languages:</strong> {formData.technologies.languages}</li>
            )}
            {formData.technologies.frameworks && (
              <li><strong>Frameworks & Tools:</strong> {formData.technologies.frameworks}</li>
            )}
          </ul>
        </div>
      </>
    )}
  </div>
);

const CreativeTemplate = ({ formData }) => (
  <div className="preview-content creative-template">
    <h1>{formData.fullName}</h1>
    {formData.heading && <div className="heading-text">{formData.heading}</div>}
    <div className="contact-line">
      {formData.location && <span>{formData.location}</span>}
      {formData.email && <span>{formData.email}</span>}
      {formData.phone && <span>{formData.phone}</span>}
    </div>
    {(formData.github || formData.linkedin) && (
      <div className="contact-line">
        {formData.github && <span>github.com/{formData.github}</span>}
        {formData.github && formData.linkedin && " • "}
        {formData.linkedin && <span>linkedin.com/in/{formData.linkedin}</span>}
      </div>
    )}

    {formData.about && (
      <>
        <div className="divider-line"></div>
        <div className="about-section">
          <p>{formData.about}</p>
        </div>
      </>
    )}

    {formData.education.length > 0 && formData.education[0].university && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">EDUCATION</div>
          {formData.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <span className="education-school">{edu.university}</span>
                <span className="education-date">{edu.duration}</span>
              </div>
              <div className="education-degree">{edu.degree}</div>
              {edu.gpa && <div className="education-details">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      </>
    )}

    {formData.projects.length > 0 && formData.projects[0].name && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">PROJECTS</div>
          {formData.projects.map((project, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <span className="experience-title">{project.name}</span>
              </div>
              <ul className="bullet-list">
                <li>{project.description}</li>
                {project.technologies && (
                  <li>Built using: {project.technologies}</li>
                )}
                {project.githubUrl && (
                  <li>Source code: {project.githubUrl}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </>
    )}

    {(formData.technologies.languages || formData.technologies.frameworks) && (
      <>
        <div className="divider-line"></div>
        <div className="content-section">
          <div className="section-header">TECHNICAL SKILLS</div>
          <ul className="skills-list">
            {formData.technologies.languages && (
              <li><strong>Languages:</strong> {formData.technologies.languages}</li>
            )}
            {formData.technologies.frameworks && (
              <li><strong>Frameworks & Tools:</strong> {formData.technologies.frameworks}</li>
            )}
          </ul>
        </div>
      </>
    )}
  </div>
);

const MinimalTemplate = ({ formData }) => (
  <div className="preview-content minimal-template">
    <h1>{formData.fullName}</h1>
    <div className="contact-line">
      {formData.location && formData.location}
      {formData.location && formData.email && " • "}
      {formData.email && formData.email}
      {formData.email && formData.phone && " • "}
      {formData.phone && formData.phone}
    </div>
    {(formData.github || formData.linkedin) && (
      <div className="contact-line">
        {formData.github && <span><i className="fab fa-github"></i> github.com/{formData.github}</span>}
        {formData.github && formData.linkedin && " • "}
        {formData.linkedin && <span><i className="fab fa-linkedin"></i> linkedin.com/in/{formData.linkedin}</span>}
      </div>
    )}

    {formData.about && (
      <div className="about-section">
        <p>{formData.about}</p>
      </div>
    )}

    {formData.summary && (
      <div className="content-section">
        <div className="section-header">SUMMARY</div>
        <p>{formData.summary}</p>
      </div>
    )}

    {formData.education.length > 0 && formData.education[0].university && (
      <div className="content-section">
        <div className="section-header">EDUCATION</div>
        {formData.education.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="education-header">
              <span className="education-school">{edu.university}</span>
              <span className="education-date">{edu.duration}</span>
            </div>
            <div className="education-degree">{edu.degree}</div>
            {edu.gpa && <div className="education-details">GPA: {edu.gpa}</div>}
          </div>
        ))}
      </div>
    )}

    {formData.projects.length > 0 && formData.projects[0].name && (
      <div className="content-section">
        <div className="section-header">PROJECTS</div>
        {formData.projects.map((project, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <span className="experience-title">{project.name}</span>
            </div>
            <ul className="bullet-list">
              <li>{project.description}</li>
              {project.technologies && (
                <li>Built using: {project.technologies}</li>
              )}
              {project.githubUrl && (
                <li>Source code: {project.githubUrl}</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    )}

    {(formData.technologies.languages || formData.technologies.frameworks) && (
      <div className="content-section">
        <div className="section-header">TECHNICAL SKILLS</div>
        <ul className="skills-list">
          {formData.technologies.languages && (
            <li><strong>Languages:</strong> {formData.technologies.languages}</li>
          )}
          {formData.technologies.frameworks && (
            <li><strong>Frameworks & Tools:</strong> {formData.technologies.frameworks}</li>
          )}
        </ul>
      </div>
    )}
  </div>
);

const TechnicalTemplate = ({ formData }) => (
  <div className="preview-content technical-template">
    <h1>{formData.fullName}</h1>
    <div className="contact-line">
      {formData.email && <span>{formData.email}</span>}
      {formData.phone && <span> • {formData.phone}</span>}
      {formData.location && <span> • {formData.location}</span>}
    </div>
    {formData.github && (
      <div className="contact-line">
        <span>github.com/{formData.github}</span>
      </div>
    )}
    {formData.about && (
      <div className="about-section">
        <p>{formData.about}</p>
      </div>
    )}

    {formData.summary && (
      <div className="content-section">
        <div className="section-header">SUMMARY</div>
        <p>{formData.summary}</p>
      </div>
    )}

    {formData.education.length > 0 && formData.education[0].university && (
      <div className="content-section">
        <div className="section-header">EDUCATION</div>
        {formData.education.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="education-header">
              <span className="education-school">{edu.university}</span>
              <span className="education-date">{edu.duration}</span>
            </div>
            <div className="education-degree">{edu.degree}</div>
            {edu.gpa && <div className="education-details">GPA: {edu.gpa}</div>}
          </div>
        ))}
      </div>
    )}

    {formData.projects.length > 0 && formData.projects[0].name && (
      <div className="content-section">
        <div className="section-header">PROJECTS</div>
        {formData.projects.map((project, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <span className="experience-title">{project.name}</span>
            </div>
            <ul className="bullet-list">
              <li>{project.description}</li>
              {project.technologies && (
                <li>Built using: {project.technologies}</li>
              )}
              {project.githubUrl && (
                <li>Source code: {project.githubUrl}</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    )}

    {(formData.technologies.languages || formData.technologies.frameworks) && (
      <div className="content-section">
        <div className="section-header">TECHNICAL SKILLS</div>
        <ul className="skills-list">
          {formData.technologies.languages && (
            <li><strong>Languages:</strong> {formData.technologies.languages}</li>
          )}
          {formData.technologies.frameworks && (
            <li><strong>Frameworks & Tools:</strong> {formData.technologies.frameworks}</li>
          )}
        </ul>
      </div>
    )}
  </div>
);

export default GenerateResume;