// ===============================
// AUTH GUARD (MANAGER ONLY)
// ===============================
const currentUserRaw = localStorage.getItem("currentUser");

if (!currentUserRaw) {
  window.location.replace("../index.html");
}

const currentUser = JSON.parse(currentUserRaw);

if (currentUser.role !== "manager") {
  window.location.replace("../index.html");
}

// ===============================
// GLOBAL DATA
// ===============================
let users = JSON.parse(localStorage.getItem("users")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [];

// ===============================
// LOGOUT
// ===============================
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

// ===============================
// SECTION SWITCH
// ===============================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  // 🔥 AUTO-LOAD DATA
  if (sectionId === "dashboard") loadDashboardCounts();
  else if (sectionId === "projects") loadMyProjects();
  else if (sectionId === "tasks") loadTaskList();
  else if (sectionId === "employees") loadMyEmployees();
}

function getMyProjects() {
  return projects.filter((p) => p.manager === currentUser.username);
}

function getMyTasks() {
  let tasks = [];
  getMyProjects().forEach((p) => {
    tasks = tasks.concat(p.tasks);
  });
  return tasks;
}
function loadDashboardCounts() {
  const myProjects = getMyProjects();
  const myTasks = getMyTasks();
  const today = getTodayDate();

  document.getElementById("myProjectCount").innerText = myProjects.length;

  document.getElementById("myTaskCount").innerText = myTasks.length;

  document.getElementById("myCompletedTaskCount").innerText = myTasks.filter(
    (t) => t.status === "Completed",
  ).length;

  document.getElementById("myCompletedProjectCount").innerText =
    myProjects.filter((t) => t.status === "Completed").length;

  document.getElementById("dueTodayTaskCount").innerText = myTasks.filter(
    (t) => t.deadline === today && t.status !== "Completed",
  ).length;

  document.getElementById("overdueTaskCount").innerText =
    myTasks.filter(isTaskOverdue).length;

  document.getElementById("overdueProjectCount").innerText =
    myProjects.filter(isProjectOverdue).length;
}
function loadMyProjects() {
  const box = document.getElementById("projectList");
  box.innerHTML = "";

  const myProjects = getMyProjects();

  if (myProjects.length === 0) {
    box.innerHTML = "<p style='margin-top: 100px'>No projects assigned.</p>";
    return;
  }

  myProjects.forEach((p) => {
    box.innerHTML += `
      <div class="project-row ${isProjectOverdue(p) ? "overdue-card" : ""}">
        <div class="left">
          <h3>${p.name.toUpperCase()}</h3>
          <p>Manager: <b>${p.manager}</b></p>
          <p>
            Deadline:
            <span class="${isProjectOverdue(p) ? "overdue" : ""}">
              ${p.deadline}
            </span>
          </p>
        </div>

        <div class="middle">
          <p>Tasks: <b>${p.tasks.length}</b></p>
          <p style="color:red">Status: <b style=${p.status == "Active" ? "color:orange" : p.status == "Ready to Complete" ? "color:lightgreen" : "color:darkgreen"} >${p.status}</b></p>
        </div>

        <div class="right">
        ${isProjectOverdue(p) ? `<span class="overdue-tag" style="width:70px">OVERDUE</span>` : ""}
          <button onclick="openProjectTasks(${p.id})" class="viewTask">
            View Tasks
          </button>
        </div>
      </div>
    `;
  });
}
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function isProjectOverdue(project) {
  if (!project.deadline) return false;
  if (project.status === "Completed") return false;

  const today = getTodayDate();
  return project.deadline < today;
}

function openProjectTasks(projectId) {
  const panel = document.getElementById("projectTasksPanel");
  const title = document.getElementById("projectTasksTitle");
  const list = document.getElementById("projectTasksList");

  panel.classList.remove("hidden");
  list.innerHTML = "";

  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  title.innerText = `Tasks – ${project.name}`;

  if (project.tasks.length === 0) {
    list.innerHTML = "<p class='empty'>No tasks assigned.</p>";
    return;
  }

  project.tasks.forEach((task) => {
    list.innerHTML += `
      <div class="task-row ${isTaskOverdue(task) ? "overdue-card" : ""}">
        <div class="task-left">
          <h4>${task.title}</h4>

          <p>
            Deadline:
            <span class="${isTaskOverdue(task) ? "overdue" : ""}">
              ${task.deadline || "N/A"}
            </span>
          </p>

          <p>Status: <b>${task.status}</b></p>
        </div>

        <div class="task-middle">
          <p>Employees:</p>
          <p>${task.assignedEmployees.join(", ")}</p>
        </div>

        <div class="task-right">
          <button
            onclick="markTaskCompleted(${project.id}, ${task.id})"
            ${task.status === "Completed" ? "disabled" : ""}
          >
            Complete
          </button>
        </div>
      </div>
    `;
  });
}
function closeProjectTasks() {
  document.getElementById("projectTasksPanel").classList.add("hidden");
}
function markTaskCompleted(projectId, taskId) {
  const project = projects.find((p) => p.id === projectId);
  const task = project.tasks.find((t) => t.id === taskId);

  if (!task) return;

  // 1️⃣ Update task
  task.status = "Completed";

  // 2️⃣ UPDATE PROJECT STATUS 🔥🔥
  if (
    project.tasks.length > 0 &&
    project.tasks.every((t) => t.status === "Completed")
  ) {
    project.status = "Ready to Complete";
  } else {
    project.status = "Active";
  }

  // 3️⃣ Save
  localStorage.setItem("projects", JSON.stringify(projects));

  // 4️⃣ Reload UI
  loadTaskList();
  loadDashboardCounts();
  loadMyProjects();
  openProjectTasks(projectId);
}

