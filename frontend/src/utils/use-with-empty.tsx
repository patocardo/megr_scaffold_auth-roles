import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';

type WithEmptyType<T> = {
  data: T[],
  children: (rows: T[]) => ReactElement
}

type useWEResultType<T> = {
  WithEmpty: (props: WithEmptyType<T>) => ReactElement,
}

export default function useWithEmpty<T>(message?: string): useWEResultType<T> {
  message = message || 'There is no data to display';

  const WithEmpty = (props: WithEmptyType<T>) => {
    const { data, children } = props;
    if(data.length > 0) {
      return children(data);
    }
    return (<Box>{message}</Box>)

  }

  return { WithEmpty };
}
