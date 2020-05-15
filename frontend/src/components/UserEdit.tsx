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
import useEffectDeep from '../utils/use-effect-deep';
import useGraphQL from '../utils/use-graphql';
import { BannerError } from '../globals/error-handling';
import useFormStyles from '../utils/use-form-styles';
import BannerAlert from './BannerAlert';
import PasswordInput from './PasswordInput';
import {Omit} from '../utils/types';

type UserType = {
  userId: string,
  name: string,
  email: string,
  roles: string[]  
}

type UserDataType = Omit<UserType, 'roles'> & {
  roles: {
    roleId: string
  }[]
}

type UserStateType = UserType & {password: string, passwordRepeat: string };

type RoleType = {
  roleId: string,
  name: string,
  description: string
}

const newData: UserDataType = {
  userId: '_',
  name: '',
  email: '',
  roles: [],
}

const newStateWithPass: UserStateType = {...newData, roles: [], password: '', passwordRepeat: ''};

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

export default function UserEdit() {
  const formClasses = useFormStyles();
  const [ info, setInfo ] = useState<UserStateType>(newStateWithPass);
  const [ changePass, setChangePass ] = useState(info.userId === '_');
  const { data, errors, flag, fetchData} = useGraphQL<UserDataType>(newData);
  const { data: rolesData, errors: rolesErrors, fetchData: fetchRolesData }= useGraphQL<RoleType[]>([]);
  const [ status, setStatus ] = useState('input');
  const [ inputError, setInputError ] = useState(errorInputs);
  const passError = useRef({password: false, passwordRepeat: false});
  const history = useHistory();
  const {id} = useParams();
  const mounted = useRef(false);

  useEffect(() => {
    if (!id) history.push('/users');
    if(!mounted.current) {
      fetchRolesData({ expression: `query {
        roles {
          roleId: _id
          name
          description
        }
      }`, isAuth: true});
      if (id !== '_') {
        fetchData({ expression: `query{
          userResponse: userById(id:"${id}") ${rtrnAPI}
        }`, isAuth: true, flag: 'get'});
      }
      mounted.current = true;
    }

  }, [fetchRolesData, history, fetchData, id]);

  useEffectDeep(() => {
    const {name, email, roles} = info;
    const validation = {
      name: name.length < 4,
      email: !validate(email),
      roles: roles.length === 0,
      password: false,
      passwordRepeat: false
    };
    if (changePass){
      validation.password = passError.current.password;
      validation.passwordRepeat = passError.current.passwordRepeat;
    }
    setInputError(validation); 

  }, [info, changePass]);

  useEffectDeep(() => {
    if (status === 'sending') {
      const {userId, password, name, email, roles} = info;
      const resolver = (userId === '_') ? 'userCreate(' : `userUpdate(id: "${userId}", `;
      const hasPass = (changePass) ? `, password: "${password}"` : '';
      const expression = `mutation {
        userResponse: ${resolver}userInput: {
          name: "${name}",
          email: "${email}",
          roles: ["${roles.join('", "')}"]
          ${hasPass}
        })${rtrnAPI}
      }`;
      const flag = (info.userId === '_') ? 'create' : 'update';
      fetchData({expression, isAuth: true, flag});
    }

  }, [status, info, changePass, fetchData]);

  useEffectDeep(() => {
    if (!!data) {
      if (['create', 'update'].includes(flag)) {
        setInfo({
          ...data,
          roles: data.roles.map(role => role.roleId),
          password: '',
          passwordRepeat: ''
        });
        setStatus('saved');  
      }
      if(flag === 'create') {
        history.replace(`/user/${data.userId}`);
      }
    } 
  }, [data, flag, history]);

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setInfo({...info, [field]: evt.target.value})
    }
  }

  function handleCheckPass(event: React.ChangeEvent<HTMLInputElement>) {
    setChangePass(event.target.checked);
  }
  function isRoleSelected(roleId: string): boolean {
    return info.roles.includes(roleId);
  }

  function handleRolesChange(event: React.ChangeEvent<{ value: unknown }>){
    const roles = (event.target.value as string[]);
    setInfo({...info, roles});
  }

  function handlePassChange(name: 'password' | 'passwordRepeat') {
    return (value: string, hasError: boolean) => {
      passError.current[name] = hasError;
      setInfo(prev => ({...prev, [name]: value}));
    }
  }

  function saveUser() {
    if (Object.values(inputError).some(ierr => ierr)) return false;
    setStatus('sending');
  }

  function cancelEdit() {
    if(!!data) {
      setInfo({
        ...data,
        roles: data.roles.map(role => role.roleId),
        password: '', 
        passwordRepeat: ''
      });
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
        body={'Data of user ' + info.name + ' was successfully saved on DataBase'}
      />
      <BannerError
        message="Error while saving User's data or retrieving from server"
        errors={[errors, rolesErrors]}
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
              value={info.name}
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
              value={info.email}
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
              value={info.roles}
              input={<Input />}
              renderValue={(selected) => {
                if(!selected || !Array.isArray(selected) || !Array.isArray(rolesData)) return '';
                return (rolesData as RoleType[])
                  .filter((role) => (selected as string[]).includes(role.roleId))
                  .map((role) => role.name).join(', ')
              }}
              onChange={handleRolesChange}
              MenuProps={MenuProps}
            >
              {Array.isArray(rolesData) && rolesData.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  <Checkbox checked={isRoleSelected(role.roleId)} />
                  <ListItemText primary={role.name} />
                  <ListItemText secondary={role.description} />
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {
            info.userId !== '_' && (
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
                    fieldId={'pass_' + info.userId}
                    onChange={handlePassChange('password')}
                    className={formClasses.formControl}
                    validation="rules"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PasswordInput
                    fieldId={'pass-rep_' + info.userId}
                    onChange={handlePassChange('passwordRepeat')}
                    className={formClasses.formControl}
                    validation="repeat"
                    original={info.password}
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

