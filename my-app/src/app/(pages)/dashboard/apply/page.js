'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import './apply.css';

function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchUserData();
    }
  }, [jobId]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Fetch user's resumes
      const resumesResponse = await fetch('/api/profile/resume');
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        setResumes(resumesData);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: jobId.toString() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job details');
      }
      setJob(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      formData.append('jobId', jobId);

      // If a saved resume is selected, add it to the form data
      if (selectedResume) {
        formData.append('resumeId', selectedResume);
      } else {
        // Check if a new resume file was uploaded
        const resumeFile = e.target.resume?.files[0];
        if (!resumeFile) {
          toast.error('Please select a resume or upload a new one');
          return;
        }
        formData.append('resume', resumeFile);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      router.push('/dashboard?success=true');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!job) {
    return <div className="not-found">Job not found</div>;
  }

  return (
    <div className="apply-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
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
      <div className="apply-header">
        <div className="job-overview">
          <div className="company-logo">
            {job.logo ? (
              <img src={job.logo} alt={`${job.company || 'Company'} logo`} />
            ) : (
              <span>{(job.company || 'C')[0]}</span>
            )}
          </div>
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="company-name">{job.company || 'Company Name Not Available'}</div>
            <div className="job-id">#{job.jobId}</div>
          </div>
        </div>
        <div className="job-meta">
          <div className="meta-item">
            <span className="icon">📍</span>
            <span>{job.location}</span>
          </div>
          <div className="meta-item">
            <span className="icon">💼</span>
            <span>{job.jobType}</span>
          </div>
          <div className="meta-item">
            <span className="icon">🏢</span>
            <span>{job.department}</span>
          </div>
          {!job.hideSalary && (
            <div className="meta-item">
              <span className="icon">💰</span>
              <span>${job.salaryMin} - ${job.salaryMax}</span>
            </div>
          )}
        </div>
      </div>

      <div className="apply-content">
        <div className="job-details">
          <section className="detail-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </section>

          <section className="detail-section">
            <h2>Requirements</h2>
            <ul className="requirements-list">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </section>

          {job.benefits && (
            <section className="detail-section">
              <h2>Benefits</h2>
              <ul className="benefits-list">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="apply-form-section">
          <div className="apply-card">
            <h2>Apply for this position</h2>
            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  required 
                  defaultValue={userProfile?.fullName || ''}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  defaultValue={userProfile?.email || ''}
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  required 
                  defaultValue={userProfile?.phone || ''}
                />
              </div>
              
              <div className="form-group">
                <label>Resume</label>
                <div className="resume-options">
                  {resumes.length > 0 && (
                    <div className="saved-resume-select">
                      <label htmlFor="resumeSelect">Select from saved resumes:</label>
                      <select
                        id="resumeSelect"
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        className="resume-select"
                      >
                        <option value="">Choose a resume</option>
                        {resumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.originalName || resume.filename}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="resume-upload">
                    <label htmlFor="resume">
                      {selectedResume ? 'Or upload a different resume:' : 'Upload your resume:'}
                    </label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setSelectedResume(''); // Clear selected resume if uploading new one
                        }
                      }}
                    />
                    <small>PDF files only</small>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows="4"
                  placeholder="Tell us why you're interested in this position..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <ApplyForm />
    </Suspense>
  );
} 