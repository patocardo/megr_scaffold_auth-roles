import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
  ListItemText,
} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { validate } from 'email-validator';
import useGraphQL from '../utils/use-graphql';
import { ErrorType, hasErrors } from '../globals/error-handling';
import useFormStyles from '../utils/use-form-styles';
import BannerAlert from './BannerAlert';
import PasswordInput from './PasswordInput';

type UserType = {
  userId: string,
  name: string,
  email: string,
  roles: string[]  
}
type UserStateType = UserType & {password: string, passwordRepeat: string };

type RoleType = {
  roleId: string,
  name: string,
  description: string
}

type rolesDataType = {
  roles: RoleType[]
}

type userDataType = {userResponse: UserType};

const newData: UserType = {
  userId: '_',
  name: '',
  email: '',
  roles: [],
}

const newDataWithPass: UserStateType = {...newData, password: '', passwordRepeat: ''};

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

const rtrnAPI = `{
  userId: _id
  name
  email
  roles {
    roleId: _id
  }
}`;

// export default function UserEdit(props: UserEditInputType) {
//   const {individualData, allRoles, setIndividual} = props;
export default function UserEdit() {
  const formClasses = useFormStyles();
  const [ data, setData ] = useState<UserStateType>(newDataWithPass);
  const [ changePass, setChangePass ] = useState(data.userId === '_');
  const userData = useGraphQL<userDataType>('post', {userResponse: newData});
  const rolesData = useGraphQL<rolesDataType>('post', {roles: []});
  const [ status, setStatus ] = useState('input');
  const [ inputError, setInputError ] = useState(errorInputs);
  const passError = useRef({password: false, passwordRepeat: false});
  const history = useHistory();
  const {id} = useParams();
  const allRoles: RoleType[] = rolesData?.result?.data?.roles || [];

  useEffect(() => {
    if (!id) history.push('/users');
    rolesData.fetchData(`
      query {
        roles {
          roleId: _id
          name
          description
        }
      }
    `, true);
    if (id !== '_') {
      userData.fetchData(`
        query{
          userResponse: userById(id:"${id}") ${rtrnAPI}
        }`, true, 'get');
    }
  }, []);

  useEffect(() => {
    const validation = {
      name: data.name.length < 4,
      email: !validate(data.email),
      roles: data.roles.length === 0,
      password: false,
      passwordRepeat: false
    };
    if (changePass){
      validation.password = passError.current.password;
      validation.passwordRepeat = passError.current.passwordRepeat;
    }
    setInputError(validation); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (status === 'sending') {
      const resolver = (data.userId === '_') ? 'userCreate(' : `userUpdate(id: "${data.userId}", `;
      const hasPass = (changePass) ? `, password: "${data.password}"` : '';
      const cargo = `mutation {
        userResponse: ${resolver}userInput: {
          name: "${data.name}",
          email: "${data.email}",
          roles: ["${data.roles.join('", "')}"]
          ${hasPass}
        })${rtrnAPI}
      }`;
      const flag = (data.userId === '_') ? 'create' : 'update';
      userData.fetchData(cargo, true, flag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {

    const rtrnData = userData?.result && userData.result.data && userData.result.data.userResponse;
    if (userData?.result && rtrnData) {
      if (['create', 'update'].includes((userData.result.flags as string))) {
        setData({...rtrnData, password: '', passwordRepeat: ''});
        setStatus('saved');  
      }
      if(userData.result.flags === 'create') {
        history.replace(`/user/${rtrnData.userId}`);
      }
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.result]);

  useEffect(() => {
    if (hasErrors(userData.errors)) {
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.errors]);

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setData({...data, [field]: evt.target.value})
    }
  }

  function handleCheckPass(event: React.ChangeEvent<HTMLInputElement>) {
    setChangePass(event.target.checked);
  }
  function isRoleSelected(roleId: string): boolean {
    return data.roles.includes(roleId);
  }

  function handleRolesChange(event: React.ChangeEvent<{ value: unknown }>){
    const roles = (event.target.value as string[]);
    setData({...data, roles});
  }

  function handlePassChange(name: 'password' | 'passwordRepeat') {
    return (value: string, hasError: boolean) => {
      passError.current[name] = hasError;
      setData(prev => ({...prev, [name]: value}));
    }
  }

  function saveUser() {
    if (Object.values(inputError).some(ierr => ierr)) return false;
    setStatus('sending');
  }

  function cancelEdit() {
    if(userData.result && userData.result.data) {
      setData({...userData.result.data.userResponse, password: '', passwordRepeat: ''});
    }
  }

  if (status === 'sending') {
    return (
      <Container>  
        <Grid container justify="center">
          <Grid item xs={12}>
            <Typography>Saving User's data</Typography>
          </Grid>
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container>
      <Box m={1}>
        <Button
          variant="text"
          color="primary"
          size="small"
          startIcon={<ArrowBackIosIcon />}
          onClick={() => history.push('/users')}
        >
          Return to list
        </Button>        
      </Box>
      <BannerAlert
        severity="success"
        isOpen={status === 'saved'}
        closeFn={() => setStatus('input')}
        title="User saved"
        body={'Data of user ' + data.name + ' was successfully saved on DataBase'}
      />
      <BannerAlert
        severity="error"
        isOpen={status === 'error'}
        closeFn={() => setStatus('input')}
        title="Error while saving User's data"
        body={userData.errors || 'Server error'}
      />
      <Box m={2}>
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
              value={data.roles}
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
                  <ListItemText secondary={role.description} />
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {
            data.userId !== '_' && (
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
            )
          }
          {
            changePass && (
              <>
                <Grid item xs={12} sm={6}>
                  <PasswordInput
                    fieldId={'pass_' + data.userId}
                    onChange={handlePassChange('password')}
                    className={formClasses.formControl}
                    validation="rules"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PasswordInput
                    fieldId={'pass-rep_' + data.userId}
                    onChange={handlePassChange('passwordRepeat')}
                    className={formClasses.formControl}
                    validation="repeat"
                    original={data.password}
                    label="Repeat Password"
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
      </Box>
    </Container>
  );
}

