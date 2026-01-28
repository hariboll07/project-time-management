📌 Project Time Management System:
A role-based Project Time Management System built using HTML, CSS, and JavaScript, designed to manage projects, tasks, deadlines, and team workflows for a company.
This application supports Admin, Manager, and Employee roles with separate dashboards and permissions.

🚀 Live Demo
🔗 Live URL:
https://hariboll07.github.io/project-time-management/

🧩 Features
👑 Admin:
Login & authentication
Approve managers and employees
Create projects
Assign managers to projects
Create and assign tasks
Assign employees to tasks
View all projects and tasks
Mark projects as completed
View overdue projects and tasks

👔 Manager:
View only assigned projects
Create, update, and delete tasks
Assign employees to tasks
Update task status
View project progress
Dashboard metrics:
Tasks due today
Overdue tasks
Overdue projects

🧑‍💻 Employee:
View assigned projects
View assigned tasks
Update task status
Dashboard metrics:
Total tasks
Tasks due today
Overdue tasks
My projects

⏰ Overdue & Deadline Tracking:
Overdue Tasks
Task deadline passed
Status not completed
Overdue Projects
Project deadline passed
Project not completed
Tasks Due Today
Deadline equals today
Status not completed
Overdue status is calculated dynamically (not stored in data).

🗂️ Project Structure:
project-time-management/
│
├── admin/
│   └── dashboard.html
│
├── manager/
│   └── dashboard.html
│
├── employee/
│   └── dashboard.html
│
├── css/
│   ├── admin.css
│   └── style.css
│
├── js/
│   ├── admin.js
│   ├── manager.js
│   ├── employee.js
│   └── script.js
│
├── index.html
└── README.md

🛠️ Technologies Used:
HTML5
CSS3
JavaScript (ES6)
LocalStorage (for data persistence)
GitHub Pages (for deployment)

🔐 Authentication & Access Control:
Role-based login (Admin / Manager / Employee)
Unauthorized users are redirected automatically
Dashboard access is restricted based on role
New users require admin approval

🧠 Key Learning Outcomes:
Role-based application design
Frontend authentication & authorization
State management using LocalStorage
Dynamic UI rendering
Deadline & overdue logic
Real-world dashboard metrics
GitHub Pages deployment

⚠️ Important Notes:
This is a frontend-only project
Data is stored in browser LocalStorage
For testing multiple roles:
Use different browsers or incognito windows

📌 Future Enhancements::
Backend integration (Node.js & Express)
Database (MongoDB)
Notifications system
Charts and analytics
MERN stack version
