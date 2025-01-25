'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const formData = new FormData(e.target);
    formData.append('jobId', jobId);

    // If a saved resume is selected, use its ID
    if (selectedResume) {
      formData.append('resumeId', selectedResume);
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      alert(`Application submitted successfully! Your User ID is: ${data.userId}`);
      router.push('/dashboard?success=true');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
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
                <label htmlFor="resumeSelect">Select Resume</label>
                <select 
                  id="resumeSelect" 
                  name="resumeSelect"
                  value={selectedResume || ''}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  <option value="">Upload New Resume</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.metadata.originalName}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedResume && (
                <div className="form-group">
                  <label htmlFor="resume">Upload Resume</label>
                  <input 
                    type="file" 
                    id="resume" 
                    name="resume" 
                    accept=".pdf,.doc,.docx" 
                    required={!selectedResume}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                <textarea id="coverLetter" name="coverLetter" rows="4"></textarea>
              </div>
              
              <button type="submit" className="submit-button">Submit Application</button>
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