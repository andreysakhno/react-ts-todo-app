import classNames from 'classnames';
import { useContext } from 'react';
import { DispatchContext, StateContext } from '../../../libs/state';
import { Actions, ErrorMessages } from '../../../libs/enums';
import { updateTodo } from '../../../api/todos';
import { setErrorMessage } from '../../../libs/helpers';

type Props = {
  hasActiveTodos: boolean;
};

export const ToggleAll: React.FC<Props> = ({ hasActiveTodos }) => {
  const { todos } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const handleToggleAll = () => {
    const notCompletedTodos = hasActiveTodos
      ? todos.filter(({ completed }) => !completed)
      : todos;

    dispatch({
      type: Actions.setLoader,
      payload: {
        isLoading: true,
        todoIds: notCompletedTodos.map(({ id }) => id),
      },
    });

    const toggledPromises = notCompletedTodos.map(({ id, completed }) =>
      updateTodo(id, { completed: !completed }),
    );

    Promise.allSettled(toggledPromises)
      .then(results => {
        let hasError = false;

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            dispatch({ type: Actions.update, payload: { todo: result.value } });
          }

          if (result.status === 'rejected') {
            hasError = true;
          }
        });

        if (hasError) {
          setErrorMessage(dispatch, ErrorMessages.FailedToUpdate);
        }
      })
      .finally(() => {
        dispatch({ type: Actions.setLoader, payload: { isLoading: false } });
      });
  };

  return (
    <button
      type="button"
      className={classNames('todoapp__toggle-all', {
        active: !hasActiveTodos,
      })}
      data-cy="ToggleAllButton"
      onClick={handleToggleAll}
      aria-label="toggle all button"
    />
  );
};
