import React, { ReactElement } from 'react';
import { Box, Typography, CircularProgress } from '@material-ui/core';

type DataWrapperPropsType<T> = {
  items: T[] | null,
  emptyMessage?: string,
  loadingMessage?: string,
  children: ReactElement
}

export default function DataWrapper<T>(props: DataWrapperPropsType<T>) {
  const { items, children,
    emptyMessage = 'There is no data to display',
    loadingMessage = 'Data is loading'
  } = props;
  if (!items) {
    return (
      <>
        <Box display="flex" justifyContent="center">
          <CircularProgress size={80} />
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography  variant="h6" gutterBottom>{loadingMessage}</Typography>
        </Box>
      </>
    )
  }
  if (Array.isArray(items) && items.length === 0) {
    return (
      <Box display="flex" justifyContent="flex-end">
        <Typography  variant="h6" gutterBottom>{emptyMessage}</Typography>
      </Box>
    )
  }
  return children;
}