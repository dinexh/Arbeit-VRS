'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import './page.css';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Developer specific fields
    title: '',
    bio: '',
    yearsOfExperience: '',
    skills: [],
    githubProfile: '',
    linkedinProfile: '',
    portfolioWebsite: '',
    preferredWorkLocation: '',
    workType: 'Full Time', // Full Time, Contract, Freelance
    experienceLevel: 'Mid Level', // Junior, Mid Level, Senior
    primaryRole: 'Frontend Developer',
    // Initialize all array fields
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    // Initialize all string fields with empty strings
    phone: '',
    location: '',
    company: '',
    position: '',
    website: '',
    // Initialize all number fields with empty strings (will be converted to numbers on submit)
    yearsOfExperience: '',
    // Initialize all date fields with empty strings
    startDate: '',
    endDate: '',
    // Initialize all boolean fields with false
    isCurrentlyEmployed: false,
    isOpenToWork: false,
    isRemoteOnly: false
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [resumes, setResumes] = useState([]);

  // Predefined options for skills and technologies
  const commonSkills = {
    languages: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'Go', 'PHP', 'Swift', 'Kotlin'],
    frameworks: ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Express.js'],
    databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'DynamoDB'],
    tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'JIRA', 'Figma']
  };

  // Initialize userProfile with user email when available
  useEffect(() => {
    if (user?.email) {
      setUserProfile(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user?.email]);

  // Fetch profile data only when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.email) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // Ensure all fields have at least default values
          setUserProfile(prev => ({
            ...prev, // Keep default values
            ...profileData, // Override with server data
            email: user.email, // Always use email from auth context
            // Ensure arrays are initialized
            languages: profileData.languages || [],
            frameworks: profileData.frameworks || [],
            databases: profileData.databases || [],
            tools: profileData.tools || [],
            // Ensure strings are initialized
            fullName: profileData.fullName || '',
            phone: profileData.phone || '',
            title: profileData.title || '',
            bio: profileData.bio || '',
            githubProfile: profileData.githubProfile || '',
            linkedinProfile: profileData.linkedinProfile || '',
            portfolioWebsite: profileData.portfolioWebsite || '',
            preferredWorkLocation: profileData.preferredWorkLocation || '',
            // Ensure select fields have valid values
            workType: profileData.workType || 'Full Time',
            experienceLevel: profileData.experienceLevel || 'Mid Level',
            primaryRole: profileData.primaryRole || 'Frontend Developer',
            // Ensure number fields are initialized
            yearsOfExperience: profileData.yearsOfExperience || '',
            // Ensure boolean fields are initialized
            isCurrentlyEmployed: profileData.isCurrentlyEmployed || false,
            isOpenToWork: profileData.isOpenToWork || false,
            isRemoteOnly: profileData.isRemoteOnly || false
          }));
        }

        // Fetch applications
        const applicationsResponse = await fetch('/api/applications');
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = async (category) => {
    if (newSkill && !userProfile[category].includes(newSkill)) {
      const updatedSkills = [...userProfile[category], newSkill];
      handleArrayInputChange(category, updatedSkills);
      setNewSkill('');

      // Auto-save when skills are updated
      const { email, currentPassword, newPassword, confirmPassword, ...otherData } = userProfile;
      const profileData = {
        ...otherData,
        [category]: updatedSkills,
        languages: category === 'languages' ? updatedSkills : userProfile.languages || [],
        frameworks: category === 'frameworks' ? updatedSkills : userProfile.frameworks || [],
        databases: category === 'databases' ? updatedSkills : userProfile.databases || [],
        tools: category === 'tools' ? updatedSkills : userProfile.tools || []
      };

      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update skills');
        }
        toast.success('Skills updated successfully!');
      } catch (error) {
        console.error('Error updating skills:', error);
        toast.error('Failed to update skills');
      }
    }
  };

  const handleSkillRemove = async (category, skill) => {
    const updatedSkills = userProfile[category].filter(s => s !== skill);
    handleArrayInputChange(category, updatedSkills);

    // Auto-save when skills are removed
    const { email, currentPassword, newPassword, confirmPassword, ...otherData } = userProfile;
    const profileData = {
      ...otherData,
      [category]: updatedSkills,
      languages: category === 'languages' ? updatedSkills : userProfile.languages || [],
      frameworks: category === 'frameworks' ? updatedSkills : userProfile.frameworks || [],
      databases: category === 'databases' ? updatedSkills : userProfile.databases || [],
      tools: category === 'tools' ? updatedSkills : userProfile.tools || []
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update skills');
      }
      toast.success('Skills updated successfully!');
    } catch (error) {
      console.error('Error updating skills:', error);
      toast.error('Failed to update skills');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (userProfile.newPassword !== userProfile.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!userProfile.currentPassword || !userProfile.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    const passwordPromise = fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: userProfile.currentPassword,
        newPassword: userProfile.newPassword
      })
    });

    try {
      toast.promise(
        passwordPromise,
        {
          loading: 'Updating password...',
          success: 'Password updated successfully!',
          error: (err) => {
            const errorMessage = err?.message || 'Failed to update password';
            return errorMessage;
          },
        },
        {
          style: {
            minWidth: '250px',
          },
          success: {
            duration: 5000,
            icon: '✅',
          },
          error: {
            duration: 5000,
            icon: '❌',
          },
        }
      );

      const response = await passwordPromise;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      // Clear password fields after successful update
      setUserProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to update your profile');
      return;
    }
    
    // Remove sensitive fields but keep skills arrays
    const { email, currentPassword, newPassword, confirmPassword, languages, frameworks, databases, tools, ...otherData } = userProfile;

    // Prepare the complete profile data including skills
    const profileData = {
      ...otherData,
      languages: languages || [],
      frameworks: frameworks || [],
      databases: databases || [],
      tools: tools || []
    };

    try {
      const updatePromise = fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      await toast.promise(
        updatePromise,
        {
          loading: 'Updating profile...',
          success: 'Profile updated successfully!',
          error: (err) => err?.message || 'Failed to update profile',
        },
        {
          style: {
            minWidth: '250px',
          },
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 5000,
            icon: '❌',
          },
        }
      );

      const response = await updatePromise;
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/profile/resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload resume');
      }

      const data = await response.json();
      toast.success('Resume uploaded successfully!');
      
      // Refresh resumes list
      const resumesResponse = await fetch('/api/profile/resume');
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        setResumes(resumesData);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    }
  };

  const handleResumeDelete = async (resumeId) => {
    try {
      const response = await fetch(`/api/profile/resume/${resumeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete resume');
      }

      toast.success('Resume deleted successfully!');
      
      // Update resumes list
      setResumes(prev => prev.filter(resume => resume._id !== resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  // Fetch resumes when component mounts
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch('/api/profile/resume');
        if (response.ok) {
          const data = await response.json();
          setResumes(data);
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };

    if (user?.email) {
      fetchResumes();
    }
  }, [user?.email]);

  if (isLoading) {
    return <div className="loading-spinner" />;
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="logo">Arbeit</div>
          <div className="auth-message">
            <h1>Welcome to Your Professional Profile</h1>
            <p>Please log in to manage your profile, applications, and career preferences.</p>
            <div className="auth-features">
              <div className="feature">
                <i className="fas fa-user-circle"></i>
                <h3>Complete Profile</h3>
                <p>Showcase your skills and experience</p>
              </div>
              <div className="feature">
                <i className="fas fa-file-alt"></i>
                <h3>Application Tracking</h3>
                <p>Monitor all your job applications</p>
              </div>
              <div className="feature">
                <i className="fas fa-cogs"></i>
                <h3>Skills Management</h3>
                <p>Highlight your technical expertise</p>
              </div>
            </div>
            <button onClick={() => router.push('/auth')} className="login-btn">
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard">
        <aside className="sidebar">
          <div className="logo">Arbeit</div>
          <nav>
            <ul>
              <li 
                className={activeSection === 'profile' ? 'active' : ''} 
                onClick={() => setActiveSection('profile')}
              >
                Profile
              </li>
              <li 
                className={activeSection === 'skills' ? 'active' : ''} 
                onClick={() => setActiveSection('skills')}
              >
                Skills & Technologies
              </li>
              <li 
                className={activeSection === 'applications' ? 'active' : ''} 
                onClick={() => setActiveSection('applications')}
              >
                Applications
              </li>
              <li 
                className={activeSection === 'resumes' ? 'active' : ''} 
                onClick={() => setActiveSection('resumes')}
              >
                Resumes
              </li>
              <li 
                className={activeSection === 'password' ? 'active' : ''} 
                onClick={() => setActiveSection('password')}
              >
                Change Password
              </li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <div className="container">
            <header className="header">
              <h1>Profile Settings</h1>
              <div className="user-email">{userProfile.email}</div>
            </header>

            {activeSection === 'profile' && (
              <section className="profile-section">
                <h2>Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={userProfile.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={userProfile.email}
                        readOnly
                        className="input-readonly"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={userProfile.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Professional Title</label>
                      <input
                        type="text"
                        name="title"
                        value={userProfile.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Bio</label>
                      <textarea
                        name="bio"
                        value={userProfile.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows="4"
                      />
                    </div>
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={userProfile.yearsOfExperience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience Level</label>
                      <select
                        name="experienceLevel"
                        value={userProfile.experienceLevel}
                        onChange={handleInputChange}
                      >
                        <option value="Junior">Junior</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Principal">Principal</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Primary Role</label>
                      <select
                        name="primaryRole"
                        value={userProfile.primaryRole}
                        onChange={handleInputChange}
                      >
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Mobile Developer">Mobile Developer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Preferred Work Type</label>
                      <select
                        name="workType"
                        value={userProfile.workType}
                        onChange={handleInputChange}
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <h3>Social Profiles</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>GitHub Profile</label>
                      <input
                        type="url"
                        name="githubProfile"
                        value={userProfile.githubProfile}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedinProfile"
                        value={userProfile.linkedinProfile}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="form-group">
                      <label>Portfolio Website</label>
                      <input
                        type="url"
                        name="portfolioWebsite"
                        value={userProfile.portfolioWebsite}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                  <button type="submit" className="save-btn">Save Changes</button>
                </form>
              </section>
            )}

            {activeSection === 'skills' && (
              <section className="skills-section">
                <h2>Skills & Technologies</h2>
                
                {Object.entries(commonSkills).map(([category, options]) => (
                  <div key={category} className="skill-category">
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div className="skill-input">
                      <select
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                      >
                        <option value="">Select {category}</option>
                        {options.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => handleSkillAdd(category)}
                        className="add-skill-btn"
                      >
                        Add
                      </button>
                    </div>
                    <div className="skills-list">
                      {userProfile[category].map(skill => (
                        <span key={skill} className="skill-tag">
                          {skill}
                          <button 
                            onClick={() => handleSkillRemove(category, skill)}
                            className="remove-skill"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeSection === 'applications' && (
              <section className="applications-section">
                <h2>My Applications</h2>
                {loading ? (
                  <div className="loading-spinner" />
                ) : applications.length > 0 ? (
                  <div className="applications-grid">
                    {applications.map((application) => (
                      <div key={application._id} className="application-card">
                        <div className="application-header">
                          <h4>Job ID: #{application.jobId}</h4>
                          <span className={`status ${application.status.toLowerCase()}`}>
                            {application.status}
                          </span>
                        </div>
                        <div className="application-details">
                          <p><strong>Applied:</strong> {new Date(application.appliedDate).toLocaleDateString()}</p>
                          {application.resumeId && (
                            <a 
                              href={`/api/applications/${application._id}/resume`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-resume-btn"
                            >
                              View Resume
                            </a>
                          )}
                        </div>
                  </div>
                    ))}
                  </div>
                ) : (
                  <p>No applications found.</p>
                )}
              </section>
            )}

            {activeSection === 'resumes' && (
              <section className="resumes-section">
                <h2>My Resumes</h2>
                <div className="resume-upload">
                  <input 
                    type="file" 
                    id="resume" 
                    accept=".pdf" 
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <label htmlFor="resume">
                    <div className="upload-area">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload or drag and drop</p>
                      <span>PDF files only</span>
                    </div>
                  </label>
                </div>
                {resumes.length > 0 ? (
                  <div className="resumes-list">
                    {resumes.map((resume) => (
                      <div key={resume._id} className="resume-item">
                        <span>{resume.filename}</span>
                        <div className="resume-actions">
                          <a 
                            href={`/api/profile/resume/${resume._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-btn"
                          >
                            View
                          </a>
                          <button 
                            className="delete-btn"
                            onClick={() => handleResumeDelete(resume._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-resumes">No resumes uploaded yet.</p>
                )}
              </section>
            )}

            {activeSection === 'password' && (
              <section className="password-section">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={userProfile.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={userProfile.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={userProfile.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button type="submit" className="save-btn">Update Password</button>
                </form>
            </section>
            )}
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px'
          },
        }}
      />
    </>
  );
};

export default ProfilePage;