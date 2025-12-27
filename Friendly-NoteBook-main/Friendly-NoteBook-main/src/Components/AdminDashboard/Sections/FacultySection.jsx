import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const FacultySection = ({ facultyList, handleCreateFaculty, editFaculty, deleteFaculty }) => {
  const [formData, setFormData] = useState({
    name: '',
    facultyId: '',
    email: '',
    password: 'default@123',
    department: 'CSE',
    designation: 'Professor',
  });
  const [assignments, setAssignments] = useState([{ year: '', subject: '', sections: [] }]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ year: '', subject: '', sections: [] });
  
  const availableSections = ['A', 'B', 'C', 'D', 'E'];
  const availableYears = ['1', '2', '3', '4'];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const facultyData = {
      ...formData,
      assignments: assignments.filter(a => a.year && a.subject && a.sections.length > 0)
    };
    
    handleCreateFaculty(e, facultyData);
    
    // Reset form
    setFormData({
      name: '',
      facultyId: '',
      email: '',
      password: 'default@123',
      department: 'CSE',
      designation: 'Professor',
    });
    setAssignments([{ year: '', subject: '', sections: [] }]);
  };
  
  const handleAddAssignment = () => {
    if (newAssignment.year && newAssignment.subject && newAssignment.sections.length > 0) {
      setAssignments([...assignments, newAssignment]);
      setNewAssignment({ year: '', subject: '', sections: [] });
      setShowAssignmentForm(false);
    }
  };
  
  const handleRemoveAssignment = (index) => {
    const updatedAssignments = [...assignments];
    updatedAssignments.splice(index, 1);
    setAssignments(updatedAssignments);
    
    // Update the form data
    const form = document.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      const updatedFormData = new FormData();
      
      // Copy all form fields except the ones being removed
      for (let [key, value] of formData.entries()) {
        const match = key.match(/^assignments\[(\d+)\]/);
        if (match) {
          const assignmentIndex = parseInt(match[1]);
          if (assignmentIndex !== index) {
            // Adjust the index if it's after the removed item
            const newIndex = assignmentIndex > index ? assignmentIndex - 1 : assignmentIndex;
            const newKey = key.replace(
              `assignments[${assignmentIndex}]`, 
              `assignments[${newIndex}]`
            );
            updatedFormData.append(newKey, value);
          }
        } else if (!key.startsWith('assignments[')) {
          updatedFormData.append(key, value);
        }
      }
      
      // Update the form with the new data
      form.reset();
      for (let [key, value] of updatedFormData.entries()) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = true;
          } else {
            input.value = value;
          }
        }
      }
    }
  };
  
  const handleSectionToggle = (section) => {
    const currentSections = [...newAssignment.sections];
    const sectionIndex = currentSections.indexOf(section);
    
    if (sectionIndex === -1) {
      currentSections.push(section);
    } else {
      currentSections.splice(sectionIndex, 1);
    }
    
    setNewAssignment({ ...newAssignment, sections: currentSections });
  };
  // A simple alert for viewing faculty details.
  const viewFaculty = (faculty) => {
    alert(JSON.stringify(faculty, null, 2));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', margin: 'auto' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box component="span" sx={{ mr: 1 }}>👨‍🏫</Box>
        Faculty Management
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        {/* Faculty Creation Form */}
        <Typography variant="h6" component="h3" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
          Create New Faculty Account
        </Typography>
        <form onSubmit={handleSubmit} className="form-grid" style={{ width: '100%', marginBottom: '2rem' }}>
          <div className="form-section">
            <h4 className="form-title">
              <span className="section-number">B2.1</span>
              Personal Information
            </h4>
            <div className="form-group" data-section="1">
              <label htmlFor="name">Full Name</label>
              <input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name" 
                required 
              />
            </div>
            <div className="form-group" data-section="2">
              <label htmlFor="facultyId">Faculty ID (FID)</label>
              <input 
                id="facultyId" 
                name="facultyId" 
                value={formData.facultyId}
                onChange={handleInputChange}
                placeholder="Enter faculty ID" 
                required 
              />
            </div>
            <div className="form-group" data-section="3">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address" 
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-title">
              <span className="section-number">B2.2</span>
              Department Details
            </h4>
            <div className="form-group" data-section="4">
              <label htmlFor="department">Department</label>
              <select 
                id="department" 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
            <div className="form-group" data-section="5">
              <label htmlFor="designation">Designation</label>
              <select 
                id="designation" 
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-title">
              <span className="section-number">B2.3</span>
              Teaching Assignments
            </h4>
            {assignments.map((assignment, index) => (
              <div key={index} className="assignment-item" style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>Year {assignment.year}</strong> - {assignment.subject} 
                  (Sections: {assignment.sections.join(', ')})
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAssignment(index);
                  }}
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  Remove
                </button>
                <input type="hidden" name={`assignments[${index}][year]`} value={assignment.year} />
                <input type="hidden" name={`assignments[${index}][subject]`} value={assignment.subject} />
                {assignment.sections.map(section => (
                  <input 
                    key={section} 
                    type="hidden" 
                    name={`assignments[${index}][sections][]`} 
                    value={section} 
                  />
                ))}
              </div>
            ))}
            
            {showAssignmentForm ? (
              <div className="assignment-form" style={{ marginTop: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                <h5>Add Teaching Assignment</h5>
                <div style={{ marginBottom: '10px' }}>
                  <FormControl fullWidth style={{ marginBottom: '10px' }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={newAssignment.year}
                      onChange={(e) => setNewAssignment({...newAssignment, year: e.target.value})}
                      label="Year"
                    >
                      {availableYears.map(year => (
                        <MenuItem key={year} value={year}>Year {year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Subject"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                    style={{ marginBottom: '10px' }}
                  />
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sections:</label>
                    <FormGroup row>
                      {availableSections.map(section => (
                        <FormControlLabel
                          key={section}
                          control={
                            <Checkbox
                              checked={newAssignment.sections.includes(section)}
                              onChange={() => handleSectionToggle(section)}
                            />
                          }
                          label={section}
                        />
                      ))}
                    </FormGroup>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleAddAssignment}
                      disabled={!newAssignment.year || !newAssignment.subject || newAssignment.sections.length === 0}
                    >
                      Add Assignment
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowAssignmentForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setShowAssignmentForm(true)}
                style={{ marginTop: '10px' }}
              >
                + Add Teaching Assignment
              </Button>
            )}
          </div>
          
          <div className="form-section">
            <h4 className="form-title">
              <span className="section-number">B2.4</span>
              Account Security
            </h4>
            <div className="form-group" data-section="6">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter password" required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="submit-btn">Create Faculty Account</button>
            </div>
          </div>
        </form>

        {/* Current Faculty Table */}
        <Typography variant="h6" component="h3" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
          Current Faculty
        </Typography>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Faculty ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Teaching Assignments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.filter(faculty => faculty).map((faculty) => {
                // Provide default actions if not specified
                const allowedActions = ['view', 'edit', 'delete'];
                return (
                  <tr key={faculty.facultyId || faculty.email || Math.random().toString(36).substr(2, 9)}>
                    <td>{faculty.name || 'N/A'}</td>
                    <td>{faculty.facultyId || 'N/A'}</td>
                    <td>{faculty.department || 'N/A'}</td>
                    <td>{faculty.designation || 'N/A'}</td>
                    <td>
                      {faculty.assignments && faculty.assignments.length > 0 ? (
                        <div>
                          {faculty.assignments.map((assgn, idx) => (
                            <div key={idx} style={{ marginBottom: '5px' }}>
                              <div><strong>Year {assgn.year}</strong> - {assgn.subject}</div>
                              <div>Sections: {Array.isArray(assgn.sections) ? assgn.sections.join(', ') : 'N/A'}</div>
                            </div>
                          ))}
                        </div>
                      ) : 'No assignments'}
                    </td>
                    <td>
                      {allowedActions.includes('view') && (
                        <button className="btn-action" onClick={() => viewFaculty(faculty)}>View</button>
                      )}
                      {allowedActions.includes('edit') && (
                        <button 
                          className="btn-action" 
                          onClick={() => {
                            const id = faculty?.facultyId || faculty?._id;
                            if (id) {
                              editFaculty(id);
                            } else {
                              console.error('Cannot edit: Faculty ID is undefined');
                            }
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {allowedActions.includes('delete') && (
                        <button 
                          className="btn-danger" 
                          onClick={() => {
                            const id = faculty?.facultyId || faculty?._id;
                            if (id) {
                              if (window.confirm('Are you sure you want to delete this faculty member?')) {
                                deleteFaculty(id);
                              }
                            } else {
                              console.error('Cannot delete: Faculty ID is undefined');
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Paper>
    </Box>
  );
};

FacultySection.propTypes = {
  facultyList: PropTypes.array.isRequired,
  handleCreateFaculty: PropTypes.func.isRequired,
  editFaculty: PropTypes.func.isRequired,
  deleteFaculty: PropTypes.func.isRequired
};

export default FacultySection;