import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
  Typography,
  Input,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import { validate } from 'email-validator';
import useGraphQL from '../utils/use-graphql';
import { IError } from '../globals/error-handling';
import useFormStyles from '../utils/use-form-styles';
import usePassword from '../utils/use-password';

type RoleType = {
  roleId: string,
  name: string
}
type UserType = {
  userId: string,
  name: string,
  email: string,
  roles: RoleType[]  
}
type UserStateType = UserType & {password: string, passwordRepeat: string };

type UserEditInputType = {
  individualData: UserType,
  allRoles: {
    roleId: string,
    name: string
  }[],
  setIndividual: (id: string) => void
}

type userByIdDataType = {
  userById: UserType
}
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const errorInputs = {
  name: false,
  email: false,
  roles: false,
  password: false,
  passwordRepeat: false
};

export default function UserEdit(props: UserEditInputType) {
  const {individualData, allRoles, setIndividual} = props;
  const formClasses = useFormStyles();
  const [ data, setData ] = useState<UserStateType>({...individualData, password: '', passwordRepeat: ''});
  const [ changePass, setChangePass ] = useState(data.userId === '_');
  const userData = useGraphQL<userByIdDataType>('post');
  const [ status, setStatus ] = useState('input');
  const [ missing, passValidate ] = usePassword();
  const [ inputError, setInputError ] = useState(errorInputs);

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

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setData({...data, [field]: evt.target.value})
    }
  }

  function handleCheckPass(event: React.ChangeEvent<HTMLInputElement>) {
    setChangePass(event.target.checked);
  }
  function isRoleSelected(roleId: string): boolean {
    return data.roles.some(role => role.roleId === roleId);
  }

  function handleRolesChange(event: React.ChangeEvent<{ value: unknown }>){
    console.log('event.target.value', event.target.value);
    if(!data || !Array.isArray(data.roles) || !Array.isArray(allRoles)) return;
    const ids = (event.target.value as string[]);
    const roles = allRoles.filter(role => ids.includes(role.roleId));
    setData({...data, roles});
  }

  function saveUser(/* evt: React.FormEvent<HTMLFormElement> */) {
    // evt.preventDefault();
    if (Object.values(inputError).some(ierr => ierr)) return false;
    setStatus('sending');
  }

  function cancelEdit() {
    setData({...individualData, password: '', passwordRepeat: ''});
    setInputError(errorInputs);
  }

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
    <Container>
      <form action="">
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
            <Select
              multiple
              required
              fullWidth
              label="Roles"
              value={data.roles.map(role => role.roleId)}
              input={<Input />}
              renderValue={(selected) => {
                if(selected && !Array.isArray(selected)) return '';
                return allRoles
                  .filter(role => (selected as string[]).includes(role.roleId))
                  .map(role => role.name).join(', ')
              }}
              onChange={handleRolesChange}
              MenuProps={MenuProps}
            >
              {allRoles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  <Checkbox checked={isRoleSelected(role.roleId)} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <FormControl className={formClasses.formControl}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={changePass}
                    onChange={handleCheckPass}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label="Edit Password"
              />
            </FormControl>
          </Grid>
          {
            changePass && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    name="password"
                    type="password"
                    label="Password"
                    fullWidth
                    value={data.password}
                    onChange={handleText('password')}
                    error={inputError.password}
                    helperText={inputError.password && 'Password does not fulfill rules'}
                  />
                  {
                    inputError.password && (
                      <>
                        <Typography variant="h6">
                          Password needs to fulfill the following rules
                        </Typography>
                        <div>
                          <List dense={true}>
                            {missing.map((rule) => (
                              <ListItem>
                                <ListItemText
                                  primary={rule}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </div>
                      </>
                    )
                  }
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    name="passwordRepeat"
                    type="password"
                    label="Repeat Password"
                    fullWidth
                    value={data.password}
                    onChange={handleText('passwordRepeat')}
                    error={inputError.passwordRepeat}
                    helperText={inputError.passwordRepeat && 'Both passwords must be equals'}
                  />
                </Grid>
              </>
            )
          }
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <FormControl className={formClasses.formControl}>
              <Button variant="contained" onClick={cancelEdit}>Cancel</Button>
            </FormControl>
            <FormControl className={formClasses.formControl}>
              <Button variant="contained" color="primary" onClick={saveUser}>
                Save
              </Button>
            </FormControl>
          </Box>
        </Grid>
      </form>
    </Container>
  );
}

