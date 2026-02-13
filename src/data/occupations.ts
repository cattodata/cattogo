import type { Occupation } from '@/lib/types'

export const occupations: Record<string, Occupation> = {
  // ===== ICT & TECHNOLOGY (85-95+ pts) =====
  // List types: MLTSSL;CSOL = eligible for 189/190/482/186/485/489/491/494
  // MLTSSL = eligible for 189/190/485/489/491 (no 482/186 direct)
  dataEngineer: {
    title: 'Data Engineer', category: 'ICT & Technology', demand: 'สูงมาก', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 71000, mid: 104000, senior: 146000 },
    pathToPR: 'ง่าย - มีโควตาเยอะ',
    skills: ['Python', 'SQL', 'AWS/Azure', 'Spark', 'Airflow'],
    source: 'PayScale AU Feb 2026 (244 salaries)', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  dataScientist: {
    title: 'Data Scientist', category: 'ICT & Technology', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 85000, mid: 120000, senior: 160000 },
    pathToPR: 'ปานกลาง - แข่งสูง (85+ คะแนน)',
    skills: ['Python', 'R', 'ML/DL', 'Statistics', 'SQL'],
    source: 'SEEK Jan 2026, Indeed AU', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  softwareEngineer: {
    title: 'Software Engineer', category: 'ICT & Technology', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 75000, mid: 105000, senior: 145000 },
    pathToPR: 'ปานกลาง - แข่งสูง (85+ คะแนน)',
    skills: ['JavaScript/Python/Java', 'React/Node', 'APIs', 'Git', 'CI/CD'],
    source: 'SEEK Jan 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  mlEngineer: {
    title: 'ML/AI Engineer', category: 'ICT & Technology', demand: 'สูงมาก', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 90000, mid: 130000, senior: 180000 },
    pathToPR: 'ง่าย - เป็นที่ต้องการมาก',
    skills: ['Python', 'TensorFlow/PyTorch', 'MLOps', 'Cloud', 'Docker/K8s'],
    source: 'LinkedIn Salary Insights 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  devopsEngineer: {
    title: 'DevOps Engineer', category: 'ICT & Technology', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 80000, mid: 115000, senior: 155000 },
    pathToPR: 'ปานกลาง (85+ คะแนน)',
    skills: ['AWS/Azure/GCP', 'Docker/Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    source: 'SEEK, LinkedIn 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  cybersecurityAnalyst: {
    title: 'Cybersecurity Analyst', category: 'ICT & Technology', demand: 'สูงมาก', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 80000, mid: 110000, senior: 150000 },
    pathToPR: 'ง่าย - ขาดแคลนมาก',
    skills: ['Network Security', 'SIEM', 'Penetration Testing', 'ISO 27001', 'Incident Response'],
    source: 'ACS, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  ictBusinessAnalyst: {
    title: 'ICT Business Analyst', category: 'ICT & Technology', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 75000, mid: 100000, senior: 135000 },
    pathToPR: 'ปานกลาง (85+ คะแนน)',
    skills: ['Requirements Analysis', 'Stakeholder Management', 'Agile/Scrum', 'SQL', 'JIRA'],
    source: 'SEEK, PayScale 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  databaseAdmin: {
    title: 'Database Administrator', category: 'ICT & Technology', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 95000, senior: 130000 },
    pathToPR: 'ยาก (85+ คะแนน, แข่งสูง)',
    skills: ['SQL Server/Oracle/PostgreSQL', 'Database Tuning', 'Backup/Recovery', 'Cloud DBaaS'],
    source: 'SEEK, PayScale 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  systemsAnalyst: {
    title: 'Systems Analyst', category: 'ICT & Technology', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 92000, senior: 125000 },
    pathToPR: 'ยาก (85+ คะแนน)',
    skills: ['Systems Analysis', 'UML', 'Business Process Modeling', 'Technical Documentation'],
    source: 'ACS, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  webDeveloper: {
    title: 'Web Developer', category: 'ICT & Technology', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 85000, senior: 115000 },
    pathToPR: 'ยาก (85+ คะแนน)',
    skills: ['HTML/CSS/JS', 'React/Vue/Angular', 'Node.js', 'REST APIs', 'Git'],
    source: 'SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  networkEngineer: {
    title: 'Computer Network & Systems Engineer', category: 'ICT & Technology', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 72000, mid: 95000, senior: 130000 },
    pathToPR: 'ปานกลาง (85+ คะแนน)',
    skills: ['Cisco/Juniper', 'Network Design', 'Firewall', 'Cloud Networking', 'CCNP/CCIE'],
    source: 'SEEK, PayScale 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  ictProjectManager: {
    title: 'ICT Project Manager', category: 'ICT & Technology', demand: 'สูง', minPoints: 90,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 90000, mid: 120000, senior: 160000 },
    pathToPR: 'ยาก (90+ คะแนน)',
    skills: ['Project Management', 'Agile/Scrum', 'Stakeholder Management', 'PMP/PRINCE2', 'Budget Management'],
    source: 'SEEK, LinkedIn 2026', visaSource: 'SkillSelect Nov 2025: 90 points min',
  },
  multimediaDeveloper: {
    title: 'Multimedia Specialist (Developer)', category: 'ICT & Technology', demand: 'ต่ำ', minPoints: 90,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 60000, mid: 80000, senior: 110000 },
    pathToPR: 'ยากมาก (90+ คะแนน)',
    skills: ['UI/UX Design', 'Adobe Creative Suite', 'Motion Graphics', 'Video Production'],
    source: 'SEEK 2026', visaSource: 'SkillSelect Nov 2025: 90 points min',
  },
  telecommunicationsEngineer: {
    title: 'Telecommunications Engineer', category: 'ICT & Technology', demand: 'ต่ำ', minPoints: 90,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 72000, mid: 95000, senior: 130000 },
    pathToPR: 'ยากมาก (90 คะแนน)',
    skills: ['Telecommunications Engineering', 'Network Design', '5G/LTE', 'Engineers Australia'],
    source: 'Telecom sector 2026', visaSource: 'SkillSelect Nov 2025: 90 points',
  },

  // ===== HEALTHCARE (75-80 pts) =====
  registeredNurse: {
    title: 'Registered Nurse', category: 'Healthcare', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 80000, senior: 95000 },
    pathToPR: 'ง่าย - ขาดแคลนมาก ทุก state',
    skills: ['AHPRA Registration', 'ANMAC Assessment', 'Clinical Skills', 'IELTS 7.0 (all bands)'],
    source: 'Nursing agencies AU 2026', visaSource: 'SkillSelect Nov 2025: 75 points (highly invited)',
  },
  midwife: {
    title: 'Midwife', category: 'Healthcare', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 68000, mid: 82000, senior: 95000 },
    pathToPR: 'ง่าย - ขาดแคลนมาก',
    skills: ['AHPRA Registration', 'ANMAC Assessment', 'Midwifery Skills', 'IELTS 7.0'],
    source: 'Health departments AU 2026', visaSource: 'SkillSelect Nov 2025: 75 points',
  },
  medLabScientist: {
    title: 'Medical Laboratory Scientist', category: 'Healthcare', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 60000, mid: 75000, senior: 90000 },
    pathToPR: 'ง่าย-ปานกลาง (75-80 คะแนน)',
    skills: ['AIMS Assessment', 'Laboratory Skills', 'Pathology', 'Quality Control'],
    source: 'AIMS, Health sector 2026', visaSource: 'SkillSelect Nov 2025: 75-80 points',
  },
  pharmacist: {
    title: 'Pharmacist', category: 'Healthcare', demand: 'สูง', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 85000, senior: 105000 },
    pathToPR: 'ปานกลาง (80 คะแนน)',
    skills: ['AHPRA Registration', 'APC Assessment', 'Dispensing', 'Clinical Pharmacy'],
    source: 'Pharmacy Board AU 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  physiotherapist: {
    title: 'Physiotherapist', category: 'Healthcare', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 80000, senior: 100000 },
    pathToPR: 'ง่าย-ปานกลาง (75-85 คะแนน)',
    skills: ['AHPRA Registration', 'APC Assessment', 'Manual Therapy', 'Exercise Prescription'],
    source: 'Allied health agencies 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },

  // ===== MEDICAL SPECIALISTS (75-100 pts) =====
  generalPractitioner: {
    title: 'General Practitioner', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 150000, mid: 220000, senior: 350000 },
    pathToPR: 'ง่ายมาก - ขาดแคลนที่สุด',
    skills: ['AHPRA Registration', 'AMC Exam', 'FRACGP', 'Primary Care'],
    source: 'Health departments AU 2026', visaSource: 'SkillSelect Nov 2025: 75 points (highly invited)',
  },
  psychiatrist: {
    title: 'Psychiatrist', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 160000, mid: 250000, senior: 380000 },
    pathToPR: 'ง่าย - ขาดแคลนมาก',
    skills: ['AHPRA Specialist Registration', 'FRANZCP', 'Mental Health', 'Psychopharmacology'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 75 points',
  },
  surgeon: {
    title: 'Surgeon (General)', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 250000, mid: 400000, senior: 600000 },
    pathToPR: 'ง่าย - specialist ต้องการมาก',
    skills: ['AHPRA Specialist Registration', 'FRACS', 'Surgical Procedures', 'Perioperative Care'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  cardiologist: {
    title: 'Cardiologist', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 200000, mid: 350000, senior: 500000 },
    pathToPR: 'ง่าย - specialist ต้องการมาก',
    skills: ['AHPRA Specialist Registration', 'FRACP', 'Cardiac Care', 'Interventional Procedures'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  dermatologist: {
    title: 'Dermatologist', category: 'Medical Specialists', demand: 'สูง', minPoints: 100,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 180000, mid: 300000, senior: 450000 },
    pathToPR: 'ยาก - ต้อง 100 คะแนน (แข่งสูงมาก)',
    skills: ['AHPRA Specialist Registration', 'FACD', 'Dermatology', 'Skin Cancer Treatment'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 100 points',
  },
  emergencyMedicine: {
    title: 'Emergency Medicine Specialist', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 180000, mid: 280000, senior: 400000 },
    pathToPR: 'ง่าย - ขาดแคลนมาก',
    skills: ['AHPRA Specialist Registration', 'ACEM Fellowship', 'Emergency Care', 'Trauma Management'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 75 points',
  },
  radiologist: {
    title: 'Diagnostic and Interventional Radiologist', category: 'Medical Specialists', demand: 'สูง', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 220000, mid: 380000, senior: 550000 },
    pathToPR: 'ง่าย-ปานกลาง (80 คะแนน)',
    skills: ['AHPRA Specialist Registration', 'RANZCR Fellowship', 'Medical Imaging', 'Interventional Procedures'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  intensiveCare: {
    title: 'Intensive Care Specialist', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 200000, mid: 320000, senior: 480000 },
    pathToPR: 'ง่าย - ต้องการมาก',
    skills: ['AHPRA Specialist Registration', 'CICM Fellowship', 'Critical Care', 'Life Support'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  paediatrician: {
    title: 'Paediatrician', category: 'Medical Specialists', demand: 'สูงมาก', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 170000, mid: 260000, senior: 380000 },
    pathToPR: 'ง่าย - ต้องการมาก',
    skills: ['AHPRA Specialist Registration', 'FRACP (Paediatrics)', 'Child Health', 'Developmental Medicine'],
    source: 'Medical specialists agencies 2026', visaSource: 'SkillSelect Nov 2025: 75 points',
  },

  // ===== ALLIED HEALTH (75-85 pts) =====
  occupationalTherapist: {
    title: 'Occupational Therapist', category: 'Allied Health', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 62000, mid: 78000, senior: 95000 },
    pathToPR: 'ง่าย (75-80 คะแนน)',
    skills: ['AHPRA Registration', 'Rehabilitation', 'ADL Training', 'Assistive Technology'],
    source: 'Allied health agencies 2026', visaSource: 'SkillSelect Nov 2025: 75-80 points',
  },
  audiologist: {
    title: 'Audiologist', category: 'Allied Health', demand: 'ปานกลาง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 82000, senior: 100000 },
    pathToPR: 'ง่าย-ปานกลาง (75-80 คะแนน)',
    skills: ['Audiology Australia Certification', 'Hearing Assessment', 'Hearing Aids', 'Vestibular Testing'],
    source: 'Allied health agencies 2026', visaSource: 'SkillSelect Nov 2025: 75-80 points',
  },
  speechPathologist: {
    title: 'Speech Pathologist', category: 'Allied Health', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 68000, mid: 85000, senior: 105000 },
    pathToPR: 'ง่าย-ปานกลาง (75-85 คะแนน)',
    skills: ['Speech Pathology Australia', 'Communication Disorders', 'Swallowing Assessment', 'Language Therapy'],
    source: 'Allied health agencies 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },
  clinicalPsychologist: {
    title: 'Clinical Psychologist', category: 'Allied Health', demand: 'สูง', minPoints: 80,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 75000, mid: 95000, senior: 120000 },
    pathToPR: 'ปานกลาง (80 คะแนน)',
    skills: ['AHPRA Registration (Psychology)', 'Clinical Assessment', 'Therapy', 'Mental Health Treatment'],
    source: 'Psychology Board AU 2026', visaSource: 'SkillSelect Nov 2025: 80 points',
  },
  medicalRadiographer: {
    title: 'Medical Diagnostic Radiographer', category: 'Allied Health', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 64000, mid: 80000, senior: 95000 },
    pathToPR: 'ง่าย-ปานกลาง (75-85 คะแนน)',
    skills: ['AHPRA Registration', 'Medical Imaging', 'X-ray/CT/MRI', 'Radiation Safety'],
    source: 'Radiography agencies 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },
  optometrist: {
    title: 'Optometrist', category: 'Allied Health', demand: 'ปานกลาง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 90000, senior: 115000 },
    pathToPR: 'ปานกลาง (75-85 คะแนน)',
    skills: ['AHPRA Registration', 'Eye Examinations', 'Vision Correction', 'Ocular Disease Detection'],
    source: 'Optometry Board AU 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },

  // ===== ENGINEERING (85 pts) =====
  civilEngineer: {
    title: 'Civil Engineer', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 68000, mid: 90000, senior: 130000 },
    pathToPR: 'ปานกลาง - ต้อง 85+ คะแนน',
    skills: ['Structural Analysis', 'AutoCAD', 'Project Management', 'Engineers Australia Assessment'],
    source: 'Engineers Australia, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  mechanicalEngineer: {
    title: 'Mechanical Engineer', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 88000, senior: 125000 },
    pathToPR: 'ปานกลาง - ต้อง 85+ คะแนน',
    skills: ['CAD/SolidWorks', 'Thermodynamics', 'Manufacturing', 'Engineers Australia Assessment'],
    source: 'Engineers Australia, PayScale 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  electricalEngineer: {
    title: 'Electrical Engineer', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 68000, mid: 92000, senior: 130000 },
    pathToPR: 'ปานกลาง - ต้อง 85+ คะแนน',
    skills: ['Power Systems', 'Control Systems', 'PLC', 'Engineers Australia Assessment'],
    source: 'Engineers Australia, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  chemicalEngineer: {
    title: 'Chemical Engineer', category: 'Engineering', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 95000, senior: 135000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Chemical Engineering Degree', 'Process Design', 'Chemical Plant Operations', 'Engineers Australia'],
    source: 'Engineers Australia 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  miningEngineer: {
    title: 'Mining Engineer', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 80000, mid: 120000, senior: 180000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Mining Engineering Degree', 'Mine Planning', 'Resource Estimation', 'Engineers Australia'],
    source: 'Engineers Australia, Mining sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  petroleumEngineer: {
    title: 'Petroleum Engineer', category: 'Engineering', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 90000, mid: 130000, senior: 190000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Petroleum Engineering Degree', 'Reservoir Engineering', 'Drilling Operations', 'Engineers Australia'],
    source: 'Engineers Australia, Oil & Gas sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  engineeringManager: {
    title: 'Engineering Manager', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 100000, mid: 140000, senior: 200000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Engineering Degree + Management', 'Project Management', 'Team Leadership', 'Engineers Australia'],
    source: 'Engineers Australia, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  constructionProjectManager: {
    title: 'Construction Project Manager', category: 'Engineering', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 85000, mid: 115000, senior: 160000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Construction/Engineering Degree', 'Project Management', 'Construction Planning', 'AIPM/PMP'],
    source: 'Construction sector, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  materialsEngineer: {
    title: 'Materials Engineer', category: 'Engineering', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 68000, mid: 92000, senior: 128000 },
    pathToPR: 'ปานกลาง (85 คะแนน)',
    skills: ['Materials Engineering Degree', 'Material Testing', 'Metallurgy', 'Engineers Australia'],
    source: 'Engineers Australia 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== TRADES (65-85 pts) =====
  electrician: {
    title: 'Electrician (General)', category: 'Trades', demand: 'สูงมาก', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 55000, mid: 75000, senior: 95000 },
    pathToPR: 'ง่ายมาก - คะแนนต่ำสุด (65) และอยู่ใน PMSOL',
    skills: ['Trade Certificate III/IV', 'Electrical License', 'Installation', 'Maintenance'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65 points min (highly invited)',
  },
  plumber: {
    title: 'Plumber (General)', category: 'Trades', demand: 'สูงมาก', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 52000, mid: 72000, senior: 92000 },
    pathToPR: 'ง่ายมาก - คะแนนต่ำสุด (65-70)',
    skills: ['Trade Certificate III/IV', 'Plumbing License', 'Pipe Fitting', 'Gas Fitting'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65-70 points',
  },
  carpenter: {
    title: 'Carpenter', category: 'Trades', demand: 'สูง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 50000, mid: 68000, senior: 85000 },
    pathToPR: 'ง่าย - คะแนนต่ำ (65)',
    skills: ['Trade Certificate III/IV', 'Carpentry License', 'Framework', 'Finishing'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65 points min',
  },
  bricklayer: {
    title: 'Bricklayer', category: 'Trades', demand: 'สูง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 48000, mid: 65000, senior: 85000 },
    pathToPR: 'ง่าย (65-70 คะแนน)',
    skills: ['Trade Certificate III', 'Bricklaying', 'Masonry', 'Construction'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65-70 points',
  },
  fibrousPlasterer: {
    title: 'Fibrous Plasterer', category: 'Trades', demand: 'สูง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 50000, mid: 68000, senior: 88000 },
    pathToPR: 'ง่าย (65 คะแนน)',
    skills: ['Trade Certificate III', 'Plastering', 'Fibrous Work', 'Wall Finishing'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65 points',
  },
  gasfitter: {
    title: 'Gasfitter', category: 'Trades', demand: 'สูง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 55000, mid: 75000, senior: 95000 },
    pathToPR: 'ง่าย (65-80 คะแนน)',
    skills: ['Trade Certificate III/IV', 'Gas Fitting License', 'Gas Installation', 'Safety Compliance'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65-80 points',
  },
  joiner: {
    title: 'Joiner', category: 'Trades', demand: 'ปานกลาง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 52000, mid: 70000, senior: 88000 },
    pathToPR: 'ง่าย (65 คะแนน)',
    skills: ['Trade Certificate III', 'Joinery', 'Cabinet Making', 'Wood Working'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65 points',
  },
  welder: {
    title: 'Welder (First Class)', category: 'Trades', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 52000, mid: 72000, senior: 95000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Trade Certificate III/IV', 'Welding License', 'TIG/MIG/Arc Welding', 'Metal Fabrication'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  wallFloorTiler: {
    title: 'Wall and Floor Tiler', category: 'Trades', demand: 'สูง', minPoints: 65,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 48000, mid: 65000, senior: 85000 },
    pathToPR: 'ง่าย (65-75 คะแนน)',
    skills: ['Trade Certificate III', 'Tiling', 'Surface Preparation', 'Waterproofing'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 65-75 points',
  },
  paintingTradesWorker: {
    title: 'Painting Trades Worker', category: 'Trades', demand: 'สูง', minPoints: 70,
    shortageList: 'MLTSSL',
    salaryRange: { entry: 45000, mid: 60000, senior: 78000 },
    pathToPR: 'ง่าย (70 คะแนน)',
    skills: ['Trade Certificate III', 'Painting', 'Surface Preparation', 'Finishing'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 70 points',
  },
  metalFabricator: {
    title: 'Metal Fabricator', category: 'Trades', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 50000, mid: 68000, senior: 90000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Trade Certificate III', 'Metal Fabrication', 'Welding', 'Blueprint Reading'],
    source: 'Trades organizations AU 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== EDUCATION (75-90 pts) =====
  secondaryTeacher: {
    title: 'Secondary School Teacher', category: 'Education', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 90000, senior: 110000 },
    pathToPR: 'ง่าย-ปานกลาง (75-85 คะแนน ขึ้นกับวิชา)',
    skills: ['Teaching Qualification', 'AITSL Assessment', 'Subject Specialization', 'IELTS 7.5+'],
    source: 'Education departments AU 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },
  earlyChildhoodTeacher: {
    title: 'Early Childhood (Pre-primary) Teacher', category: 'Education', demand: 'สูง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 58000, mid: 75000, senior: 90000 },
    pathToPR: 'ยาก - ต้อง 85-90 คะแนน',
    skills: ['Early Childhood Education Degree', 'AITSL Assessment', 'IELTS 7.5+'],
    source: 'Education departments AU 2026', visaSource: 'SkillSelect Nov 2025: 85-90 points',
  },

  // ===== SCIENCE & RESEARCH (85 pts) =====
  biochemist: {
    title: 'Biochemist', category: 'Science & Research', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 85000, senior: 115000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Biochemistry Degree', 'Laboratory Research', 'Molecular Biology', 'AIMS Assessment'],
    source: 'Research institutions, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  biotechnologist: {
    title: 'Biotechnologist', category: 'Science & Research', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL',
    salaryRange: { entry: 68000, mid: 88000, senior: 120000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Biotechnology Degree', 'Genetic Engineering', 'Bioprocessing', 'AIMS Assessment'],
    source: 'Biotech sector, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  chemist: {
    title: 'Chemist', category: 'Science & Research', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 62000, mid: 80000, senior: 110000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Chemistry Degree', 'Chemical Analysis', 'Laboratory Work', 'AIMS Assessment'],
    source: 'Research institutions, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  environmentalScientist: {
    title: 'Environmental Scientist', category: 'Science & Research', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 60000, mid: 78000, senior: 105000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Environmental Science Degree', 'Environmental Assessment', 'Data Analysis', 'VETASSESS'],
    source: 'Environmental sector, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  geophysicist: {
    title: 'Geophysicist', category: 'Science & Research', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 75000, mid: 100000, senior: 140000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Geophysics Degree', 'Seismic Analysis', 'Resource Exploration', 'VETASSESS'],
    source: 'Mining/Resources sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== LEGAL & BUSINESS (85-90 pts) =====
  solicitor: {
    title: 'Solicitor', category: 'Legal', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 100000, senior: 150000 },
    pathToPR: 'ยากมาก (85+ คะแนน)',
    skills: ['Law Degree', 'Admission to Practice', 'Legal Research', 'State Law Society'],
    source: 'Law firms, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85+ points',
  },
  barrister: {
    title: 'Barrister', category: 'Legal', demand: 'ต่ำ', minPoints: 90,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 100000, mid: 180000, senior: 350000 },
    pathToPR: 'ยากมาก (90 คะแนน)',
    skills: ['Law Degree', 'Bar Admission', 'Court Advocacy', 'State Bar Association'],
    source: 'Bar associations 2026', visaSource: 'SkillSelect Nov 2025: 90 points',
  },
  accountant: {
    title: 'Accountant (General)', category: 'Business & Finance', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 60000, mid: 80000, senior: 110000 },
    pathToPR: 'ยาก - แข่งสูงมาก ต้อง 85+ และ CPA/CA',
    skills: ['CPA/CA Australia', 'Financial Reporting', 'Tax', 'Audit'],
    source: 'CPA Australia, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85+ points (very competitive)',
  },
  managementConsultant: {
    title: 'Management Consultant', category: 'Business & Finance', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 75000, mid: 105000, senior: 160000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Business Degree/MBA', 'Strategy Development', 'Business Analysis', 'VETASSESS'],
    source: 'Consulting firms, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  economist: {
    title: 'Economist', category: 'Business & Finance', demand: 'ต่ำ', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 95000, senior: 135000 },
    pathToPR: 'ยากมาก (85+ คะแนน, แข่งสูง)',
    skills: ['Economics Degree', 'Economic Analysis', 'Econometrics', 'VETASSESS'],
    source: 'Government, Research, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  actuary: {
    title: 'Actuary', category: 'Business & Finance', demand: 'ต่ำ', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 80000, mid: 120000, senior: 180000 },
    pathToPR: 'ยากมาก (85+ คะแนน)',
    skills: ['Actuarial Studies', 'FIAA/AIAA', 'Risk Analysis', 'Financial Modeling'],
    source: 'Actuaries Institute, SEEK 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== AGRICULTURE & ENVIRONMENT (85 pts) =====
  agriculturalScientist: {
    title: 'Agricultural Scientist', category: 'Agriculture & Environment', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL',
    salaryRange: { entry: 62000, mid: 82000, senior: 110000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Agricultural Science Degree', 'Crop Science', 'Soil Science', 'VETASSESS'],
    source: 'Agricultural sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  veterinarian: {
    title: 'Veterinarian', category: 'Agriculture & Environment', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 70000, mid: 90000, senior: 120000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Veterinary Degree', 'AVBC Registration', 'Animal Medicine', 'Surgery'],
    source: 'Veterinary Board 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },
  forester: {
    title: 'Forester', category: 'Agriculture & Environment', demand: 'ต่ำ', minPoints: 85,
    shortageList: 'MLTSSL',
    salaryRange: { entry: 58000, mid: 75000, senior: 95000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Forestry Degree', 'Forest Management', 'Conservation', 'VETASSESS'],
    source: 'Forestry sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== ARCHITECTURE & DESIGN (85 pts) =====
  architect: {
    title: 'Architect', category: 'Architecture & Design', demand: 'ปานกลาง', minPoints: 85,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 60000, mid: 85000, senior: 120000 },
    pathToPR: 'ยาก - ต้อง 85+ คะแนน',
    skills: ['AACA Assessment', 'AutoCAD/Revit', 'Design', 'Building Codes'],
    source: 'Architects Registration Board AU 2026', visaSource: 'SkillSelect Nov 2025: 85 points min',
  },
  landscapeArchitect: {
    title: 'Landscape Architect', category: 'Architecture & Design', demand: 'ต่ำ', minPoints: 85,
    shortageList: 'MLTSSL',
    salaryRange: { entry: 58000, mid: 78000, senior: 105000 },
    pathToPR: 'ยาก (85 คะแนน)',
    skills: ['Landscape Architecture Degree', 'Design', 'Planning', 'AILA Assessment'],
    source: 'Landscape sector 2026', visaSource: 'SkillSelect Nov 2025: 85 points',
  },

  // ===== COMMUNITY SERVICES (75-85 pts) =====
  socialWorker: {
    title: 'Social Worker', category: 'Community Services', demand: 'สูง', minPoints: 75,
    shortageList: 'MLTSSL;CSOL',
    salaryRange: { entry: 65000, mid: 82000, senior: 100000 },
    pathToPR: 'ง่าย-ปานกลาง (75-85 คะแนน)',
    skills: ['AASW Assessment', 'Case Management', 'Counseling', 'Community Services'],
    source: 'AASW, Government departments 2026', visaSource: 'SkillSelect Nov 2025: 75-85 points',
  },
}

// ===== Helper: Popular occupations for quick access =====
export const POPULAR_OCCUPATIONS = [
  { key: 'dataEngineer', emoji: '💻' },
  { key: 'registeredNurse', emoji: '🏥' },
  { key: 'electrician', emoji: '🔧' },
  { key: 'softwareEngineer', emoji: '💻' },
  { key: 'generalPractitioner', emoji: '👨‍⚕️' },
  { key: 'plumber', emoji: '🔧' },
  { key: 'civilEngineer', emoji: '⚙️' },
  { key: 'secondaryTeacher', emoji: '📚' },
] as const

// ===== Helper: Get unique categories =====
export function getCategories(): string[] {
  const cats = new Set(Object.values(occupations).map(o => o.category))
  return Array.from(cats).sort()
}

// ===== Map occupation category → country-data occupation ID =====
const CATEGORY_TO_OCC_ID: Record<string, string> = {
  'ICT & Technology': 'software',
  'Engineering': 'engineering',
  'Trades': 'engineering',
  'Healthcare': 'healthcare',
  'Medical Specialists': 'healthcare',
  'Allied Health': 'healthcare',
  'Business & Finance': 'accounting',
  'Legal': 'accounting',
  'Education': 'other',
  'Architecture & Design': 'other',
  'Science & Research': 'other',
  'Agriculture & Environment': 'other',
  'Community Services': 'other',
}

/** ค้นหาอาชีพจากชื่อ (case-insensitive) */
export function searchOccupations(query: string): { key: string; title: string; category: string; occId: string }[] {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  return Object.entries(occupations)
    .filter(([, o]) => o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
    .slice(0, 8) // limit results
    .map(([key, o]) => ({
      key,
      title: o.title,
      category: o.category,
      occId: CATEGORY_TO_OCC_ID[o.category] || 'other',
    }))
}

/** map specific occupation key → country-data ID */
export function getOccIdForKey(key: string): string {
  const occ = occupations[key]
  if (!occ) return 'other'
  return CATEGORY_TO_OCC_ID[occ.category] || 'other'
}
