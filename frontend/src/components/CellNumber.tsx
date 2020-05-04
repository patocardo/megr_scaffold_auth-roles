import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  integer: {
    textAlign: 'right',
    width: (props: StyleProps) => props.leftSidePerc + '%'
  },
  decimal: {
    textAlign: 'left'
  }
});

type CellProps = {
  value: string,
  leftSidePerc?: number
}

type StyleProps = {
  leftSidePerc: number
}

export default function CellNumber(props: CellProps) {
  const { value, leftSidePerc = 50} = props;
  const classes = useStyles({leftSidePerc});
  const trimmed: string = value.toString().trim();
  let leftSide, rightSide;
  if (Number.isNaN(Number(trimmed))) {
    leftSide = trimmed;
    rightSide = '';
  } else {
    const decimal = trimmed.toString().match(/([.,]\d*)$/g);
    leftSide = parseInt(trimmed).toString();
    rightSide = decimal ? decimal[0] : '';

  }
  return (
    <Box display="flex">
      <div className={classes.integer}>{leftSide}</div>
      <div className={classes.decimal}>{rightSide}</div>
    </Box>
  );

}