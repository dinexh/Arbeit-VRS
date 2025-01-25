'use client';

import { useState, useEffect } from 'react';
import LogoutButton from '@/components/LogoutButton';
import './page.css';
import { Toaster, toast } from 'react-hot-toast';

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyEmail, setCompanyEmail] = useState('');

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    logo: '',
    jobType: 'Full Time',
    location: '',
    salaryMin: '',
    salaryMax: '',
    hideSalary: false,
    description: '',
    requirements: [],
    benefits: [],
    screeningQuestions: [],
    hiringProcess: [],
    department: '',
    qualification: '',
    additionalInfo: '',
  });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const [applicants] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      jobTitle: 'Senior Software Engineer',
      email: 'sarah.j@example.com',
      experience: '5 years',
      education: 'MS in Computer Science',
      appliedDate: '2024-03-18',
      status: 'Under Review',
      skills: ['React', 'Node.js', 'Python'],
      matchScore: 85,
    },
    {
      id: 2,
      name: 'Michael Chen',
      jobTitle: 'Product Manager',
      email: 'michael.c@example.com',
      experience: '7 years',
      education: 'MBA',
      appliedDate: '2024-03-17',
      status: 'Shortlisted',
      skills: ['Product Strategy', 'Agile', 'Data Analysis'],
      matchScore: 92,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      jobTitle: 'Senior Software Engineer',
      email: 'emily.r@example.com',
      experience: '4 years',
      education: 'BS in Computer Engineering',
      appliedDate: '2024-03-16',
      status: 'Under Review',
      skills: ['Java', 'Spring Boot', 'AWS'],
      matchScore: 78,
    },
  ]);

  const hiringProcessOptions = [
    'Face to Face',
    'Written-test',
    'Telephonic',
    'Group Discussion',
    'Virtual Interview',
    'Walk In'
  ];

  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchCompanyInfo();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/jobs');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = '/Bauth';
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
      toast.error(`Failed to fetch jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = '/Bauth';
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error(`Failed to fetch applications: ${err.message}`);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/business/profile');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = '/Bauth';
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch company info');
      }
      
      const data = await response.json();
      setCompanyEmail(data.companyEmail);
    } catch (err) {
      console.error('Error fetching company info:', err);
      toast.error(`Failed to fetch company info: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'hideSalary') {
        setNewJob(prev => ({ ...prev, [name]: checked }));
      } else if (name.startsWith('hiringProcess-')) {
        const process = name.replace('hiringProcess-', '');
        setNewJob(prev => ({
          ...prev,
          hiringProcess: checked 
            ? [...prev.hiringProcess, process]
            : prev.hiringProcess.filter(p => p !== process)
        }));
      }
    } else {
      setNewJob(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/business/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const createdJob = await response.json();
      setJobs(prev => [...prev, createdJob]);
      setShowModal(false);
      setNewJob({
        title: '',
        company: '',
        jobType: 'Full Time',
        location: '',
        salaryMin: '',
        salaryMax: '',
        hideSalary: false,
        description: '',
        requirements: [],
        benefits: [],
        screeningQuestions: [],
        hiringProcess: [],
        department: '',
        qualification: '',
        additionalInfo: '',
      });
      toast.success('Job posted successfully');
    } catch (err) {
      console.error('Error creating job:', err);
      toast.error('Failed to create job. Please try again.');
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await fetch('/api/business/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs(prev => prev.filter(job => job._id !== _id));
      toast.success('Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error('Failed to delete job. Please try again.');
    }
  };

  const handleStatusChange = async (_id) => {
    try {
      const job = jobs.find(j => j._id === _id);
      if (!job) return;

      const response = await fetch('/api/business/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          status: job.status === 'Active' ? 'Closed' : 'Active'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      const updatedJob = await response.json();
      setJobs(prev => prev.map(j => j._id === _id ? { ...j, ...updatedJob } : j));
    } catch (err) {
      console.error('Error updating job status:', err);
      toast.error('Failed to update job status. Please try again.');
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const filteredJobs = jobs
    .filter(job => {
      // Check if job has all required fields
      if (!job || !job.title || !job.department || !job.location || !job.status) {
        return false;
      }

      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        job.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDepartment = 
        departmentFilter === 'all' || 
        job.department.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDepartment;
    });

  const analyticsData = {
    applicationsOverTime: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [45, 52, 68, 74, 82, 95],
    },
    hiringProgress: {
      total: 95,
      reviewed: 68,
      shortlisted: 24,
      interviewed: 12,
      hired: 8,
    },
    topJobCategories: [
      { name: 'Engineering', count: 45 },
      { name: 'Product', count: 28 },
      { name: 'Marketing', count: 15 },
      { name: 'Sales', count: 12 },
    ],
    applicationSources: [
      { name: 'Company Website', count: 42 },
      { name: 'LinkedIn', count: 35 },
      { name: 'Indeed', count: 28 },
      { name: 'Referrals', count: 15 },
    ],
  };

  const handleUpdateStatus = async (_id, status) => {
    try {
      // First update the application status
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Get the job title from the jobs array using the jobId from selectedApplication
      const job = jobs.find(j => j.jobId === selectedApplication.jobId);
      const jobTitle = job ? job.title : selectedApplication.jobTitle || 'Unknown Position';

      // Send email notification
      const emailResponse = await fetch('/api/applications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: _id,
          status,
          applicantName: selectedApplication.fullName,
          applicantEmail: selectedApplication.email,
          jobTitle
        })
      });

      const emailData = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error('Failed to send email notification:', emailData.error);
        toast.error(`Failed to send email notification: ${emailData.error}`);
      }

      // Update the applications list
      setApplications(prev => 
        prev.map(app => 
          app._id === _id ? { ...app, status } : app
        )
      );

      // Update the selected application if it's open in modal
      if (selectedApplication && selectedApplication._id === _id) {
        setSelectedApplication(prev => ({ ...prev, status }));
      }

      toast.success(`Application status updated to ${status} and notification email sent`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(`Failed to update application status: ${error.message}`);
    }
  };

  return (
    <div className="business-page">
      <header className="business-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Business Dashboard</h1>
          </div>
          <div className="header-right">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="business-main">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Business Dashboard</h1>
            <button className="primary-btn" onClick={() => setShowModal(true)}>+ Post New Job</button>
          </header>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Post Your Job</h2>
                  <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="job-form">
                  <div className="form-section">
                    <h3 className="form-section-title">📋 Basic Information</h3>
                    <div className="form-group">
                      <label htmlFor="title" className="required-field">Job Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="e.g., Senior Frontend Developer"
                        value={newJob.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="company" className="required-field">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        placeholder="e.g., Tech Corp"
                        value={newJob.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* <div className="form-group">
                      <label htmlFor="logo">Company Logo URL</label>
                      <input
                        type="text"
                        id="logo"
                        name="logo"
                        placeholder="e.g., /company-logo.svg"
                        value={newJob.logo}
                        onChange={handleInputChange}
                      />
                    </div> */}
                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor="jobType" className="required-field">Job Type</label>
                        <select
                          id="jobType"
                          name="jobType"
                          value={newJob.jobType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div className="form-group half">
                        <label htmlFor="department" className="required-field">Department</label>
                        <select
                          id="department"
                          name="department"
                          value={newJob.department}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Product">Product</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">🎯 Requirements & Location</h3>
                    <div className="form-group">
                      <label htmlFor="qualification" className="required-field">Qualification / Eligibility</label>
                      <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={newJob.qualification}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Bachelor's in Computer Science, MBA, or relevant experience"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location" className="required-field">Job Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newJob.location}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., New York, Remote, Hybrid"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">💰 Compensation</h3>
                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor="salaryMin" className="required-field">Monthly Salary (Min)</label>
                        <div className="currency-input">
                          <input
                            type="number"
                            id="salaryMin"
                            name="salaryMin"
                            value={newJob.salaryMin}
                            onChange={handleInputChange}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label htmlFor="salaryMax" className="required-field">Monthly Salary (Max)</label>
                        <div className="currency-input">
                          <input
                            type="number"
                            id="salaryMax"
                            name="salaryMax"
                            value={newJob.salaryMax}
                            onChange={handleInputChange}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="hideSalary"
                        name="hideSalary"
                        checked={newJob.hideSalary}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="hideSalary">Hide salary from applicants</label>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">🤝 Hiring Process</h3>
                    <div className="form-group">
                      <label>Selection Process</label>
                      <div className="checkbox-group">
                        {hiringProcessOptions.map(process => (
                          <div key={process} className="form-group checkbox">
                            <input
                              type="checkbox"
                              id={`hiringProcess-${process}`}
                              name={`hiringProcess-${process}`}
                              checked={newJob.hiringProcess.includes(process)}
                              onChange={handleInputChange}
                            />
                            <label htmlFor={`hiringProcess-${process}`}>{process}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">📝 Job Details</h3>
                    <div className="form-group">
                      <label htmlFor="description" className="required-field">Job Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={newJob.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        placeholder="Describe the role, responsibilities, and expectations..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="requirements" className="required-field">Requirements</label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={Array.isArray(newJob.requirements) ? newJob.requirements.join('\n') : newJob.requirements}
                        onChange={(e) => handleInputChange({
                          target: {
                            name: 'requirements',
                            value: e.target.value.split('\n').filter(req => req.trim())
                          }
                        })}
                        rows="4"
                        placeholder="Enter each requirement on a new line..."
                        required
                      />
                      <span className="helper-text">Enter each requirement on a new line</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="benefits" className="required-field">Benefits</label>
                      <textarea
                        id="benefits"
                        name="benefits"
                        value={Array.isArray(newJob.benefits) ? newJob.benefits.join('\n') : newJob.benefits}
                        onChange={(e) => handleInputChange({
                          target: {
                            name: 'benefits',
                            value: e.target.value.split('\n').filter(benefit => benefit.trim())
                          }
                        })}
                        rows="4"
                        placeholder="Enter each benefit on a new line..."
                        required
                      />
                      <span className="helper-text">Enter each benefit on a new line</span>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">❓ Screening Questions</h3>
                    <div className="screening-questions">
                      {newJob.screeningQuestions.map((question, index) => (
                        <div key={index} className="question-item">
                          <div className="form-row">
                            <div className="form-group">
                              <input
                                type="text"
                                placeholder="Enter question"
                                value={question.question}
                                onChange={(e) => {
                                  const updatedQuestions = [...newJob.screeningQuestions];
                                  updatedQuestions[index].question = e.target.value;
                                  handleInputChange({
                                    target: {
                                      name: 'screeningQuestions',
                                      value: updatedQuestions
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const updatedQuestions = [...newJob.screeningQuestions];
                                  updatedQuestions[index].type = e.target.value;
                                  handleInputChange({
                                    target: {
                                      name: 'screeningQuestions',
                                      value: updatedQuestions
                                    }
                                  });
                                }}
                              >
                                <option value="text">Text</option>
                                <option value="boolean">Yes/No</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              className="remove-question"
                              onClick={() => {
                                const updatedQuestions = newJob.screeningQuestions.filter((_, i) => i !== index);
                                handleInputChange({
                                  target: {
                                    name: 'screeningQuestions',
                                    value: updatedQuestions
                                  }
                                });
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-question"
                        onClick={() => {
                          const newQuestion = {
                            id: newJob.screeningQuestions.length + 1,
                            question: '',
                            type: 'text'
                          };
                          handleInputChange({
                            target: {
                              name: 'screeningQuestions',
                              value: [...newJob.screeningQuestions, newQuestion]
                            }
                          });
                        }}
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">📝 Additional Information</h3>
                    <div className="form-group">
                      <label htmlFor="additionalInfo">Additional Information</label>
                      <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={newJob.additionalInfo}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Any additional details about the position, perks, or company culture..."
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="primary-btn">Post Job</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDetailsModal && selectedJob && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Job Details</h2>
                  <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
                </div>
                <div className="job-details">
                  <div className="form-section">
                    <h3 className="form-section-title">📋 Basic Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Job ID</label>
                        <p>#{selectedJob.jobId}</p>
                      </div>
                      <div className="detail-item">
                        <label>Job Title</label>
                        <p>{selectedJob.title}</p>
                      </div>
                      <div className="detail-item">
                        <label>Company</label>
                        <p>{selectedJob.company}</p>
                      </div>
                      <div className="detail-item">
                        <label>Department</label>
                        <p>{selectedJob.department}</p>
                      </div>
                      <div className="detail-item">
                        <label>Job Type</label>
                        <p>{selectedJob.jobType}</p>
                      </div>
                      <div className="detail-item">
                        <label>Location</label>
                        <p>{selectedJob.location}</p>
                      </div>
                      <div className="detail-item">
                        <label>Status</label>
                        <p><span className={`status ${selectedJob.status.toLowerCase()}`}>
                          {selectedJob.status}
                        </span></p>
                      </div>
                      <div className="detail-item">
                        <label>Posted Date</label>
                        <p>{new Date(selectedJob.postedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">💰 Compensation</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Salary Range</label>
                        <p>{selectedJob.hideSalary ? 'Hidden' : `$${selectedJob.salaryMin} - $${selectedJob.salaryMax}`}</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">📝 Job Description</h3>
                    <div className="detail-item">
                      <p>{selectedJob.description}</p>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">✅ Requirements</h3>
                    <ul className="detail-list">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">🎁 Benefits</h3>
                    <ul className="detail-list">
                      {selectedJob.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="form-section">
                    <h3 className="form-section-title">🤝 Hiring Process</h3>
                    <div className="hiring-steps">
                      {selectedJob.hiringProcess.map((step, index) => (
                        <div key={index} className="hiring-step">
                          <span className="step-number">{index + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedJob.screeningQuestions.length > 0 && (
                    <div className="form-section">
                      <h3 className="form-section-title">❓ Screening Questions</h3>
                      <div className="screening-questions-list">
                        {selectedJob.screeningQuestions.map((q, index) => (
                          <div key={index} className="question-item">
                            <p className="question-text">{q.question}</p>
                            <span className="question-type">{q.type === 'boolean' ? 'Yes/No' : 'Text'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.additionalInfo && (
                    <div className="form-section">
                      <h3 className="form-section-title">ℹ️ Additional Information</h3>
                      <div className="detail-item">
                        <p>{selectedJob.additionalInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <nav className="dashboard-tabs">
            <button 
              className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Jobs
            </button>
            <button 
              className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
              onClick={() => setActiveTab('applicants')}
            >
              Applicants
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </nav>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Active Jobs</h3>
              <p className="stat-number">{jobs.filter(job => job.status === 'Active').length}</p>
              <p className="stat-trend positive">↑ 20% from last month</p>
            </div>
            <div className="stat-card">
              <h3>Total Applicants</h3>
              <p className="stat-number">{jobs.reduce((sum, job) => sum + job.applicants, 0)}</p>
              <p className="stat-trend positive">↑ 15% from last month</p>
            </div>
            <div className="stat-card">
              <h3>Hired</h3>
              <p className="stat-number">0</p>
              <p className="stat-trend neutral">= Same as last month</p>
            </div>
          </div>

          <div className="dashboard-content">
            {activeTab === 'jobs' && (
              <div className="jobs-table">
                <div className="table-header">
                  <div className="table-search">
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="table-filters">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                    <select 
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      <option value="engineering">Engineering</option>
                      <option value="product">Product</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                    </select>
                  </div>
                </div>
                {jobs.length === 0 ? (
                  <div className="no-jobs-message">
                    <p>No jobs found. Click the "Post New Job" button to create your first job posting.</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Job ID</th>
                        <th>Job Title</th>
                        <th>Department</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Applicants</th>
                        <th>Posted Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job._id}>
                          <td>#{job.jobId}</td>
                          <td>{job.title}</td>
                          <td>{job.department}</td>
                          <td>{job.location}</td>
                          <td>
                            <span className={`status ${job.status.toLowerCase()}`}>
                              {job.status}
                            </span>
                          </td>
                          <td>{job.applicants}</td>
                          <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="icon-btn" 
                                title="View Details"
                                onClick={() => handleViewDetails(job)}
                              >
                                👁️
                              </button>
                              <button 
                                className="icon-btn" 
                                title={job.status === 'Active' ? 'Close Job' : 'Reopen Job'}
                                onClick={() => handleStatusChange(job._id)}
                              >
                                {job.status === 'Active' ? '🔒' : '🔓'}
                              </button>
                              <button 
                                className="icon-btn" 
                                title="Delete Job"
                                onClick={() => handleDelete(job._id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'applicants' && (
              <div className="applicants-grid">
                {applications.map((application) => (
                  <div key={application._id} className="applicant-card">
                    <div className="applicant-header">
                      <div className="applicant-avatar">
                        {application.fullName.charAt(0)}
                      </div>
                      <div className="applicant-info">
                        <h4>{application.fullName}</h4>
                        <p>Job ID: #{application.jobId}</p>
                      </div>
                    </div>
                    <div className="applicant-details">
                      <div className="detail-row">
                        <span className="detail-label">User ID</span>
                        <span className="detail-value">#{application.userId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{application.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{application.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Applied Date</span>
                        <span className="detail-value">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className="detail-value">{application.status}</span>
                      </div>
                    </div>
                    <div className="applicant-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewApplication(application)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Applications Over Time</h3>
                  <div className="chart-container">
                    <div className="chart-placeholder" style={{ 
                      height: '100%', 
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6',
                      fontWeight: 500
                    }}>
                      Applications Chart
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Hiring Progress</h3>
                  <div className="chart-container">
                    <div className="chart-placeholder" style={{ 
                      height: '100%', 
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6',
                      fontWeight: 500
                    }}>
                      Hiring Progress Chart
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Top Job Categories</h3>
                  <div className="chart-container">
                    <div className="chart-placeholder" style={{ 
                      height: '100%', 
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6',
                      fontWeight: 500
                    }}>
                      Categories Chart
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Application Sources</h3>
                  <div className="chart-container">
                    <div className="chart-placeholder" style={{ 
                      height: '100%', 
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6',
                      fontWeight: 500
                    }}>
                      Sources Chart
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showApplicationModal && selectedApplication && (
            <div className="modal-overlay">
              <div className="modal application-modal">
                <div className="modal-header">
                  <h2>Application Details</h2>
                  <button 
                    className="close-btn" 
                    onClick={() => setShowApplicationModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-content">
                  <div className="application-details">
                    <div className="form-section">
                      <h3 className="form-section-title">👤 Applicant Information</h3>
                      <div className="details-grid">
                        <div className="detail-item">
                          <label>User ID</label>
                          <p>#{selectedApplication.userId}</p>
                        </div>
                        <div className="detail-item">
                          <label>Full Name</label>
                          <p>{selectedApplication.fullName}</p>
                        </div>
                        <div className="detail-item">
                          <label>Email</label>
                          <p>{selectedApplication.email}</p>
                        </div>
                        <div className="detail-item">
                          <label>Phone</label>
                          <p>{selectedApplication.phone}</p>
                        </div>
                        <div className="detail-item">
                          <label>Applied For</label>
                          <p>Job #{selectedApplication.jobId}</p>
                        </div>
                        <div className="detail-item">
                          <label>Status</label>
                          <p>
                            <span className={`status ${selectedApplication.status.toLowerCase()}`}>
                              {selectedApplication.status}
                            </span>
                          </p>
                        </div>
                        <div className="detail-item">
                          <label>Applied Date</label>
                          <p>{new Date(selectedApplication.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {selectedApplication.coverLetter && (
                      <div className="form-section">
                        <h3 className="form-section-title">📝 Cover Letter</h3>
                        <div className="detail-item">
                          <p>{selectedApplication.coverLetter}</p>
                        </div>
                      </div>
                    )}

                    <div className="form-section">
                      <h3 className="form-section-title">✨ Actions</h3>
                      <div className="action-buttons">
                        <button 
                          className="action-btn approve"
                          onClick={() => handleUpdateStatus(selectedApplication._id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => handleUpdateStatus(selectedApplication._id, 'Rejected')}
                        >
                          Reject
                        </button>
                        <button 
                          className="action-btn schedule"
                          onClick={() => handleUpdateStatus(selectedApplication._id, 'Interview Scheduled')}
                        >
                          Schedule Interview
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedApplication.resumeId && (
                    <div className="resume-viewer">
                      <div className="resume-header">
                        <h3>📄 Resume</h3>
                      </div>
                      {resumeLoading && (
                        <div className="resume-loading">
                          <div className="loading-spinner"></div>
                          <p>Loading resume...</p>
                        </div>
                      )}
                      <iframe
                        src={`/api/applications/${selectedApplication._id}/resume`}
                        title="Resume Viewer"
                        className="resume-frame"
                        onLoad={() => setResumeLoading(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--background)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
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
    </div>
  );
}
