import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { isEqual } from 'lodash';
import { useDebounce } from 'use-debounce';
import DataWrapper from './DataWrapper';
import useGraphQL from '../utils/use-graphql';
import EnhancedTable from './EnhancedTable';
import { BannerError } from '../globals/error-handling';
import usePrevious from '../utils/use-previous';
import useMultipleDelete from '../utils/use-multiple-delete';
import useFormStyles from '../utils/use-form-styles';

type FilterType = {
  search: string,
  roleId: string
}

type UserDataType = {
  userId: string,
  name: string,
  email: string,
  roles: {
    roleId: string
    name: string
  }[]
}

type UserDisplayType = {
  userId: string,
  name: string,
  email: string,
  roles: string
}

type RoleType = {
  roleId: string,
  name: string
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


export default function Users() {
  const [usersDisplay, setUsersDisplay] = useState<UserDisplayType[]>([]);
  const [filter, setFilter] = useState(initialFilter);
  const [debouncedFilter] = useDebounce(filter, 1000);
  const { data, errors, fetchData} = useGraphQL<UserDataType[] | null>(null);
  const prevUserData = usePrevious(data);
  const { data: rolesData, errors: rolesError, fetchData: fetchRoles } = useGraphQL<RoleType[]>([]);
  const classes = useFormStyles();
  const [searchText, setSearchText] = useState('');
  const history = useHistory();
  const mounted = useRef(false);
  const {MultiDelCompo, handleDelete} = useMultipleDelete({
    resolver: 'usersRemove',
    collection: data || [],
    getId: (user: UserDataType) => user.userId,
    getItemText: (user: UserDataType) => `${user.name}<${user.email}>`,
    modelNames: 'users'
  });

  useEffect(() => {
    if(!mounted.current) {
      fetchRoles( { expression: `query {
        roles {
          roleId: _id
          name
        }
      }`, isAuth: true});
      fetchData({ expression: makeListExpression(initialFilter), isAuth: true});  
      mounted.current = true;
    }
  }, [fetchRoles, fetchData]);

  useEffect(() => {
    fetchData({ expression: makeListExpression(debouncedFilter), isAuth: true});
  }, [debouncedFilter, fetchData]);

  useEffect(() => {
    if (!isEqual(data, prevUserData)) {
      const newUsers: UserDisplayType[] = (data === null)
        ? []
        : data.map((user: UserDataType) => ({
          ...user,
          roles: user.roles.map((role) => role.name).join(', ')
        }));

      setUsersDisplay(newUsers);
    }

  }, [data, prevUserData]);

  function handleSearch(evt: React.ChangeEvent<{ value: string }>) {
    setSearchText(evt.target.value);
    setFilter({...filter, search: evt.target.value})
  }

  function handleRole(evt: React.ChangeEvent<{ value: unknown }>) {
    setFilter({...filter, roleId: evt.target.value as string});
  }

  function handleEdit(id: string) {
    history.push('/user/' + id);
  }

  function handleAdd() {
    history.push('/user/_');
  }

  return (
    <Container>
     <MultiDelCompo />
      <BannerError
        message={`Error while fetching records of Users`}
        errors={[errors, rolesError]}
      /> 
      <Box>
        <FormControl variant="outlined" className={classes.formControl}>
          <TextField
            variant="outlined"
            margin="normal"
            id="search"
            label="Search by name and email"
            autoComplete="search"
            name="search"
            autoFocus
            onChange={handleSearch}
            value={searchText}
            InputProps={{
              endAdornment:(
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            
          />
        </FormControl>
        {
          Array.isArray(rolesData) && rolesData.length > 0 && (
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
                  <em>All</em>
                </MenuItem>
                {
                  Array.isArray(rolesData) && rolesData.map((role: RoleType) => {
                    return(<MenuItem value={role.roleId} key={role.roleId}>{role.name}</MenuItem>);
                  })
                }
              </Select>
            </FormControl>
          )
        }
      </Box>
      <DataWrapper<UserDataType> items={data}>
        <EnhancedTable
          headCells={headCells}
          rows={usersDisplay}
          title="Users"
          idName="userId"
          editFn={handleEdit}
          deleteFn={handleDelete}
          addFn={handleAdd}
        />
      </DataWrapper>

    </Container>
  );
}
