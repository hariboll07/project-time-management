const currentUserRaw = localStorage.getItem("currentUser");

if (!currentUserRaw) {
  window.location.replace("../index.html");
}

const currentUser = JSON.parse(currentUserRaw);

if (currentUser.role !== "employee") {
  window.location.replace("../index.html");
}

let projects = JSON.parse(localStorage.getItem("projects")) || [];

function logout() {
  if (confirm("Logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  }
}

function showSection(sectionId) {
  document
    .querySelectorAll(".section")
    .forEach((sec) => sec.classList.add("hidden"));

  document.getElementById(sectionId).classList.remove("hidden");

  if (sectionId === "dashboard") loadDashboardCounts();
  if (sectionId === "projects") loadMyProjects();
  if (sectionId === "tasks") loadMyTasks();
}

function getMyTasks() {
  let tasks = [];

  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (task.assignedEmployees.includes(currentUser.username)) {
        tasks.push({ ...task, projectName: project.name });
      }
    });
  });

  return tasks;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getMyProjects() {
  let myProjects = [];

  projects.forEach((project) => {
    const hasMyTask = project.tasks.some((task) =>
      task.assignedEmployees.includes(currentUser.username),
    );

    if (hasMyTask) {
      myProjects.push(project);
    }
  });

  return myProjects;
}

function loadDashboardCounts() {
  const tasks = getMyTasks();
  const myProjects = getMyProjects();
  const today = getTodayDate();

  document.getElementById("taskCount").innerText = tasks.length;
  document.getElementById("completedTaskCount").innerText = tasks.filter(
    (t) => t.status === "Completed",
  ).length;

  document.getElementById("pendingTaskCount").innerText = tasks.filter(
    (t) => t.status !== "Completed",
  ).length;

  document.getElementById("projectCount").innerText = myProjects.length;

  document.getElementById("overdueProjectCount").innerText =
    myProjects.filter(isProjectOverdue).length;

  document.getElementById("overdueTaskCount").innerText =
    tasks.filter(isTaskOverdue).length;

  document.getElementById("dueTodayCount").innerText = tasks.filter(
    (t) => t.deadline === today && t.status !== "Completed",
  ).length;
}

function loadMyProjects() {
  const box = document.getElementById("projectList");
  box.innerHTML = "";

  const myProjects = getMyProjects();

  if (myProjects.length === 0) {
    box.innerHTML = "<p>No projects assigned.</p>";
    return;
  }

  myProjects.forEach((project) => {
    box.innerHTML += `
      <div class="project-row ${isProjectOverdue(project) ? "overdue-card" : ""}" style="padding:30px">
        <div class="left">
          <h3>
            ${project.name.toUpperCase()}
          </h3>

          <p>
            Deadline:
            <span>${project.deadline}</span>
          </p>
        </div>

        <div class="right">
          <p style="color:red">Status: <b style=${project.status == "Active" ? "color:orange" : project.status == "Ready to Complete" ? "color:lightgreen" : "color:darkgreen"} >${project.status}</b></p>
          <p style="color:#4B5700">Tasks: ${project.tasks.length}</p>
        </div>
      </div>
    `;
  });
}

function loadMyTasks() {
  const box = document.getElementById("taskList");
  box.innerHTML = "";

  const tasks = getMyTasks();

  if (tasks.length === 0) {
    box.innerHTML = "<p>No tasks assigned.</p>";
    return;
  }

  tasks.forEach((task) => {
    box.innerHTML += `
      <div class="task-card ${isTaskOverdue(task) ? "overdue-card" : ""}">
        <div class="task-header" style="padding-bottom:10px">
          <h3 style="color:#57004E;font-weight:800px">${task.title.toUpperCase()}</h3>
          <div>
            <span class="status ${task.status.toLowerCase().replace(" ", "-")}">
              ${task.status}
            </span>
            ${isTaskOverdue(task) ? `<span class="overdue-tag">OVERDUE</span>` : ""}
          </div>
        </div>


        <p style="color:#75580F;padding-bottom:5px;font-size:20px;font-weight:800px"><b style="color:#BF391F;font-weight:600px">Project:</b> ${task.projectName}</p>
        <p style="color:#C40000;padding-bottom:5px;font-size:20px;font-weight:800px"><b style="color:#9C2222;font-weight:600px">Deadline:</b> ${task.deadline || "N/A"}</p>

        <div class="task-footer">
          <select onchange="updateTaskStatus(${task.id}, this.value)">
            <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${task.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </div>
      </div>
    `;
  });
}

function updateTaskStatus(taskId, status) {
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (task.id === taskId) {
        task.status = status;
      }
    });

    // 🔥 project status recalculation
    if (
      project.tasks.length > 0 &&
      project.tasks.every((t) => t.status === "Completed")
    ) {
      project.status = "Ready to Complete";
    } else {
      project.status = "Active";
    }
  });

  localStorage.setItem("projects", JSON.stringify(projects));

  loadMyTasks();
  loadMyProjects(); // 🔥 ADD
  loadDashboardCounts();
}
function isProjectOverdue(project) {
  if (!project.deadline) return false;
  if (project.status === "Completed") return false;

  const today = new Date().toISOString().split("T")[0];
  return project.deadline < today;
}

function isTaskOverdue(task) {
  if (!task.deadline) return false;
  if (task.status === "Completed") return false;

  const today = new Date().toISOString().split("T")[0];
  return task.deadline < today;
}
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardCounts();
});
