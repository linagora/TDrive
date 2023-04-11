/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Button from 'components/buttons/button.jsx';
import Languages from 'app/features/global/services/languages-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Emojione from 'components/emojione/emojione';
import Loader from 'components/loader/loader.jsx';
import TasksService from 'app/deprecated/Apps/Tasks/Tasks.js';
import LeftIcon from '@material-ui/icons/KeyboardArrowLeftOutlined';

import './task-picker.scss';

export default class TaskPicker extends Component {
  /*
        props : {
            mode : "select_board" / "select_task"
        }
    */

  constructor(props) {
    super(props);
    this.tasks_collection_key = 'tasks_picker_' + Workspaces.currentWorkspaceId;
    this.collection_key = [];

    this.state = {
      taskRepository: Collections.get('task'),
      currentBoard: null,
      currentList: null,
      taskSelected: null,
      boardRepository: Collections.get('boards'),
    };
    Languages.addListener(this);
    Collections.get('boards').addListener(this);
    Collections.get('lists').addListener(this);
    Collections.get('tasks').addListener(this);
    Collections.get('boards').addSource(
      {
        http_base_url: 'tasks/board',
        http_options: {
          workspace_id: Workspaces.currentWorkspaceId,
        },
        websockets: [
          { uri: 'boards/' + Workspaces.currentWorkspaceId, options: { type: 'board' } },
        ],
      },
      this.tasks_collection_key,
    );
  }
  componentWillUnmount() {
    Languages.removeListener(this);
    Collections.get('boards').removeSource(this.tasks_collection_key);
    Collections.get('lists').removeSource(this.tasks_collection_key);
    Collections.get('tasks').removeSource(this.tasks_collection_key);
    Collections.get('boards').removeListener();
    Collections.get('lists').removeListener();
    Collections.get('tasks').removeListener();
  }
  selectBoard(board) {
    if (this.collection_key.indexOf(this.tasks_collection_key + '_' + board.id) < 0) {
      this.collection_key.push(this.tasks_collection_key + '_' + board.id);
      Collections.get('lists').addSource(
        {
          http_base_url: 'tasks/list',
          http_options: {
            board_id: board.id,
          },
          websockets: [{ uri: 'board_lists/' + board.id, options: { type: 'list' } }],
        },
        this.tasks_collection_key + '_' + board.id,
      );
      Collections.get('tasks').addSource(
        {
          http_base_url: 'tasks/task',
          http_options: {
            board_id: board.id,
          },
          websockets: [{ uri: 'board_tasks/' + board.id, options: { type: 'task' } }],
        },
        this.tasks_collection_key + '_' + board.id + '_tasks',
      );
    }
    this.setState({ currentBoard: board });
  }
  selectList(list) {
    this.setState({ currentList: list });
  }
  selectTask(task) {
    this.setState({ taskSelected: task });
  }
  submit() {
    if (this.props.mode === 'select_task' && this.state.taskSelected) {
      if (this.props.onChoose) {
        this.props.onChoose(this.state.taskSelected);
      }
    }
  }
  renderBoardPicker() {
    var boards = Collections.get('boards').findBy({ workspace_id: Workspaces.currentWorkspaceId });
    var loading =
      !Collections.get('boards').did_load_first_time[this.tasks_collection_key] &&
      boards.length === 0;
    return (
      <div className="boardPicker">
        {loading && (
          <div className="loading">
            <Loader color="#CCC" className="app_loader" />
          </div>
        )}
        {!loading &&
          boards.map(board => {
            return (
              <div className="picker_item" onClick={() => this.selectBoard(board)}>
                <div className="board_name_picker">
                  {board.emoji && (
                    <Emojione type={board.emoji} s16 className="board_emoji_picker" />
                  )}
                  <div className="text">{board.title}</div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }
  renderListPicker() {
    var loading =
      !Collections.get('lists').did_load_first_time[
        this.tasks_collection_key + '_' + this.state.currentBoard.id
      ];
    var lists = Collections.get('lists').findBy({ board_id: this.state.currentBoard.id });
    return (
      <div className="">
        {loading && (
          <div className="loading">
            <Loader color="#CCC" className="app_loader" />
          </div>
        )}
        {!loading &&
          lists
            .sort(
              (a, b) =>
                TasksService.getElementIndex(a, 'lists_' + a.board_id) -
                TasksService.getElementIndex(b, 'lists_' + b.board_id),
            )
            .map((item, index) => {
              return (
                <div
                  className="picker_item"
                  onClick={() => {
                    this.selectList(item);
                  }}
                >
                  <div className="colorBloc" style={{ backgroundColor: item.color }} />
                  <div className="text">{item.title}</div>
                </div>
              );
            })}
      </div>
    );
  }
  renderTaskPicker() {
    var loading =
      !Collections.get('tasks').did_load_first_time[
        this.tasks_collection_key + '_' + this.state.currentBoard.id + '_tasks'
      ];
    var tasks = Collections.get('tasks').findBy({
      board_id: this.state.currentBoard.id,
      list_id: this.state.currentList.id,
      archived: false,
    });
    return (
      <div className="item">
        {loading && (
          <div className="loading">
            <Loader color="#CCC" className="app_loader" />
          </div>
        )}
        {!loading &&
          (tasks || [])
            .sort(
              (a, b) =>
                TasksService.getElementIndex(a, 'tasks_' + a.list_id) -
                TasksService.getElementIndex(b, 'tasks_' + b.list_id),
            )
            .map((item, index) => (
              <div
                className={
                  'picker_item ' +
                  (this.state.taskSelected &&
                  this.props.mode === 'select_task' &&
                  this.state.taskSelected.id === item.id
                    ? 'is_selected'
                    : '')
                }
                onClick={() => {
                  this.selectTask(item);
                }}
              >
                <div className="text">{item.title}</div>
              </div>
            ))}
      </div>
    );
  }
  render() {
    return (
      <div className="taskPicker">
        {!this.state.currentBoard && (
          <div className="title">{Languages.t('scenes.apps.tasks.task')}</div>
        )}
        {this.state.currentBoard && !this.state.currentList && (
          <div className="title">
            <LeftIcon
              className="m-icon-small getback"
              onClick={() => {
                Collections.get('lists').removeListener();
                this.setState({ currentBoard: null });
              }}
            />
            {this.state.currentBoard.title}
          </div>
        )}
        {this.state.currentBoard && this.state.currentList && (
          <div className="title">
            <LeftIcon
              className="m-icon-small getback"
              onClick={() => {
                Collections.get('tasks').removeListener();
                this.setState({ currentList: null });
              }}
            />
            {this.state.currentBoard.title} - {this.state.currentList.title}
          </div>
        )}
        <div className="list">
          {!this.state.currentBoard && this.renderBoardPicker()}
          {this.state.currentBoard && !this.state.currentList && this.renderListPicker()}
          {this.state.currentBoard && this.state.currentList && this.renderTaskPicker()}
        </div>
        <div className="menu-buttons">
          {this.props.mode === 'select_task' &&
            this.state.taskSelected &&
            this.state.taskSelected.id && (
              <Button
                className="small"
                value={Languages.t('scenes.app.taskpicker.select', [], 'Sélectionner')}
                onClick={() => this.submit()}
              />
            )}
        </div>
      </div>
    );
  }
}
