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
  // Grid,
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    marginedTop: {
      marginTop: theme.spacing(2),
    }
  }),
);

type FilterType = {
  search: string,
  roleId: string
}

const initialFilter: FilterType = {
  search: '',
  roleId: ''
}

function makeListExpression(filter: FilterType): string {
  return `
    query {
      users(search: "${filter.search}", role: "${filter.roleId}") {
        userId: _id
        name
        email
        roles{
          roleId: _id
          name
        }
      }
    }
  `;
}

function makeDeleteExpression(ids: number[]): string {
  return `
    mutation {
      removeUsers(ids: ${ids}) {
        name
      }
    }
  `;
}

type usersDataType = {
  users: {
    userId: string,
    name: string,
    email: string,
    roles: {
      name: string
    }[]
  }[]
}

type userType = {
  userId: string,
  name: string,
  email: string,
  roles: string
}

type rolesDataType = {
  roles: {
    roleId: string,
    name: string
  }[]
}

export default function Users() {
  const [users, setUsers] = useState<userType[]>([]);
  const [individual, setIndividual] = useState('');
  const [errors, setErrors] = useState<IError[] | null>(null);
  const [filter, setFilter] = useState(initialFilter);
  const setDelayFilter = useCummulativeDelay(3000);
  const usersData = useGraphQL<usersDataType>('post');
  const rolesData = useGraphQL<rolesDataType>('post');
  const { WithEmpty } = useWithEmpty<userType>();
  const { state, dispatch } = useContext(StateContext);
  const classes = useStyles();

  const headCells = [
    {
      disablePadding: false,
      id: 'name',
      label: 'Name',
      numeric: false
    },
    {
      disablePadding: false,
      id: 'email',
      label: 'E-mail',
      numeric: false
    },
    {
      disablePadding: false,
      id: 'roles',
      label: 'Roles',
      numeric: false
    }
  ];
  useEffect(() => {
    console.log('por mount');
    rolesData.fetchData(`
      query {
        roles {
          roleId: _id
          name
        }
      }
    `, true);
    usersData.fetchData(makeListExpression(filter), true);
  }, []);

  useEffect(() => {
    console.log('por filter')
    usersData.fetchData(makeListExpression(filter), true);
  }, [filter]);

  useEffect(() => {
    if (usersData.result) {
      const { data, token } = usersData.result;
      if ( data && data?.users?.length > 0) {
        const newUsers: userType[] = data.users.map(user => ({
          ...user,
          roles: user.roles.map(role => role.name).join(', ')
        }));
        setUsers(newUsers)
      }
      if( token && state.loginInfo?.email) {
        dispatch({ type: 'SIGNEDIN', payload: { loginInfo: { email: state.loginInfo.email, token} }});
      }
    }

  }, [usersData.result]);

  function handleSearch(evt: React.ChangeEvent<HTMLInputElement>) {
    setDelayFilter(() => setFilter({...filter, search: evt.target.value}));
  }

  function handleRole(evt: React.ChangeEvent<{ value: unknown }>) {
    setDelayFilter(() => setFilter({...filter, roleId: evt.target.value as string}));
  }

  function handleEdit(id: string) {
    setIndividual(id);
  }

  const roles = rolesData?.result?.data?.roles || [];

/*
  if (individual) {
    const singleData = users.find(user => user.userId === individual) || {;
      userId: '_',
      name: '',
      email: '',
      roles: []
    }
    return <SingleUser {...singleData} />
  }
*/
  return (
    <Container>
      <Box>
        <FormControl variant="outlined" className={classes.formControl}>
          <TextField
            variant="outlined"
            margin="normal"
            id="search"
            label="Search by name and email"
            name="search"
            autoComplete="search"
            autoFocus
            onChange={handleSearch}
            value={filter.search}
          />
        </FormControl>
        {
          roles.length > 0 && (
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="filter-role-label" className={classes.marginedTop}>Role</InputLabel>
              <Select
                label="Filter by Role"
                labelId="filter-role"
                id="demo-simple-select"
                value={filter.roleId}
                onChange={handleRole}
                className={classes.marginedTop}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {
                  roles.map(role => (<MenuItem value={role.roleId} key={role.roleId}>{role.name}</MenuItem>))
                }
              </Select>
            </FormControl>
          )
        }
      </Box>
      <WithEmpty data={users}>
        {(rows: userType[]) => (
          <EnhancedTable
            headCells={headCells}
            rows={rows}
            title="Users"
            idName="userId"
            editFn={handleEdit}
          />
        )}
      </WithEmpty>
    </Container>
  );
}

