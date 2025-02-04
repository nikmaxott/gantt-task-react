import React from "react";
import { Task, ViewMode, Gantt } from "../src";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";

import MyTaskListBody from "./components/custom-body";
import MyTaskListHeader from "./components/custom-header";
import MyTaskListBodyCustom from "./components/custom-type-body";
import MyToolTip from "./components/custom-tooltip";
import MyTaskListTable from "./components/custom-table";

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initTasks());
  const [delayedTasks, setDelayedTasks] = React.useState<Task[]>([]);
  const [isChecked, setIsChecked] = React.useState(true);
  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleCustomSelect = (task: CustomTask) => {
    console.log(
      task.name +
        (task.hasExtraField
          ? " has an extra field"
          : " doesn't have an extra field")
    );
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  const handleDelayedExpanderClick = (task: Task) => {
    setDelayedTasks(delayedTasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  React.useEffect(() => {
    const delay = 5000; // 5 seconds
    const timer = setTimeout(() => {
      setDelayedTasks(tasks);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <h3>Gantt With Unlimited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        columnWidth={columnWidth}
        rowHeight={30}
      />
      <h3>Gantt With Fixed Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        ganttHeight={300}
        columnWidth={columnWidth}
      />
      <h3>Gantt with Delayed Tasks</h3>
      <Gantt
        tasks={delayedTasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleDelayedExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        columnWidth={columnWidth}
        rowHeight={30}
      />
      <h3>Gantt With Custom Popup</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        columnWidth={columnWidth}
        rowHeight={30}
        TooltipContent={MyToolTip}
      />
      <h3>Gantt with Custom Header and Body</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        columnWidth={columnWidth}
        rowHeight={30}
        TaskListHeader={MyTaskListHeader}
        TaskListBody={MyTaskListBody}
      />
      <h3>Gantt with Custom Type, Header and Body</h3>
      <Gantt<CustomTask>
        tasks={tasks.map(t => ({ ...t, hasExtraField: Math.random() > 0.5 }))}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleCustomSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? 155 : 0}
        columnWidth={columnWidth}
        rowHeight={30}
        TaskListHeader={MyTaskListHeader}
        TaskListBody={MyTaskListBodyCustom}
      />
      <h3>Gantt with Custom Table</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        ganttHeight={200}
        columnWidth={columnWidth}
        TaskListTable={(props: {
          tasks: Task[];
          taskListRef: React.RefObject<HTMLTableElement | null>;
          scrollY: number;
          selectedTaskId?: string;
          setSelectedTask: (taskId: string) => void;
          onExpanderClick: (task: Task) => void;
        }) => {
          return <MyTaskListTable {...props} />;
        }}
      />
    </div>
  );
};

export interface CustomTask extends Task {
  hasExtraField: boolean;
}

export default App;
