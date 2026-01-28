// ===============================
// AUTH GUARD — ADMIN ONLY
// ===============================
const currentUserRaw = localStorage.getItem("currentUser");

if (!currentUserRaw) {
  window.location.replace("../index.html");
}

const currentUser = JSON.parse(currentUserRaw);

if (currentUser.role !== "admin") {
  window.location.replace("../index.html");
}

//to get the users
let users = JSON.parse(localStorage.getItem("users")) || [];

//to get the projects
let projects = JSON.parse(localStorage.getItem("projects")) || [];

function logout() {
  let con = confirm("are you sure you want to logout the account");
  if (con) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

//function to display pending users
function loadPendingUsers() {
  const box = document.getElementById("pendingUsers");
  box.innerHTML = "";
  const pending = users.filter((u) => !u.isApproved && u.role !== "admin");
  if (pending.length === 0) {
    box.innerHTML = "<h1>No pending approvals.</h1>";
    return;
  }
  pending.forEach((user) => {
    box.innerHTML += `
            <div class="user-card">
                <p><b>${user.fullname}</b> (${user.role})</p>
                <p>${user.email}</p>
                <div class="actions">
                    <button onclick="approveUser('${user.username}')">Approve</button>
                    <button onclick="rejectUser('${user.username}')">Reject</button>
                </div>
            </div>
        `;
  });
}

//approve users
function approveUser(username) {
  const user = users.find((u) => u.username === username);
  if (user) {
    user.isApproved = true;
  }
  localStorage.setItem("users", JSON.stringify(users));
  loadPendingUsers();
  loadApprovedUsers();
  loadDashboardCounts();
}

//for reject user
function rejectUser(username) {
  let conf = confirm("did you want to delete the user?");
  if (conf) {
    users = users.filter((u) => u.username !== username);
    localStorage.setItem("users", JSON.stringify(users));
    return;
  }
  loadPendingUsers();
  loadDashboardCounts();
  loadApprovedUsers();
}

// for to display approved users
function loadApprovedUsers() {
  const box = document.getElementById("approvedUsers");
  box.innerHTML = "";
  const approved = users.filter((u) => u.isApproved && u.role !== "admin");
  if (approved.length === 0) {
    box.innerHTML = "<p>No approved users yet.</p>";
    return;
  }
  approved.forEach((u) => {
    box.innerHTML += `
            <div class="user-card">
                <p><span>Name:</span> <b>${u.fullname}</b> (${u.role})</p>
                <p><span>Email:</span> ${u.email}</p>
                <button onclick="rejectUser('${u.username}')">Delete</button>
            </div>
        `;
  });
}

//save the new project
function saveProject() {
  const name = document.getElementById("projectName").value.trim();
  const manager1 = document.getElementById("projectManager").value;
  const deadline = document.getElementById("projectDeadline").value;

  if (!name || !manager1 || !deadline) {
    alert("Please fill all fields.");
    return;
  }
  let manager = users.find((u) => u.fullname === manager1).username;
  const project = {
    id: Date.now(),
    name,
    manager,
    deadline,
    status: "Active",
    tasks: [],
  };

  projects.push(project);
  localStorage.setItem("projects", JSON.stringify(projects));
  closeProjectModal();
  loadProjectList();
}
//for display the project list
function loadProjectList() {
  const box = document.getElementById("projectList");
  box.innerHTML = "";

  if (projects.length === 0) {
    box.innerHTML = "<p>No projects added yet.</p>";
    return;
  }

  projects.forEach((p) => {
    const taskCount = p.tasks.length;
    box.innerHTML += `
           <div class="project-row ${
             isProjectOverdue(p) ? "overdue-card" : ""
           }">
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
                    <p>Tasks: <b>${taskCount}</b></p>
                    <p style="color:red">Status: <b style=${p.status == "Active" ? "color:orange" : p.status == "Ready to Complete" ? "color:lightgreen" : "color:darkgreen"} >${p.status}</b></p>
                </div>

                <div class="right">
                <button onclick="openTaskListForProject(${
                  p.id
                })" class="viewTask">View Tasks</button>
                <button 
                  onclick="markProjectCompleted(${p.id})"
                  ${
                    p.tasks.length === 0 ||
                    p.tasks.some((t) => t.status !== "Completed") ||
                    p.status === "Completed"
                      ? "disabled"
                      : ""
                  }
                 class="completeTask">
                  Mark Complete
                </button>

                <button onclick="deleteProject(${
                  p.id
                })" class="deleteTask">Delete</button>
              </div>


            </div>
        `;
  });
  loadDashboardCounts();
}
function isProjectOverdue(project) {
  if (project.status === "Completed") return false;

  const today = new Date().toISOString().split("T")[0];
  return project.deadline < today;
}

//for opentasklist for project
function openTaskListForProject(projectId) {
  const panel = document.getElementById("projectTasksPanel");
  const title = document.getElementById("projectTasksTitle");
  const list = document.getElementById("projectTasksList");

  panel.classList.remove("hidden");
  list.innerHTML = "";

  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  title.innerText = `Tasks – ${project.name}`;

  if (project.tasks.length === 0) {
    list.innerHTML = "<p class='empty'>No tasks assigned to this project.</p>";

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

function markProjectCompleted(projectId) {
  const project = projects.find((p) => p.id === projectId);

  if (!project) return;

  const allCompleted = project.tasks.every((t) => t.status === "Completed");

  if (!allCompleted) {
    alert("All tasks must be completed before completing the project.");
    return;
  }

  project.status = "Completed";
  localStorage.setItem("projects", JSON.stringify(projects));

  loadProjectList();
  loadDashboardCounts();
}
function closeProjectTasks() {
  document.getElementById("projectTasksPanel").classList.add("hidden");
}

//for delete the project
function deleteProject(id) {
  const project = projects.find((p) => p.id === id);

  const confirmDelete = confirm(
    `Delete project "${project.name}"?\n\nAll tasks under this project will also be deleted.`,
  );

  if (!confirmDelete) return;

  projects = projects.filter((p) => p.id !== id);
  localStorage.setItem("projects", JSON.stringify(projects));

  loadProjectList();
  loadTaskList();
  loadDashboardCounts();
}

//to show and hide the pages
function showSection(sectionId) {
  // ✅ close any open modal first
  closeAllModals();

  // hide all sections
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.add("hidden");
  });

  // show selected section
  document.getElementById(sectionId).classList.remove("hidden");
}

//for project model open and close
function openProjectModal() {
  document.getElementById("projectModal").classList.remove("hidden");

  const managerDropdown = document.getElementById("projectManager");
  managerDropdown.innerHTML = "";
  // Load only approved managers
  managerDropdown.innerHTML = "<option value=''>Select</option>";
  users
    .filter((u) => u.role === "manager" && u.isApproved)
    .forEach((m) => {
      managerDropdown.innerHTML += `<option value="${m.fullname}">${m.fullname}</option>`;
    });
}

function closeProjectModal() {
  document.getElementById("projectModal").classList.add("hidden");
}
//for save the task
function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const projectId = document.getElementById("taskProject").value;
  const status = document.getElementById("taskStatus").value;
  const deadline = document.getElementById("taskDeadline").value;

  // Collect checked employees
  const selectedEmployees = [];
  document
    .querySelectorAll("#taskEmployeeList input:checked")
    .forEach((chk) => {
      selectedEmployees.push(chk.value);
    });

  if (!title || selectedEmployees.length === 0) {
    alert("Please fill all fields and select employees.");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    assignedEmployees: selectedEmployees,
    status,
    deadline,
  };

  // Insert task inside correct project
  const project = projects.find((p) => p.id == projectId);
  project.tasks.push(task);

  // 🔥 RESET PROJECT STATUS
  project.status = "Active";

  localStorage.setItem("projects", JSON.stringify(projects));

  closeTaskModal();
  loadTaskList();
  loadProjectList();
  loadDashboardCounts();
}

