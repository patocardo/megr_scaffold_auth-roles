import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box
} from '@material-ui/core';
import BannerAlert from '../components/BannerAlert';
  
type RenewTokenPropsType = {
}

export default function RenewToken(props: RenewTokenPropsType) {

  return (
    <>
      <BannerAlert
        severity="error"
        isOpen={true}
        title={'404 - Not Found'}
        body={`The route you are asking doesn't exists or you don't have authorization to access there`}
      />
      <Box justifyContent="center" p={2}>
          <Link to="/">Go To Home</Link>
      </Box>
    </>
  )
}