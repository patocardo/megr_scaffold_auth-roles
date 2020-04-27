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
  Input,
  Select,
  MenuItem,
  CircularProgress
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { validate } from 'email-validator';
import useCummulativeDelay from '../utils/use-delay';
import useWithEmpty from '../utils/use-with-empty';
import useGraphQL from '../utils/use-graphql';
import EnhancedTable from './EnhancedTable';
import { IError } from '../globals/error-handling';
import { StateContext } from '../globals/context';
import useFormStyles from '../utils/use-form-styles';
import usePassword from '../utils/use-password';

type UserEditInputType = {
  userId: string,
  name: string,
  email: string,
  roles: {
    roleId: string,
    name: string
  }[]
}

type userByIdDataType = {
  userById: UserEditInputType
}

export default function UserEdit(props: UserEditInputType) {
  const {...initialData } = props;
  const classes = useFormStyles();
  const [ data, setData ] = useState({...initialData, password: '', passwordRepeat: ''});
  const [ changePass, setChangePass ] = useState(data.userId === '_');
  const userData = useGraphQL<userByIdDataType>('post');
  const [ status, setStatus ] = useState('input');
  const [ missing, passValidate ] = usePassword();
  const [ inputError, setInputError ] = useState({
    name: false,
    email: false,
    roles: false,
    password: false,
    passwordRepeat: false
  });

  useEffect(() => {
    const validation = {
      name: data.name.length < 4,
      email: !validate(data.email),
      roles: data.roles.length === 0,
      password: false,
      passwordRepeat: false
    };
    if (changePass){
      validation.password = !passValidate(data.password);
      validation.passwordRepeat = data.password !== data.passwordRepeat;
    }
    setInputError(validation); 
  }, [data]);

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setData({...data, [field]: evt.target.value})
    }
  }
  function handleSelect(field: string, multiple: boolean = false) {
    return (evt: React.ChangeEvent<HTMLSelectElement>) => {
      console.log(evt.target.value);
      // setData({...data, [field]: evt.target.value})
    }
  }
  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (Object.values(inputError).some(ierr => ierr)) return false;
    setStatus('sending');
  }

  useEffect(() => {
    if (status === 'sending') {
      const resolver = (data.userId === '_') ? 'userCreate(' : `userUpdate(id: "${data.userId}", `;
      const hasPass = (changePass) ? `, password: "${data.password}` : '';
      const cargo = `mutation {
        ${resolver}userInput: {
          name: "${data.name}",
          email: "${data.email}",
          roles: [${data.roles.map(role => '"' + role.roleId + '"').join(', ')}]
          ${hasPass}
        }){
          userId: _id
          name
          email
          roles: {
            roleId: _id
            name
          }
        }
      }`;
      userData.fetchData(cargo, true);
    }
  }, [status]);

  useEffect(() => {
    if(userData.result?.data?.userById) {
      setData({...userData.result.data.userById, password: '', passwordRepeat: ''});     
    }

  }, [userData.result]);

  if (status === 'sending') {
    return (
      <Container>  
        <Grid container>
          <Grid item xs={12} justify="center">
            <Typography>Saving User's data</Typography>
          </Grid>
          <Grid item xs={12} justify="center">
            <CircularProgress />
          </Grid>
        </Grid>
      </Container>
    );
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
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={data.roles}
              onChange={handleSelect('roles', true)}
              input={<Input />}
              MenuProps={MenuProps}
            >
              {roles.map((role) => (
                <MenuItem key={role.doleId} value={role.roleId}>
                  {role.name}
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
