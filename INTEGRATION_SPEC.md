# Dashboard API Integration Spec

## Essential Data Models

### User
- id: string
- name: string (req)
- email: string (req, unique)
- password: string (req, hashed)
- role: string (default: 'member')

### Project
- id: string
- name: string (req)
- description: string
- deadline: date (req)
- status: string (default: 'Planning')
- createdBy: string (user id)
- teamMembers: array[string] (user names/ids)

### Task
- id: string
- description: string (req)
- completed: boolean (default: false)
- assignedTo: string (user name)
- project_id?: string (project id)
- dueDate?: date
