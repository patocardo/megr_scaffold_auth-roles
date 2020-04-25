import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  // Button,
  // CssBaseline,
  TextField,
  FormControl,
  // FormControlLabel,
  // Checkbox,
  // Link,
  // Paper,
  Box,
  Grid,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  // CircularProgress
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import useCummulativeDelay from '../utils/use-delay';
import useWithEmpty from '../utils/use-with-empty';
import useGraphQL from '../utils/use-graphql';
import EnhancedTable from './EnhancedTable';
import { IError } from '../globals/error-handling';
import { StateContext } from '../globals/context';
import { validate } from 'email-validator';


type UserEditInputType = {
  userId: string,
  name: string,
  email: string,
  roles: {
    roleId: string,
    name: string
  }[]
}

export default function UserEdit(props: UserEditInputType) {
  const {...initialData } = props;
  const [ data, setData ] = useState(initialData);
  const [ inputError, setInputError ] = useState({
    name: false,
    email: false,
    roles: false
  });

  useEffect(() => {
    setInputError({
      name: data.name.length < 4,
      email: data.email.length > 0 && validate(data.email),
      roles: data.roles.length === 0
    })
    if 
  }, [data]);

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setData({...data, [field]: evt.target.value})
    }
  }

  return (
    <form action="" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        User details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            name="name"
            label="Name"
            value={data.name}
            fullWidth
            autoComplete="name"
            onChange={handleText('name')}
            error={inputError.name}
            helperText={inputError.name && 'Put a valid name'}
        />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            name="email"
            label="Email"
            fullWidth
            autoComplete="email"
            value={data.email}
            onChange={handleText('email')}
            error={inputError.email}
            helperText={inputError.email && 'Invalid email address'}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl className={classes.formControl}>
          <InputLabel id="demo-mutiple-name-label">Name</InputLabel>
          <Select
            labelId="demo-mutiple-name-label"
            id="demo-mutiple-name"
            multiple
            value={personName}
            onChange={handleChange}
            input={<Input />}
            MenuProps={MenuProps}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="address2"
            name="address2"
            label="Address line 2"
            fullWidth
            autoComplete="billing address-line2"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label="City"
            fullWidth
            autoComplete="billing address-level2"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="state" name="state" label="State/Province/Region" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="zip"
            name="zip"
            label="Zip / Postal code"
            fullWidth
            autoComplete="billing postal-code"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="country"
            name="country"
            label="Country"
            fullWidth
            autoComplete="billing country"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox color="secondary" name="saveAddress" value="yes" />}
            label="Use this address for payment details"
          />
        </Grid>
      </Grid>
    </form>
  );
}
*/