function isTaskOverdue(task) {
  if (!task.deadline) return false;
  if (task.status === "Completed") return false;

  const today = new Date().toISOString().split("T")[0];
  return task.deadline < today;
}

function openTaskModal() {
  document.getElementById("taskModal").classList.remove("hidden");

  // Load ONLY manager projects
  const projectDrop = document.getElementById("taskProject");
  projectDrop.innerHTML = "<option value=''>Select</option>";

  getMyProjects().forEach((p) => {
    projectDrop.innerHTML += `
      <option value="${p.id}">${p.name}</option>
    `;
  });

  // Load employees
  const empBox = document.getElementById("taskEmployeeList");
  empBox.innerHTML = "";

  users
    .filter((u) => u.role === "employee" && u.isApproved)
    .forEach((e) => {
      empBox.innerHTML += `
        <label class="emp-check">
          <input type="checkbox" value="${e.username}">
          ${e.fullname}
        </label><br>
      `;
    });
}
function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}
function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const projectId = document.getElementById("taskProject").value;
  const deadline = document.getElementById("taskDeadline").value;
  const status = document.getElementById("taskStatus").value;

  const employees = [];
  document
    .querySelectorAll("#taskEmployeeList input:checked")
    .forEach((chk) => employees.push(chk.value));

  if (!title || !projectId || employees.length === 0) {
    alert("Fill all fields");
    return;
  }

  const project = projects.find((p) => p.id == projectId);

  const task = {
    id: Date.now(),
    title,
    assignedEmployees: employees,
    deadline,
    status,
  };
  project.tasks.push(task);

  // 🔥 RESET PROJECT STATUS
  project.status = "Active";

  localStorage.setItem("projects", JSON.stringify(projects));

  closeTaskModal();
  loadTaskList();
  loadDashboardCounts();
  loadMyProjects();
}
function loadTaskList() {
  const box = document.getElementById("taskList");
  box.innerHTML = "";

  let hasTasks = false;

  getMyProjects().forEach((project) => {
    if (project.tasks.length === 0) return;

    hasTasks = true;

    box.innerHTML += `
      <h3 class="task-project-title">
        ${project.name.toUpperCase()}
      </h3>
    `;

    project.tasks.forEach((task) => {
      box.innerHTML += `
        <div class="task-card ${isTaskOverdue(task) ? "overdue-card" : ""}">
          <div class="task-header">
            <h3>${task.title}</h3>
            <span class="status ${task.status.toLowerCase().replace(" ", "-")}">
              ${task.status}
            </span>
          </div>

          <p style="color:purple"><b style="color:green">Employees:</b> ${task.assignedEmployees.join(", ")}</p>
          <p style="color:red" ><b style="color:orange">Deadline:</b> ${task.deadline || "N/A"}</p>

          <div class="task-footer">
            <select onchange="updateTaskStatus(${project.id}, ${task.id}, this.value)">
              <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${task.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>

            <div class="task-actions">
              <button onclick="deleteTask(${project.id}, ${task.id})" class="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    });
  });

  if (!hasTasks) {
    box.innerHTML = "<p>No tasks available.</p>";
  }
}
function updateTaskStatus(projectId, taskId, status) {
  const project = projects.find((p) => p.id === projectId);
  const task = project.tasks.find((t) => t.id === taskId);

  task.status = status;

  // 🔥 PROJECT STATUS RECALCULATION
  if (
    project.tasks.length > 0 &&
    project.tasks.every((t) => t.status === "Completed")
  ) {
    project.status = "Ready to Complete";
  } else {
    project.status = "Active";
  }

  localStorage.setItem("projects", JSON.stringify(projects));

  loadTaskList();
  loadDashboardCounts();
  loadMyProjects();
}

function deleteTask(projectId, taskId) {
  if (!confirm("Delete this task?")) return;

  const project = projects.find((p) => p.id === projectId);
  project.tasks = project.tasks.filter((t) => t.id !== taskId);

  localStorage.setItem("projects", JSON.stringify(projects));
  loadTaskList();
  loadDashboardCounts();
}
function loadMyEmployees() {
  const box = document.getElementById("employeeList");
  box.innerHTML = "";

  const employeeUsernames = new Set();

  // Collect employees from manager projects
  getMyProjects().forEach((project) => {
    project.tasks.forEach((task) => {
      task.assignedEmployees.forEach((emp) => {
        employeeUsernames.add(emp);
      });
    });
  });

  if (employeeUsernames.size === 0) {
    box.innerHTML = "<p>No employees assigned yet.</p>";
    return;
  }

  // Match users
  employeeUsernames.forEach((username) => {
    const emp = users.find(
      (u) => u.username === username && u.role === "employee",
    );

    if (!emp) return;

    box.innerHTML += `
      <div class="user-card">
        <p><b>${emp.fullname}</b></p>
        <p>${emp.email}</p>
        <p>Role: Employee</p>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardCounts();
  loadMyProjects();
  loadTaskList();
  loadMyEmployees();
});