//for display tasks
function loadTaskList() {
  const box = document.getElementById("taskList");
  box.innerHTML = "";

  let hasTasks = false;

  projects.forEach((project) => {
    if (project.tasks.length === 0) return;

    hasTasks = true;

    box.innerHTML += `
      <h3 class="task-project-title">${project.name.toUpperCase()}</h3>
    `;

    project.tasks.forEach((task) => {
      box.innerHTML += `
            <div class="task-card ${isTaskOverdue(task) ? "overdue-card" : ""}">

              <div class="task-header">
                <h3>${task.title.toUpperCase()}</h3>

                <span class="status ${task.status
                  .toLowerCase()
                  .replace(" ", "-")}">
                  ${task.status}
                </span>
              </div>
              <p class="task-employees">
                <b>Employees:</b> ${task.assignedEmployees.join(", ")}
              </p>

              <p class="task-deadline">
                <b>Deadline:</b>
                <span class="${isTaskOverdue(task) ? "overdue" : ""}">
                  ${task.deadline || "N/A"}
                </span>
              </p>

              <div class="task-footer">
                <select onchange="updateTaskStatus(${project.id}, ${
                  task.id
                }, this.value)">
                  <option value="Pending" ${
                    task.status === "Pending" ? "selected" : ""
                  }>Pending</option>
                  <option value="In Progress" ${
                    task.status === "In Progress" ? "selected" : ""
                  }>In Progress</option>
                  <option value="Completed" ${
                    task.status === "Completed" ? "selected" : ""
                  }>Completed</option>
                </select>

                <div class="task-actions">
                  <button 
                    onclick="markTaskCompleted(${project.id}, ${task.id})"
                    ${task.status === "Completed" ? "disabled" : ""}
                    class="complete-btn"
                  >
                    Complete
                  </button>

                  <button 
                    onclick="deleteTask(${project.id}, ${task.id})"
                    class="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          `;
    });
  });
  loadDashboardCounts();
  loadProjectList();
  if (!hasTasks) {
    box.innerHTML = "<p class='empty'>No tasks are added.</p>";
    return;
  }
}
function isTaskOverdue(task) {
  if (!task.deadline) return false;
  if (task.status === "Completed") return false;

  const today = new Date().toISOString().split("T")[0];
  return task.deadline < today;
}

