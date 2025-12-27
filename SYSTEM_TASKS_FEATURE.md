
# System Enhancements: Shared Task Management

We have upgraded the **ToDo List** feature from a simple admin-only tool to a full-fledged **Task Assignment System** accessible by Students and Faculty.

### 1. Backend (`backend/index.js`)
- **New Database**: Created `todos.json` to store tasks persistently.
- **New API Endpoints**:
    - `GET /api/todos`: Fetch tasks. Supports `?role=` filter (e.g., fetch only student tasks).
    - `POST /api/todos`: Create new tasks with `target` (Admin, Student, Faculty, All) and `dueDate`.
    - `PUT /api/todos/:id`: Update task status (completed) or details.
    - `DELETE /api/todos/:id`: Remove tasks.

### 2. Admin Dashboard
- **Enhanced Todo Modal**: Now includes fields for:
    - **Assigned To**: Select "Admin Only", "All Students", "All Faculty", or "Everyone".
    - **Due Date**: Optional date picker.
- **API Integration**: All todo operations (Create, Edit, Delete, Toggle) now sync with the server immediately.

### 3. Student & Faculty Dashboards
- **New Tasks Feature**: Added a "Tasks" icon (Clipboard) to the header/sidebar.
- **Notification Badge**: Shows a count of pending (incomplete) tasks assigned to their role.
- **Task List Dropdown**: Clicking the icon reveals a list of assigned tasks with their due dates and completion status.
- **Real-time Updates**: Tasks are fetched automatically along with other dashboard data.

### How to Use
1. **Admin**: Go to "ToDo List" tab -> Click "New Task" -> Select "All Students" in "Assigned To" -> User sees the task instantly.
2. **Student/Faculty**: Look for the yellow badge on the clipboard icon to see new assignments.
