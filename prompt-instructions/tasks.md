# Tasks

1. TaskSchedule and TaskGroup tables should have a sortOrder column to determine the order in which tasks and groups are displayed.

2. User should be able to drag each TaskItemGroup to reorder the groups, and the new order should be saved to the TaskGroup table using the sortOrder column.

3. User should be able to drag each TaskItem within a TaskItemGroup to reorder the tasks, and the new order should be saved to the TaskSchedule table using the sortOrder column.

4. User cannot move a task from one group to another.

5. The UI should immediately reflect changes in order and group membership after a drag-and-drop action so that users see the updated task positions without needing to refresh.

6. Any changes made to the order or group membership should be persisted to the backend so that when the page is reloaded, the tasks and groups maintain their updated positions.