import React, { ReactElement } from 'react';
import { Box, Typography, CircularProgress } from '@material-ui/core';

type DataWrapperPropsType<T> = {
  isEmpty: boolean,
  isLoading: boolean,
  emptyMessage?: string,
  loadingMessage?: string,
  children: ReactElement
}

export default function DataWrapper<T>(props: DataWrapperPropsType<T>) {
  const { isEmpty, isLoading, children,
    emptyMessage = 'There is no data to display',
    loadingMessage = 'Data is loading'
  } = props;
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
        <Typography  variant="h6" gutterBottom>{loadingMessage}</Typography>
      </Box>      
    )
  }
  if (isEmpty) {
    return (
      <Box display="flex" justifyContent="flex-end">
        <Typography  variant="h6" gutterBottom>{emptyMessage}</Typography>
      </Box>
    )
  }
  return children;
}