//update task status function
function updateTaskStatus(projectId, taskId, newStatus) {
  const project = projects.find((p) => p.id === projectId);
  const task = project.tasks.find((t) => t.id === taskId);

  task.status = newStatus;

  // ✅ Update project readiness (not completion)
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
  loadProjectList();
  loadDashboardCounts();
}
function markTaskCompleted(projectId, taskId) {
  const project = projects.find((p) => p.id === projectId);
  const task = project.tasks.find((t) => t.id === taskId);

  if (!task) return;

  task.status = "Completed";

  // 🔄 Update project readiness (not completion)
  if (
    project.tasks.length > 0 &&
    project.tasks.every((t) => t.status === "Completed")
  ) {
    project.status = "Ready to Complete";
  }

  localStorage.setItem("projects", JSON.stringify(projects));

  loadTaskList();
  loadProjectList();
  openTaskListForProject(projectId);
  loadDashboardCounts();
}

//delete task
function deleteTask(projectId, taskId) {
  let project = projects.find((p) => p.id === projectId);
  project.tasks = project.tasks.filter((t) => t.id !== taskId);

  // ✅ reset status correctly
  if (project.tasks.length === 0) {
    project.status = "Active";
  } else if (project.tasks.every((t) => t.status === "Completed")) {
    project.status = "Ready to Complete";
  } else {
    project.status = "Active";
  }

  localStorage.setItem("projects", JSON.stringify(projects));
  loadTaskList();
  loadProjectList();
  loadDashboardCounts();
}

//for task model open and close
function openTaskModal() {
  document.getElementById("taskModal").classList.remove("hidden");

  // Load Projects
  const projectDrop = document.getElementById("taskProject");
  projectDrop.innerHTML = "";
  projectDrop.innerHTML = "<option value=''>Select</option>";
  projects.forEach((p) => {
    projectDrop.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  // Load Employees as CHECKBOXES
  const empList = document.getElementById("taskEmployeeList");
  empList.innerHTML = "";

  users
    .filter((u) => u.role === "employee" && u.isApproved)
    .forEach((e) => {
      empList.innerHTML += `
                <label class="emp-check">
                    <input type="checkbox" value="${e.username}">
                    ${e.fullname}
                </label> <br>
            `;
    });
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDeadline").value = "";
}

function closeAllModals() {
  document.getElementById("projectModal")?.classList.add("hidden");
  document.getElementById("taskModal")?.classList.add("hidden");
}

//dispaly dashboard
function loadDashboardCounts() {
  // ✅ total approved users (excluding admin)
  const total = users.filter((u) => u.isApproved && u.role !== "admin").length;
  document.getElementById("totalUsers").innerText = total;

  //total managers
  const totalMan = users.filter(
    (u) => u.isApproved && u.role === "manager",
  ).length;
  document.getElementById("totalManagers").innerText = totalMan;

  //total employees
  const totalEmp = users.filter(
    (u) => u.isApproved && u.role === "employee",
  ).length;
  document.getElementById("totalEmployees").innerText = totalEmp;

  // ⏳ pending approvals
  const pending = users.filter(
    (u) => !u.isApproved && u.role !== "admin",
  ).length;
  document.getElementById("pendingUsersCount").innerText = pending;

  // 📦 projects count
  document.getElementById("projectCount").innerText = projects.length;

  //total projects completed
  let totalProCount = projects.filter((p) => p.status === "Completed").length;
  document.getElementById("completedProjectsCount").innerText = totalProCount;

  // 🧩 total tasks across projects
  let totalTasks = 0;
  projects.forEach((p) => (totalTasks += p.tasks.length));
  document.getElementById("taskCount").innerText = totalTasks;

  // 🧩 total tasks completed across projects
  let totalTasksCompleted = 0;
  projects.forEach(
    (p) =>
      (totalTasksCompleted += p.tasks.filter(
        (t) => t.status == "Completed",
      ).length),
  );
  document.getElementById("completedtaskCount").innerText = totalTasksCompleted;
}

// REAL-TIME STORAGE UPDATE LISTENER
window.addEventListener("storage", (event) => {
  if (event.key === "users" || event.key === "projects") {
    users = JSON.parse(localStorage.getItem("users")) || [];
    projects = JSON.parse(localStorage.getItem("projects")) || [];

    loadPendingUsers();
    loadApprovedUsers();
    loadProjectList();
    loadTaskList();
    loadDashboardCounts();
  }
});

// INITIAL PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
  loadPendingUsers();
  loadApprovedUsers();
  loadProjectList();
  loadTaskList();
  loadDashboardCounts();
});
